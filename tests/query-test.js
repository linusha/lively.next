/*global beforeEach, afterEach, describe, it*/

import { expect } from "mocha-es6";

import * as query from "../lib/query.js";
import { parse } from "../lib/parser.js";
import { arr, obj, chain, fun } from "lively.lang";

describe('query', function() {

  describe("toplevel", () => {

    it("declsAndRefsInTopLevelScope", function() {
      var code = "var x = 3;\n function baz(y) { var zork; return xxx + zork + x + y; }\nvar y = 4, z;\nbar = 'foo';"
      var parsed = parse(code);
      var declsAndRefs = query.topLevelDeclsAndRefs(parsed);

      var varDecls = declsAndRefs.varDecls;
      var varIds = chain(declsAndRefs.varDecls).pluck('declarations').flatten().pluck("id").pluck("name").value();
      expect(["x", "y", "z"]).deep.equals(varIds, "var ids");

      var funcIds = chain(declsAndRefs.funcDecls).pluck('id').pluck('name').value();
      expect(["baz"]).deep.equals(funcIds, "funIds: " + obj.inspect(funcIds));

      var refs = declsAndRefs.refs;
      var refIds = chain(refs).pluck('name').value();
      expect(["bar", "xxx", "x"]).deep.equals(refIds, "ref ids");
    });

    it("recognizeFunctionDeclaration", function() {
      var code = "this.addScript(function run(n) { if (n > 0) run(n-1); show('done'); });",
          result = query.topLevelDeclsAndRefs(code),
          expected = ["show"];
      expect(expected).deep.equals(result.undeclaredNames);
    });

    it("recognizeArrowFunctionDeclaration", function() {
      var code = "this.addScript((n, run) => { if (n > 0) run(n-1); show('done'); });",
          result = query.topLevelDeclsAndRefs(code),
          expected = ["show"];
      expect(expected).deep.equals(result.undeclaredNames);
    });

    it("recognizeClassDeclaration", function() {
      var code = "class Foo {\n" + "  constructor(name) { this.name = name; }\n" + "}\n"+ "new Foo();",
          result = query.topLevelDeclsAndRefs(code),
          expected = [];
      expect(expected).deep.equals(result.undeclaredNames);
    });

    it("finds this references", function() {
      var code = "this.foo = this.bar;",
          result = query.topLevelDeclsAndRefs(code),
          expected = [{start: 0}, {start: 0}];
      expect(result.thisRefs).to.containSubset(expected);
    });

  });

  describe("scoping", () => {

    it("scopes", function() {
      var code = "var x = {y: 3}; function foo(y) { var foo = 3, baz = 5; x = 99; bar = 2; bar; Object.bar = 3; this.x = this.foo + 23; }";
      var parsed = parse(code);
      var scope = query.scopes(parsed);
      var expected = {
        node: parsed,
        varDecls: [{declarations: [{id: {name: 'x'}}]}],
        funcDecls: [{id: {name: 'foo'}}],
        params: [],
        refs: [],
        thisRefs: [],
        subScopes: [{
          node: parsed.body[1],
          varDecls: [{declarations: [{id: {name: 'foo'}}, {id: {name: 'baz'}}]}],
          funcDecls: [],
          params: [{name: "y"}],
          refs: [{name: "x"}, {name: "bar"}, {name: "bar"}, {name: "Object"}],
          thisRefs: [{type: "ThisExpression"}, {type: "ThisExpression"}]
        }]
      }

      expect(scope).to.containSubset(expected)

      // top level scope
      var varNames = chain(scope.varDecls).pluck('declarations').flatten().value();
      expect(1).equals(varNames.length, 'root scope vars');
      var funcNames = chain(scope.funcDecls).pluck('id').pluck('name').value();
      expect(1).equals(scope.funcDecls.length, 'root scope funcs');
      expect(0).equals(scope.params.length, 'root scope params');
      expect(0).equals(scope.refs.length, 'root scope refs');

      // sub scope
      expect(1).equals(scope.subScopes.length, 'subscope length');
      var subScope = scope.subScopes[0];
      var varNames = chain(subScope.varDecls).pluck('declarations').flatten().value();
      expect(2).equals(varNames.length, 'subscope vars');
      expect(0).equals(subScope.funcDecls.length, 'subscope funcs');
      expect(4).equals(subScope.refs.length, 'subscope refs');
      expect(1).equals(subScope.params.length, 'subscope params');
    });

  });


  describe("finding globals", () => {

    it("findGlobalVars", function() {
      var code = "var margin = {top: 20, right: 20, bottom: 30, left: 40},\n"
               + "    width = 960 - margin.left - margin.right,\n"
               + "    height = 500 - margin.top - margin.bottom;\n"
               + "function blup() {}\n"
               + "foo + String(baz) + foo + height;\n"
      var result = query.findGlobalVarRefs(code);

      var expected = [{start:169,end:172, name:"foo", type:"Identifier"},
                      {start:182,end:185, name:"baz", type:"Identifier"},
                      {start:189,end:192, name:"foo", type:"Identifier"}];

      expect(result).deep.equals(expected);
    });

  });


  describe("finding stuff from a source location", () => {

    it("findNodesIncludingLines", function() {
      var code = "var x = {\n  f: function(a) {\n   return 23;\n  }\n}\n",
          expected1 = ["Program","VariableDeclaration","VariableDeclarator","ObjectExpression","Property", "FunctionExpression","BlockStatement","ReturnStatement","Literal"],
          nodes1 = query.findNodesIncludingLines(null, code, [3]);
      expect(expected1).deep.equals(chain(nodes1).pluck("type").value());

      var expected2 = ["Program","VariableDeclaration","VariableDeclarator","ObjectExpression"],
          nodes2 = query.findNodesIncludingLines(null, code, [3,5]);
      expect(expected2).deep.equals(chain(nodes2).pluck("type").value());
    });

    describe("find scopes", function() {

      it("findScopeAtIndex", function() {
        var src = fun.extractBody(function() {
        var x = {
          f: function(a) {
          return function(a) { return a + 1};
          },
          f2: function() {}
        }
        });
        var index = 35; // on first return
        var parsed = parse(src, {addSource: true});
        var result = query.scopesAtIndex(parsed, index);

        var scopes = query.scopes(parsed);
        var expected = [scopes, scopes.subScopes[0]]
        expect(expected).deep.equals(result);
      });

      it("findScopeAtIndexWhenIndexPointsToFuncDecl", function() {
        var src = 'var x = "fooo"; function bar() { var z = "baz" }';
        var parsed = parse(src, {addSource: true});
        var scopes = query.scopes(parsed);

        var index = 26; // on bar
        var result = query.scopeAtIndex(parsed, index);
        expect(scopes).deep.equals(result);

        var index = 34; // inside bar body
        var result = query.scopeAtIndex(parsed, index);
        expect(scopes.subScopes[0]).deep.equals(result);
      });

      it("findScopeAtIndexWhenIndexPointsToArg", function() {
        var src = 'var x = "fooo"; function bar(zork) { var z = zork + "baz"; }';
        var parsed = parse(src, {addSource: true});
        var scopes = query.scopes(parsed);

        var index = 31; // on zork
        var result = query.scopeAtIndex(parsed, index);

        expect(scopes.subScopes[0]).deep.equals(result);
      });

    });

    describe("finding references and declarations", function() {

      it("findDeclarationClosestToIndex", function() {
        var src = `var x = 3, yyy = 4;\nvar z = function() { yyy + yyy + (function(yyy) { yyy+1 })(); }`;

        var index = 48; // second yyy of addition
        // show(src.slice(index-1,index+1))
        var parsed = parse(src);
        var result = query.findDeclarationClosestToIndex(parsed, "yyy", index);
        expect({end:14,name:"yyy",start:11,type:"Identifier"}).deep.equals(result);
      });

      it("findReferencesAndDeclsInScope", function() {
        var src = "var x = 3, y = 4;\nvar z = function() { y + y + (function(y) { y+1 })(); }";
        var parsed = parse(src);
        var scope = query.scopes(parsed);
        var result = query.findReferencesAndDeclsInScope(scope, "y");
        var expected = [{end:12,name:"y",start:11,type:"Identifier"},
                        {end:40,name:"y",start:39,type:"Identifier"},
                        {end:44,name:"y",start:43,type:"Identifier"}];
        expect(expected).deep.equals(result);
      });

    });

  });

  describe("statementOf", () => {

    function itFindsTheStatment(src, getTarget, getExpected) {
      return it(src, () => {
        var parsed = parse(src),
            found = query.statementOf(parsed, getTarget(parsed)),
            expected = getExpected(parsed);
        // expect(expected).to.equal(found, `node not found\nexpected: ${JSON.stringify(expected, null, 2)}\nactual: ${JSON.stringify(found, null, 2)}`);
        expect(JSON.stringify(expected, null, 2)).to.equal(JSON.stringify(found, null, 2));
      });
    }

    itFindsTheStatment(
      'var x = 3; function foo() { var y = 3; return y + 2 }; x + foo();',
      ast => ast.body[1].body.body[1].argument.left,
      ast => ast.body[1].body.body[1]);

    itFindsTheStatment(
      'var x = 1; x;',
      ast => ast.body[1],
      ast => ast.body[1]);

    itFindsTheStatment(
      'switch (123) { case 123: debugger; }',
      ast => ast.body[0].cases[0].consequent[0],
      ast => ast.body[0].cases[0].consequent[0]);

    itFindsTheStatment(
      'if (true) { var a = 1; }',
      ast => ast.body[0].consequent.body[0].declarations[0],
      ast => ast.body[0].consequent.body[0]);

    itFindsTheStatment(
      'if (true) var a = 1;',
      ast => ast.body[0].consequent.declarations[0],
      ast => ast.body[0]);

    itFindsTheStatment(
      'if (true) var a = 1; else var a = 2;',
      ast => ast.body[0].alternate.declarations[0],
      ast => ast.body[0]);

    itFindsTheStatment(
      'export default class Foo {}',
      ast => ast.body[0].declaration.id,
      ast => ast.body[0]);

    itFindsTheStatment(
      'a;', // testing scenario where node is not found
      ast => ({type: 'EmptyStatement'}),
      ast => undefined);

    it("finds path to statement", () => {
      var parsed = parse('var x = 3; function foo() { var y = 3; return y + 2 }; x + foo();'),
          found = query.statementOf(parsed, parsed.body[1].body.body[1].argument.left, {asPath: true}),
          expected = ["body", 1,"body", "body", 1];
      expect(expected).to.deep.equal(found);
    });

  });

  describe("es6 compat", () => {

    describe("patterns", function() {

      describe("obj destructuring", function() {

        describe("params", function() {
          it("simple", function() {
            var code = "({x}) => x",
                result = query.topLevelDeclsAndRefs(code),
                expected = [];
            expect(expected).deep.equals(result.undeclaredNames);
          });

          it("alias", function() {
            var code = "({x: y}) => y",
                result = query.topLevelDeclsAndRefs(code),
                expected = [];
            expect(expected).deep.equals(result.undeclaredNames);
          });

          it("nested", function() {
            var code = "({x: {a}}) => a",
                result = query.topLevelDeclsAndRefs(code),
                expected = [];
            expect(expected).deep.equals(result.undeclaredNames);
          });
        });

        describe("vars", function() {
          it("simple", function() {
            var code = "var {x, y} = {x: 3, y: 4};"
            var parsed = parse(code);
            var scopes = query.scopes(parsed);
            expect(["x", "y"]).deep.equals(query._declaredVarNames(scopes));
          });

          it("nested", function() {
            var code = "var {x, y: [{z}]} = {x: 3, y: [{z: 4}]};"
            var parsed = parse(code);
            var scopes = query.scopes(parsed);
            expect(["x", "z"]).deep.equals(query._declaredVarNames(scopes));
          });

          it("let", function() {
            var code = "let {x, y} = {x: 3, y: 4};"
            var parsed = parse(code);
            var scopes = query.scopes(parsed);
            expect(["x", "y"]).deep.equals(query._declaredVarNames(scopes));
          });

        });
      });

      describe("arr destructuring", function() {

        describe("params", function() {
          it("simple", function() {
            var code = "([x,{y}]) => x + y",
                result = query.topLevelDeclsAndRefs(code),
                expected = [];
            expect(expected).deep.equals(result.undeclaredNames);
          });
        });

        describe("vars", function() {
          it("simple", function() {
            var code = "var {x} = {x: 3};",
                parsed = parse(code),
                scopes = query.scopes(parsed);
            expect(["x"]).deep.equals(query._declaredVarNames(scopes));
          });
        });

        describe("...", function() {

          it("as param", function() {
            var code = "(a, ...b) => a + b[0];",
                result = query.topLevelDeclsAndRefs(code),
                expected = [];
            expect(expected).deep.equals(result.undeclaredNames);
          });

          it("as assignment", function() {
            var code = "var [head, ...inner] = [1,2,3,4,5];",
                parsed = parse(code),
                scopes = query.scopes(parsed);
            expect(["head", "inner"]).deep.equals(query._declaredVarNames(scopes));
          });

        });

      });

      it("finds default params", () => {
        var code = "function x(y = 2) { return y; }",
            parsed = parse(code),
            scopes = query.scopes(parsed).subScopes[0];
        expect(["x", "y"]).deep.equals(query._declaredVarNames(scopes));
      });
    });

    describe("templateStrings", function() {
      it("simple", function() {
        var code = "var x = `foo`;",
            parsed = parse(code),
            scopes = query.scopes(parsed);
        expect(["x"]).deep.equals(query._declaredVarNames(scopes));
      });

      it("with expressions", function() {
        var code = "var x = `foo ${y}`;",
            result = query.topLevelDeclsAndRefs(code);
        expect(["y"]).deep.equals(result.undeclaredNames);
      });
    });

    describe("es6 modules", function() {

      it('recognizes export declarations', function() {
        var code = 'export var x = 42; export function y() {}; export default function z() {};',
            parsed = parse(code),
            scopes = query.scopes(parsed);
        expect(["y", "z", "x"]).deep.equals(query._declaredVarNames(scopes));
      });

      it('recognizes import declarations', function() {
        var code = "import foo from 'bar';\n"
                 + "import { baz } from 'zork';\n"
                + "import { qux as corge } from 'quux';\n",
                // rk not yet supproted by acorn as of 2016-01-28:
                // + "import { * as grault } from 'garply';\n",
            parsed = parse(code),
            scopes = query.scopes(parsed);
        expect(["foo", "baz", "corge"/*, "grault"*/]).deep.equals(query._declaredVarNames(scopes));
      });
    });


    describe("es6 classes", function() {

      it('recognizes super call', function() {
        var code = "class Foo extends Bar {\n"
                 + "  m() { return super.m() + 2; }\n"
                 + "};\n",
            parsed = parse(code),
            toplevel = query.topLevelDeclsAndRefs(parsed);
        expect(toplevel.undeclaredNames).deep.equals(["Bar"]);
      });

    });

  });
  

  describe("helper", function() {
    var objExpr = parse("({x: 23, y: [{z: 4}]});").body[0].expression;
    expect(arr.pluck(query.helpers.objPropertiesAsList(objExpr, [], true), "key"))
      .eql([["x"], ["y", 0, "z"]]);
    expect(arr.pluck(query.helpers.objPropertiesAsList(objExpr, [], false), "key"))
      .eql([["x"], ["y"], ["y", 0, "z"]]);

    var objExpr = parse("var {x, y: [{z}]} = {x: 23, y: [{z: 4}]};").body[0].declarations[0].id;
    expect(arr.pluck(query.helpers.objPropertiesAsList(objExpr, [], true), "key"))
      .eql([["x"], ["y", 0, "z"]]);
    expect(arr.pluck(query.helpers.objPropertiesAsList(objExpr, [], false), "key"))
      .eql([["x"], ["y"], ["y", 0, "z"]]);
  });
});
