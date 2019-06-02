/*global System*/
import { Rectangle, rect, Color, pt } from 'lively.graphics';
import { morph, VerticalLayout, Morph, StyleSheet, Text, GridLayout,
  Icon, HorizontalLayout, InputLine, PasswordInputLine } from 'lively.morphic';
import { arr, obj, promise } from "lively.lang";
import { connect } from 'lively.bindings';

import { List, FilterableList } from './list.js';

export class AbstractPrompt extends Morph {

  static get properties() {
    return {
      fill: {defaultValue: Color.black.withA(0.6)},
      extent: {defaultValue: pt(300,80)},
      borderRadius: {defaultValue: 5},
      dropShadow: {initialize() { this.dopShadow = true; }},
      clipMode: {defaultValue: 'hidden'},
      _isActive: {defaultValue: false},
      autoRemove: {defaultValue: true},
      answer: {defaultValue: null, derived: true},
      styleSheets: {
        initialize() {
          this.styleSheets = new StyleSheet({
            "[name=promptTitle]": {
              fontWeight: 'bold',
              textAlign: 'center',
              fill: null, 
              padding: Rectangle.inset(3),
              fontSize: 14, 
              fontColor: Color.gray,
              fixedHeight: true,
              clipMode: 'visible'
            },
            ".Button": {borderRadius: 15},
            ".Button.standard": {
              borderWidth: 2,
              fill: Color.transparent,
              borderColor: Color.white,
              nativeCursor: "pointer"
            },
            ".Button.cancel": {
              borderWidth: 2,
              fill: Color.transparent,
              borderColor: Color.red.lighter(),
              fontStyle: "bold",
              nativeCursor: "pointer"
            },
            ".Button.ok": {
              borderWidth: 2,
              fill: Color.transparent,
              borderColor: Color.green.lighter(),
              fontStyle: "bold",
              nativeCursor: "pointer"
            },
            ".Button.standard [name=label]": {
              fontStyle: "bold",
              fontColor: Color.white
            },
            ".List": {
              fill: Color.transparent,
            },
            ".Button.cancel [name=label]": {
              fontColor: Color.red.lighter(),
              fontStyle: "bold"
            },
            ".Button.ok [name=label]": {
              fontColor: Color.green.lighter(),
              fontStyle: "bold"
            }
          });
        }
      }
    };
  }

  constructor(props = {}) {
    super(obj.dissoc(props, ["label", "commands", "keybindings"]));
    this.build(props);
    if (props.commands) this.addCommands(props.commands);
    if (props.keybindings) this.addKeyBindings(props.keybindings);
  }

  get isEpiMorph() { return true; }
  get isPrompt() { return true; }

  get label() { return this.getSubmorphNamed("promptTitle").textString; }
  set label(label) { this.getSubmorphNamed("promptTitle").textString = label; }

  resolve(arg) { return this.answer.resolve(arg); }
  reject(reason = undefined) { return this.answer.resolve(reason); }

  async activate() {
    this.focus();
    this.answer = promise.deferred();
    this._isActive = true;
    promise.finally(this.answer.promise, () => this._isActive = false);
    if (this.autoRemove)
      promise.finally(this.answer.promise, () => this.fadeOut(500));
    return this.answer.promise;
  }

  isActive() { return !!this.world() && this._isActive; }

  build() { throw new Error("Not yet implemented"); }
  applyLayout() { throw new Error("Not yet implemented"); }

  get keybindings() {
    return super.keybindings.concat([
      {keys: "Enter", command: "resolve"},
      {keys: "Escape", command: "reject"},
    ]);
  }

  get commands() {
    return super.commands.concat([
      {name: "resolve", exec: (_, arg) => { this.resolve(arg); return true; }},
      {name: "reject", exec: (_, arg) => { this.reject(arg); return true; }}
    ]);
  }

  async transitionTo(otherPrompt, duration = 300) {
    // assumes to be working with prompts opened in world
    let morphBox = morph({
          fill: this.fill,
          borderRadius: this.borderRadius,
        }),
        scaler = morph({
          fill: null, origin: pt(5,5)
        });
    otherPrompt.opacity = 0;
    otherPrompt.fill = Color.transparent;
    otherPrompt.openInWorld();
    this.fill = Color.transparent;
    $world.addMorph(morphBox, this);
    morphBox.setBounds(this.bounds());

    scaler.openInWorld();
    scaler.addMorph(otherPrompt);
    otherPrompt.center = scaler.origin;
    scaler.center = morphBox.center = this.center;
    scaler.scale = otherPrompt.width / this.width;

    morphBox.whenRendered().then(async () => {
      this.animate({scale: this.width / otherPrompt.width, opacity: 0, duration});
      otherPrompt.animate({opacity: 1, duration});
      scaler.animate({scale: 1, duration});
      await morphBox.animate({bounds: scaler.bounds(), duration});
      otherPrompt.fill = morphBox.fill;
      $world.addMorph(otherPrompt);
      morphBox.remove();
      this.remove();
      scaler.remove();
    });
  }

}

