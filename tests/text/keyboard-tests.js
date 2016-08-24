/*global System, declare, it, xit, describe, xdescribe, beforeEach, afterEach, before, after*/
import { Text } from "../../index.js";
import { expect } from "mocha-es6";
import { pt, Color, Rectangle, Transform, rect } from "lively.graphics";
import { arr, string } from "lively.lang";

var t;
function text(string, props) {
  return new Text({
    name: "text",
    textString: string,
    fontFamily: "Monaco, monospace",
    fontSize: 10,
    extent: pt(100,100),
    ...props
  });
}


describe("text key input", () => {

  beforeEach(() => t = text("hello\n world", {}));

  describe("key handler invocation", () => {

    it("input event", () => {
      t.invokeKeyHandlers({type: "input", data: "x"});
      expect(t.textString).equals("xhello\n world");
      t.invokeKeyHandlers({type: "input", data: "X"});
      expect(t.textString).equals("xXhello\n world");
    });

    it("no input event", () => {
      t.invokeKeyHandlers({type: "input", data: "x"}, {onlyCommandOrFunctionKey: true});
      expect(t.textString).equals("hello\n world");
    });

  });


  it("key input", () => {
    t.simulateKeys("a");
    expect(t.textString).equals("ahello\n world");
    t.simulateKeys("b");
    expect(t.textString).equals("abhello\n world");
    t.simulateKeys("Right c d");
    expect(t.textString).equals("abhcdello\n world");
    expect(t.cursorPosition).deep.equals({row: 0, column: 5});
  });

});
