import * as ast from "lively.ast";
import { arr, string, properties, classHelper } from "lively.lang";
import { moduleEnv } from "./system.js";
import { evalCodeTransform } from "lively.vm/lib/evaluator.js";
import { install as installHook, remove as removeHook, isInstalled as isHookInstalled } from "./hooks.js";

export { wrapModuleLoad, unwrapModuleLoad, instrumentSourceOfModuleLoad, getExceptions, setExceptions }

var isNode = System.get("@system-env").node;

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// helpers
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function canonicalURL(url) {
  // removes double slashes, doesn't resolve relative parts yet
  var m = url.match(/([^:]+:\/\/)(.*)/);
  if (m) {
    var protocol = m[1];
    url = m[2];
  }
  url = url.replace(/([^:])\/[\/]+/g, "$1/");
  return (protocol || "") + url;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// code instrumentation
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var node_modulesDir = System.normalizeSync("lively.modules/node_modules/");

var exceptions = [
      // id => id.indexOf(resolve("node_modules/")) > -1,
      // id => canonicalURL(id).indexOf(node_modulesDir) > -1,
      id => string.include(id, "acorn/src"),
      id => string.include(id, "babel-core/browser.js") || string.include(id, "system.src.js"),
      // id => lang.string.include(id, "lively.ast.es6.bundle.js"),
      id => id.slice(-3) !== ".js"
    ],
    pendingConfigs = [], configInitialized = false,
    esmFormatCommentRegExp = /['"]format (esm|es6)['"];/,
    cjsFormatCommentRegExp = /['"]format cjs['"];/,
    // Stolen from SystemJS
    esmRegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

function getExceptions() { return exceptions; }
function setExceptions(v) { return exceptions = v; }

function prepareCodeForCustomCompile(source, fullname, env, debug) {
  source = String(source);
  var tfmOptions = {
        topLevelVarRecorder: env.recorder,
        varRecorderName: env.recorderName,
        dontTransform: env.dontTransform,
        recordGlobals: true
      },
      isGlobal = env.recorderName === "System.global",
      header = (debug ? `console.log("[lively.modules] executing module ${fullname}");\n` : ""),
      footer = "";

  // FIXME how to update exports in that case?
  if (!isGlobal) {
    header += `var __lively_modules__ = System["__lively.modules__"],\n    ${env.recorderName} = __lively_modules__.moduleEnv("${fullname}").recorder;`;
    footer += `\n__lively_modules__.evaluationDone("${fullname}");`
  }

  try {
    var rewrittenSource = header + evalCodeTransform(source, tfmOptions) + footer;
    if (debug && typeof $morph !== "undefined" && $morph("log")) $morph("log").textString = rewrittenSource;
    return rewrittenSource;
  } catch (e) {
    console.error("Error in prepareCodeForCustomCompile", e.stack);
    return source;
  }
}

function getCachedNodejsModule(System, load) {
  // On nodejs we might run alongside normal node modules. To not load those
  // twice we have this little hack...
  try {
    var Module = System._nodeRequire("module").Module,
        id = Module._resolveFilename(load.name.replace(/^file:\/\//, "")),
        nodeModule = Module._cache[id];
    return nodeModule;
  } catch (e) {
    System.debug && console.log("[lively.modules getCachedNodejsModule] %s unknown to nodejs", load.name);
  }
  return null;
}

function addNodejsWrapperSource(System, load) {
  // On nodejs we might run alongside normal node modules. To not load those
  // twice we have this little hack...
  var m = getCachedNodejsModule(System, load);
  if (m) {
    load.source = `export default System._nodeRequire('${m.id}');\n`;
    load.source += properties.allOwnPropertiesOrFunctions(m.exports).map(k =>
      classHelper.isValidIdentifier(k) ?
        `export var ${k} = System._nodeRequire('${m.id}')['${k}'];` :
        `/*ignoring export "${k}" b/c it is not a valid identifier*/`).join("\n")
    System.debug && console.log("[lively.modules customTranslate] loading %s from nodejs module cache", load.name);
    return true;
  }
  System.debug && console.log("[lively.modules customTranslate] %s not yet in nodejs module cache", load.name);
  return false;
}

function customTranslate(proceed, load) {
  // load like
  // {
  //   address: "file:///Users/robert/Lively/lively-dev/lively.vm/tests/test-resources/some-es6-module.js",
  //   name: "file:///Users/robert/Lively/lively-dev/lively.vm/tests/test-resources/some-es6-module.js",
  //   metadata: { deps: [/*...*/], entry: {/*...*/}, format: "esm", sourceMap: ... },
  //   source: "..."
  // }

  var System = this, debug = System.debug;

  if (exceptions.some(exc => exc(load.name))) {
    debug && console.log("[lively.modules customTranslate ignoring] %s", load.name);
    return proceed(load);
  }
  if (isNode && addNodejsWrapperSource(System, load)) {
    debug && console.log("[lively.modules] loaded %s from nodejs cache", load.name)
    return proceed(load);
  }

  var start = Date.now();

  var isEsm = load.metadata.format == 'esm' || load.metadata.format == 'es6'
           || (!load.metadata.format && esmFormatCommentRegExp.test(load.source.slice(0,5000)))
           || (!load.metadata.format && !cjsFormatCommentRegExp.test(load.source.slice(0,5000)) && esmRegEx.test(load.source)),
      isCjs = load.metadata.format == 'cjs',
      // isGlobal = load.metadata.format == 'global' || !load.metadata.format,
      isGlobal = load.metadata.format == 'global',
      env = moduleEnv(System, load.name);

  if (isEsm) {
    load.metadata.format = "esm";
    load.source = prepareCodeForCustomCompile(load.source, load.name, env, debug);
    load.metadata["lively.modules instrumented"] = true;
    debug && console.log("[lively.modules] loaded %s as es6 module", load.name)
    // debug && console.log(load.source)
  } else if (isCjs && isNode) {
    load.metadata.format = "cjs";
    var id = cjs.resolve(load.address.replace(/^file:\/\//, ""));
    load.source = cjs._prepareCodeForCustomCompile(load.source, id, cjs.envFor(id), debug);
    load.metadata["lively.modules instrumented"] = true;
    debug && console.log("[lively.modules] loaded %s as instrumented cjs module", load.name)
    // console.log("[lively.modules] no rewrite for cjs module", load.name)
  } else if (isGlobal) {
    env.recorderName = "System.global";
    env.recorder = System.global;
    load.source = prepareCodeForCustomCompile(load.source, load.name, env, debug);
    load.metadata["lively.modules instrumented"] = true;
    debug && console.log(load.source);
  } else {
    debug && console.log("[lively.modules] customTranslate ignoring %s b/c don't know how to handle format %s", load.name, load.metadata.format);
  }

  debug && console.log("[lively.modules customTranslate] done %s after %sms", load.name, Date.now()-start);
  return proceed(load);
}

function instrumentSourceOfModuleLoad(System, load) {
  // brittle!
  // The result of System.translate is source code for a call to
  // System.register that can't be run standalone. We parse the necessary
  // details from it that we will use to re-define the module
  // (dependencies, setters, execute)
  return System.translate(load).then(translated => {
    // translated looks like
    // (function(__moduleName){System.register(["./some-es6-module.js", ...], function (_export) {
    //   "use strict";
    //   var x, z, y;
    //   return {
    //     setters: [function (_someEs6ModuleJs) { ... }],
    //     execute: function () {...}
    //   };
    // });

    var parsed            = ast.parse(translated),
        call              = parsed.body[0].expression,
        moduleName        = call.arguments[0].value,
        registerCall      = call.callee.body.body[0].expression,
        depNames          = arr.pluck(registerCall["arguments"][0].elements, "value"),
        declareFuncNode   = call.callee.body.body[0].expression["arguments"][1],
        declareFuncSource = translated.slice(declareFuncNode.start, declareFuncNode.end),
        declare           = eval(`var __moduleName = "${moduleName}";(${declareFuncSource});\n//@ sourceURL=${moduleName}\n`);
    if (System.debug && typeof $morph !== "undefined" && $morph("log")) $morph("log").textString = declare;
    return {localDeps: depNames, declare: declare};
  });
}

function wrapModuleLoad(System) {
  if (isHookInstalled(System, "translate", "lively_modules_translate_hook")) return;
  installHook(
    System, "translate",
    function lively_modules_translate_hook(proceed, load) { return customTranslate.call(System, proceed, load); });
}

function unwrapModuleLoad(System) {
  removeHook(System, "translate", "lively_modules_translate_hook");
}