// $world.inform(lively.lang.arr.range(0,40).join("\n"))
export class InformPrompt extends AbstractPrompt {

  build(props = {}) {
    var {label} = props;
    this.addMorph({
      name: "promptTitle", type: "text", value: props.label
    });
    let okButton = this.addMorph({
      styleClasses: ['ok'],
      name: "ok button", type: "button", label: "OK",
    });
    connect(okButton, 'fire', this, 'resolve');
    this.initLayout();
  }

  initLayout() {
    const label = this.getSubmorphNamed("promptTitle");
    label.fit();
    this.height = label.height + 30;
    this.get('ok button').extent = pt(100,25);
    this.layout = new VerticalLayout({
      align: "center", spacing: 5
    });
    this.whenRendered().then(() => this.layout.apply())
  }

  get keybindings() {
    return super.keybindings.concat([
      {keys: "Escape", command: "resolve"},
    ]);
  }

}

export class ConfirmPrompt extends AbstractPrompt {

  build(props) {
    this.addMorph({
      name: "promptTitle", type: "text", value: props.label
    });
    let okButton = this.addMorph({
      styleClasses: ['ok'],
      name: "ok button", type: "button",
      label: "OK"
    });
    let cancelButton = this.addMorph({
      styleClasses: ['cancel'],
      name: "cancel button", type: "button",
      label: "Cancel"
    });

    connect(okButton, 'fire', this, 'resolve');
    connect(cancelButton, 'fire', this, 'reject');
    this.initLayout();
  }

  resolve() { super.resolve(true); }
  reject() { super.resolve(false); }

  initLayout() {
    // fixme: layout should be able to let one morph
    //         define the overall width of the container
    const label = this.getSubmorphNamed("promptTitle");
    this.opacity = 0;
    this.whenRendered().then(() => {
      this.width = Math.max(125, label.textBounds().width) + 10;
      this.layout = new GridLayout({
        columns: [
          0, {paddingLeft: 5},
          1, {paddingRight: 2.5, fixed: 60},
          2, {paddingLeft: 2.5, fixed: 60},
          3, {paddingRight: 5}
        ],
        rows: [
          0, {fixed: label.textBounds().height + 10},
          1, {paddingBottom: 5, fixed: 30}
        ],
        grid: [["promptTitle", "promptTitle", "promptTitle", "promptTitle"],
          [null, "ok button", "cancel button", null]]
      });
      this.height = label.textBounds().height + 40;
      this.opacity = 1;
    })
  }
}


export class MultipleChoicePrompt extends AbstractPrompt {

  build(props = {choices: ["No choice"]}) {
    var {label, choices} = props;
    if (label)
      this.addMorph({
        name: "promptTitle", type: "text", value: label,
      });

    let choidesContainer = this.addMorph({
      name: 'choices',
      fill: Color.transparent,
      layout: new VerticalLayout({spacing: 5, 
                                  resizeSubmorphs: true,
                                  direction: 'centered'})
    });

    choices.forEach((choice, i) => {
      var btn = choidesContainer.addMorph({
        name: "button " + i, type: "button",
        styleClasses: ['standard'],
        padding: Rectangle.inset(10, 8),
        label: choice});
      btn.choice = choice;
      connect(btn, 'fire', this, 'resolve', {converter: function() { return this.sourceObj.choice; }});
    });

    this.initLayout();
  }

  initLayout() {
    // fixme: layout should be able to let one morph
    //         define the overall width of the container
    var label = this.getSubmorphNamed("promptTitle"),
        choices = this.get('choices');
    label && label.fit();
    var buttons = choices.submorphs.filter(({isButton}) => isButton);
    buttons.forEach(ea => ea.fit());

    this.layout = new GridLayout({
      fitToCell: true,
      columns: [0, {paddingLeft: 5, paddingRight: 5}],
      rows: label ? [0, {height: 20, fixed: true},
        1, {paddingBottom: 10}] : [0, {paddingBottom: 10}],
      grid: label ?
        [["promptTitle"],
          ['choices']] :
        [['choices']],
    });

    this.width = Math.max(
      label ? label.width : 0,
      choices.bounds().width);

    this.height = choices.bounds().height + label.height;
  }

