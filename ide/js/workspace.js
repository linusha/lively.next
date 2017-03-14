import { arr, obj } from "lively.lang";
import { pt, Point, Color, Rectangle } from "lively.graphics";
import { config, Window, DropDownList } from "../../index.js";
import { JavaScriptEditorPlugin } from "./editor-plugin.js";
import EvalBackendChooser from "./eval-backend-ui.js";
import InputLine from "../../text/input-line.js";
import { connect, once, noUpdate } from "lively.bindings";
import { resource } from "lively.resources";

export default class Workspace extends Window {

  static get properties() {

    return {
      extent: {defaultValue: pt(400,300)},

      title: {
        initialize(val) {
          this.title = val || "Workspace";
        },
      },

      targetMorph: {
        initialize() {
          this.targetMorph = {
            type: "text", name: "editor",
            textString: "// Enter and evaluate JavaScript code here",
            ...config.codeEditor.defaultStyle,
            plugins: [new JavaScriptEditorPlugin()]
          };
        }
      },

      content: {
        derived: true, after: ["targetMorph"],
        get() { return this.targetMorph.textString; },
        set(val) { if (val) this.targetMorph.textString = val; }
      },

      jsPlugin: {
        derived: true, readOnly: true, after: ["targetMorph"],
        get() { return this.targetMorph.pluginFind(p => p.isEditorPlugin); },
        initialize() {
          var ed = this.targetMorph;
          this.jsPlugin.evalEnvironment = {
            targetModule: "lively://lively.next-workspace/" + ed.id,
            context: ed, format: "esm"
          }
          this.addMorph(EvalBackendChooser.default.ensureEvalBackendDropdown(this, this.getEvalBackend()));
        }
      },

      file: {
        get() { let f = this.getProperty("file"); return f ? resource(f) : f; },
        set(file) {
          if (file && file.isResource) file = file.url;
          this.setProperty("file", file);
        }
      }
    }
  }

  setEvalBackend(choice) { this.jsPlugin.evalEnvironment.remote = choice; }
  getEvalBackend() { this.jsPlugin.evalEnvironment.remote; }

  relayoutWindowControls() {
    super.relayoutWindowControls();
    var list = this.getSubmorphNamed("eval backend list");
    if (list) {
      var title = this.titleLabel();
      list.topRight = this.innerBounds().topRight().addXY(-5, 2);
      if (list.left < title.right + 3) list.left = title.right + 3;
    }
  }

  get commands() {
    return [
      EvalBackendChooser.default.activateEvalBackendCommand(this),

      {
        name: "[workspace] query for file",
        async exec(workspace) {
          let historyId = "lively.ide-workspace-file-hist",
              {items: hist} = InputLine.getHistory(historyId),
              f = await workspace.world().prompt(
                "Enter a file to save the workspace contents to",
                {
                  input: workspace.file ? workspace.file.url :
                    hist.length ? arr.last(hist) :
                      resource(System.baseURL).join("workspace.js").url,
                  requester: workspace,
                  historyId
                });
          workspace.file = f;
          if (!f) {
            workspace.setStatusMessage("workspace file cleared");
            return;
          }
          workspace.setStatusMessage(`workspace saves content to ${workspace.file.url}`);
          if (await workspace.world().confirm(`Load content from ${f}?`, {requester: workspace}))
            workspace.content = await workspace.file.read();
        }
      },
      
      {
        name: "[workspace] save content",
        async exec(workspace) {
          if (!workspace.file) {
            workspace.setStatusMessage("Cannot save: no workspace file set");
            return workspace;
          }
          try {
            await workspace.file.write(workspace.content);
          } catch (e) { workspace.showError(e); throw e; }
          workspace.setStatusMessage(`Saved to ${workspace.file.url}`, Color.green);
          return workspace;
        }
      }
    ].concat(super.commands);
  }

  get keybindings() {
    return super.keybindings.concat([
      {keys: "Meta-Shift-L b a c k e n d", command: "activate eval backend dropdown list"},
      {keys: "Alt-L", command: "[workspace] query for file"},
      {keys: {mac: "Command-S", win: "Ctrl-S"}, command: "[workspace] save content"}
    ]);
  }

}