  onKeyDown(evt) {
    if (/^[0-9]$/.test(evt.keyCombo)) {
      var n = Number(evt.keyCombo)-1;
      var btn = this.getSubmorphNamed("button " + n);
      if (btn) {
        btn.trigger();
        return evt.stop();
      }
    }
    return super.onKeyDown(evt);
  }


}

export class TextPrompt extends AbstractPrompt {

  static async example() {
    await $world.prompt("enter", {input: "a little longer text"});
    await $world.prompt("enter\nsomething", {input: "???"});
  }

  get maxWidth() { return this.env.world.visibleBounds().width - 20; }

  build({label, input, historyId, useLastInput}) {
    this.addMorph({
      name: "promptTitle", type: "text", value: label
    });

    var inputLine = this.addMorph(Text.makeInputLine({
      historyId,
      highlightWhenFocused: false,
      name: "input", textString: input || "",
      borderWidth: 0, borderRadius: 20, fill: Color.rgbHex("#DDD"),
      fontSize: 14, fontColor: Color.rgbHex("#666"),
      padding: Rectangle.inset(5,5), fixedHeight: false
    }));

    if (historyId && useLastInput) {
      var lastInput = arr.last(inputLine.inputHistory.items);
      if (lastInput) inputLine.textString = lastInput;
    }

    var inputWidth = inputLine.textBounds().width;
    // if the input string we pre-fill is wide than we try to make it fit
    if (inputWidth > this.width-25)
      this.width = Math.min(this.maxWidth, inputWidth+25);

    this.addMorph({name: "ok button", type: "button", label: "OK", styleClasses: ['ok']});
    this.addMorph({name: "cancel button", type: "button", label: "Cancel", styleClasses: ['cancel']});

    connect(this.getSubmorphNamed("ok button"), 'fire', this, 'resolve');
    connect(this.getSubmorphNamed("cancel button"), 'fire', this, 'reject');

    this.opacity = 0;
    this.whenRendered().then(() => this.initLayout());

    inputLine.gotoDocumentEnd();
    inputLine.scrollCursorIntoView();
  }

  resolve() { super.resolve(this.getSubmorphNamed("input").acceptInput()); }

  initLayout() {
    // this.initLayout();
    const label = this.getSubmorphNamed("promptTitle"),
          input = this.getSubmorphNamed("input");
    label.fit();

    this.whenRendered().then(() => {
      const goalWidth = Math.max(input.textBounds().width, label.textBounds().width) + 20;
      this.width = Math.min(this.maxWidth, goalWidth);
      this.opacity = 1;
    });

    const l = this.layout = new GridLayout({
      columns: [
        0, {paddingLeft: 5},
        1, {paddingLeft: 5, paddingRight: 2.5, fixed: 100},
        2, {paddingRight: 5, paddingLeft: 2.5, fixed: 100},
        3, {paddingRight: 5}
      ],
      rows: [
        0, {fixed: label.textBounds().height + 5, paddingBottom: 5},
        1, {fixed: input.height},
        2, {fixed: 35, paddingTop: 5, paddingBottom: 5},
      ],
      grid: [
        ["promptTitle", "promptTitle", "promptTitle", "promptTitle"],
        ["input", "input", "input", "input"],
        [null, "ok button", "cancel button", null]
      ]
    });
  }

  focus() { this.getSubmorphNamed("input").focus(); }
}

export class EditPrompt extends AbstractPrompt {

  static async example() {
    await $world.editPrompt("enter", {input: "$world.show()", mode: "js", evalEnvironment: {context: 23}});
    this.editorPlugin.evalEnvironment
  }

  static get properties() {
    return {
      extent: {defaultValue: pt(500, 300)},
    };
  }

  get maxWidth() { return this.env.world.visibleBounds().width - 20; }

  build({label, input, historyId, useLastInput, mode, textStyle, evalEnvironment}) {
    let title = this.addMorph({
      fill: null, padding: Rectangle.inset(3), fontSize: 14, fontColor: Color.gray,
      name: "promptTitle", type: "label", value: label
    });

    if (!textStyle) textStyle = {};
    if (mode && !textStyle.fontFamily) textStyle.fontFamily = "Monaco, monospace";

    var inputEditor = this.addMorph(new Text({
      clipMode: "auto",
      name: "editor", textString: input || "",
      borderWidth: 0, borderRadius: 5, fill: Color.white,
      fontSize: 12, fontColor: Color.rgbHex("#666"),
      padding: Rectangle.inset(8,4), fixedHeight: false,
      ...textStyle
    }));

    inputEditor.changeEditorMode(mode).then(() => {
      if (evalEnvironment && inputEditor.editorPlugin)
        Object.assign(inputEditor.editorPlugin.evalEnvironment, evalEnvironment);
    });

    var inputWidth = inputEditor.textBounds().width + 50;
    // if the input string we pre-fill is wide than we try to make it fit
    if (inputWidth > this.width-25)
      this.width = Math.min(this.maxWidth, inputWidth+125);

    this.addMorph({name: "ok button", type: "button", label: "OK", styleClasses: ['ok']});
    this.addMorph({name: "cancel button", type: "button", label: "Cancel", styleClasses: ['cancel']});

    connect(this.getSubmorphNamed("ok button"), 'fire', this, 'resolve');
    connect(this.getSubmorphNamed("cancel button"), 'fire', this, 'reject');
    

    this.whenRendered().then(() => this.initLayout());

    inputEditor.gotoDocumentEnd();
    inputEditor.scrollCursorIntoView();
  }

  initLayout() {
    // this.initLayout();
    const label = this.getSubmorphNamed("promptTitle"),
          editor = this.getSubmorphNamed("editor");
    label.fit();

    const minWidth = Math.max(editor.textBounds().width+20, label.width);
    if (this.width < minWidth)
      this.width = Math.min(this.maxWidth, minWidth + 20);

    const l = this.layout = new GridLayout({
      columns: [
        0, {paddingLeft: 4},
        1, {fixed: 100, paddingRight: 2.5},
        2, {paddingLeft: 2.5, paddingRight: 4, fixed: 100}
      ],
      rows: [
        0, {fixed: label.height, paddingBottom: 2.5},
        2, {paddingTop: 5, paddingBottom: 5, fixed: 35},
      ],
      grid: [
        ["promptTitle", "promptTitle", "promptTitle"],
        ["editor", "editor", "editor"],
        [null, "ok button", "cancel button"]
      ]
    });
  }

  resolve(arg) {
    let content = this.getSubmorphNamed("editor").textString.trim();
    if (this.historyId) {
      let hist = InputLine.getHistory(this.historyId);
      hist.items = hist.items.filter(ea => ea !== content);
      hist.items.push(content);
      while (hist.items.length > hist.items.max) hist.items.shift();
      hist.index = hist.items.length;
      InputLine.setHistory(this.historyId, hist);
    }
    return super.resolve(content);
  }

  get keybindings() {
    return [
      {keys: {mac: "Meta-Enter|Meta-S", win: 'Ctrl-Enter|Ctrl-S'}, command: "resolve"},
      {keys: "Escape", command: "reject"},
      {keys: "Alt-P|Alt-Up", command: "history back"},
      {keys: "Alt-N|Alt-Down", command: "history forward"},
      {keys: "Alt-H", command: "browse history"},
    ];
  }

  get commands() {
    return super.commands.concat([
      {
        name: "history back",
        exec: (_, arg) => {
          if (this.historyId) {
            let hist = InputLine.getHistory(this.historyId), {items, index} = hist;
            hist.index = --index;
            if (index < 0) hist.index = index = items.length - 1;
            this.get("editor").undoManager.group();
            this.get("editor").textString = items[index];
            this.get("editor").undoManager.group();
          }
          return true;
        }
      },

      {
        name: "browse history",
        exec: async (_, arg) => {
          if (this.historyId) {
            let hist = InputLine.getHistory(this.historyId),
                {status, list, selections: [choice]} = await this.world().editListPrompt(
                  "input history " + this.historyId, hist.items, {requester: this});
            if (status !== "canceled") {
              hist.items = list;
              InputLine.setHistory(this.historyId, hist);
              if (choice) {
                hist.index = hist.items.indexOf(choice);
                this.get("editor").textString = choice;
              }
            }
          }
          return true;
        }
      },

      {
        name: "history forward",
        exec: (_, arg) => {
          if (this.historyId) {
            let hist = InputLine.getHistory(this.historyId), {items, index} = hist;
            hist.index = ++index;
            if (index >= items.length) hist.index = index = 0;
            this.get("editor").undoManager.group();
            this.get("editor").textString = items[index];
            this.get("editor").undoManager.group();
          }
          return true;
        }
      }
    ]);
  }

  focus() { this.getSubmorphNamed("editor").focus(); }
}

export class PasswordPrompt extends AbstractPrompt {

  get maxWidth() { return 800; }

  build({label, placeholder}) {
    let title = this.addMorph({
      name: "promptTitle", type: "text", value: label
    });

    this.width = Math.max(this.width, title.textBounds().width + 10);

    var passwordInput = this.addMorph(new PasswordInputLine({
      fontSize: 20, name: "input", borderRadius: 20, 
      fill: Color.rgbHex("#DDD"),
      padding: rect(5,10,2,-2),
      placeholder: placeholder || "", borderWidth: 0
    }));

    this.addMorph({name: "ok button", type: "button", label: "OK", styleClasses: ['ok']});
    this.addMorph({name: "cancel button", type: "button", label: "Cancel", styleClasses: ['cancel']});

    connect(this.get("ok button"), 'fire', this, 'resolve');
    connect(this.get("cancel button"), 'fire', this, 'reject');

    this.layout = new GridLayout({
      rows: [
        0, {fixed: 25},
        1, {paddingBottom: 5},
        2, {paddingBottom: 5}
      ],
      columns: [
        0, {height: 20, paddingLeft: 5, paddingRight: 2.5, min: 50},
        //1, {fixed: 100},
        1, {paddingLeft: 2.5, paddingRight: 5, min: 50}
      ],
      grid: [["promptTitle", "promptTitle"],
        ["input", "input"],
        ["ok button", "cancel button"]]
    });
  }

  resolve() { super.resolve(this.get("input").acceptInput()); }

  focus() {
    let i = this.get("input");
    i.whenRendered().then(() => i.focus());
  }
}

export class ListPrompt extends AbstractPrompt {

  static async example() {
    await $world.listPrompt("hello", [1,2,3,4], {multiSelect: true});
  }

  constructor(props = {}) {
    super(obj.dissoc(props, ["preselect", "items", "onSelection"]));
    let list = this.get("list");
    list.items = props.items || [];
    if (typeof props.preselect === "number") {
      list.selectedIndex = props.preselect;
      list.scrollSelectionIntoView();
    }
    if (typeof props.onSelection === "function")
      connect(list, "selection", props, "onSelection");
  }

  build({label,
    listFontSize,
    listFontFamily,
    labelFontSize,
    labelFontFamily,
    filterable,
    padding,
    itemPadding,
    extent,
    multiSelect,
    historyId,
    useLastInput,
    fuzzy, filterFunction, sortFunction,
    actions, selectedAction, theme
  }) {

    this.extent = extent || pt(500,400);
    labelFontFamily = labelFontFamily || "Helvetica Neue, Arial, sans-serif";
    labelFontSize = labelFontSize || 15;
    listFontFamily = listFontFamily || "Monaco, monospace";
    listFontSize = listFontSize || 12;

    var title = {
      name: "promptTitle", type: "text", value: label
    };

    title = this.addMorph(title);
    this.width = Math.max(this.width, title.textBounds().width + 10);

    var listProps = {
      name: "list", type: filterable ? FilterableList : List,
      multiSelect,
      historyId, useLastInput,
      borderWidth: 0, borderColor: Color.gray,
      fontSize: listFontSize, fontFamily: listFontFamily,
      padding, itemPadding, inputPadding: Rectangle.inset(10,2),
      theme: 'dark'
    };

    if (filterable && fuzzy) listProps.fuzzy = fuzzy;
    if (filterable && typeof filterFunction === "function")
      listProps.filterFunction = filterFunction;
    if (filterable && typeof sortFunction === "function")
      listProps.sortFunction = sortFunction;
    if (filterable && actions)
      listProps.actions = actions;
    if (filterable && selectedAction)
      listProps.selectedAction = selectedAction;
    this.addMorph(morph(listProps));

    this.addMorph({
      name: "ok button", type: "button", label: "Select",
      styleClasses: ['ok']
    });
    this.addMorph({
      name: "cancel button", type: "button", label: "Cancel",
      styleClasses: ['cancel']
    });
    connect(this.get("ok button"), 'fire', this, 'resolve');
    connect(this.get("cancel button"), 'fire', this, 'reject');

    this.layout = new GridLayout({
      rows: [
        0, {fixed: 25},
        1, {paddingBottom: 10},
        2, {fixed: 30, paddingBottom: 5}
      ],
      columns: [
        0, {paddingLeft: 5},
        1, {fixed: 100, paddingRight: 5},
        2, {fixed: 100, paddingRight: 5}
      ],
      grid: [
        ["promptTitle", "promptTitle", "promptTitle"],
        ["list", "list", "list"],
        [null,"ok button", "cancel button"]
      ]
    });

    if (filterable) {
      connect(this.get("list"), 'accepted', this, 'resolve');
      connect(this.get("list"), 'canceled', this, 'reject');
    }
  }

  resolve(arg) {
    var answer = arg || this.get("list") instanceof FilterableList ?
      this.get("list").acceptInput() :
      {selected: this.get("list").selections, status: "accepted", actions: "default"};
    return this.answer.resolve(answer);
  }

  reject() {
    return this.answer.resolve({
      prompt: this, selected: [],
      filtered: [], status: "canceled"
    });
  }

  focus() { this.get("list").focus(); }

}


export class EditListPrompt extends ListPrompt {

  static async example() {
    await $world.editListPrompt("hello", [1,2,3,4], {multiSelect: true});
  }

  build(props) {
    super.build(props);

    var addBtn = this.addMorph({
          type: 'button',
          styleClasses: ['standard'],
          name: "add item button",
          label: Icon.makeLabel("plus", {fontSize: 12})
        }),
        rmBtn = this.addMorph({
          styleClasses: ['standard'],
          name: "remove item button",
          type: 'button',
          label: Icon.makeLabel("minus", {fontSize: 12})
        });

    connect(addBtn, 'fire', this, 'addItemToList');
    connect(rmBtn, 'fire', this, 'removeSelectedItemsFromList');

    this.layout = new GridLayout({
      autoAssign: false,
      columns: [
        0, {paddingLeft: 5, paddingRight: 5},
        3, {paddingRight: 5},
        4, {paddingRight: 5}
      ],
      rows: [
        0, {fixed: 30, paddingTop: 5, paddingBottom: 5},
        1, {paddingBottom: 2},
        2, {fixed: 30, paddingBottom: 5}
      ],
      grid: [["promptTitle", "promptTitle", "promptTitle", "promptTitle", "promptTitle"],
        ["list", "list", "list", "list", "list"],
        ["add item button", "remove item button", null, "ok button", "cancel button"]]
    });
  }

  async removeSelectedItemsFromList() {
    var list = this.get("list"),
        selectAfterwards = list.selectedItems.length != 1 ?
          -1 : list.selectedIndex === 0 ? 0 : list.selectedIndex-1;
    list.items = arr.withoutAll(list.items, list.selectedItems);
    if (selectAfterwards < 0) list.selection = null;
    else list.selectedIndex = selectAfterwards;
    list.focus();
  }

  async addItemToList() {
    var list = this.get("list"),
        input = list.selection ? list.items[list.selectedIndex].string : "",
        toAdd = await this.world().prompt(
          "Input to add to the list", {
            historyId: this.historyId || "EditListPrompt-input-history",
            input});
    if (!toAdd) return;
    var list = this.get("list"),
        insertAt = list.selection ? list.selectedIndex+1 : list.items.length;
    list.addItemAt(toAdd, insertAt);
    list.focus();
    list.selectedIndex = insertAt;
  }

  get keybindings() {
    return super.keybindings.concat([
      {keys: {mac: "Meta-Enter", win: 'Ctrl-Enter'}, command: "resolve"},
      {keys: 'Ctrl-G', command: "deselect"},
      {keys: 'Shift-=|+', command: "add item to list"},
      {keys: 'Delete|-|Backspace', command: "remove item from list"},
    ]);
  }

  get commands() {
    return super.commands.concat([
      {
        name: "deselect",
        exec: () => { this.get("list").selection = null; return true; }
      },
      {
        name: "add item to list",
        exec: () => { this.addItemToList(); return true; }
      },
      {
        name: "remove item from list",
        exec: () => { this.removeSelectedItemsFromList(); return true; }
      }
    ]);
  }

  resolve() {
    var {values: list, selections} = this.get("list");
    return this.answer.resolve({list, selections});
  }

  reject() { return this.answer.resolve({list: [], selections: [], status: "canceled"}); }
}