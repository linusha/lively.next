import { Color, pt, rect } from "lively.graphics";

const defaultProperties = {
  position:  pt(0,0),
  rotation:  0,
  scale:  1,
  extent:  pt(10, 10),
  fill:  Color.white,
  clipMode:  "visible",
  submorphs:  []
}

export class Morph {

  constructor(props) {
    this._owner = null;
    this._changes = []
    this._pendingChanges = [];
    this._dirty = true; // for initial display
    Object.assign(this, props);
  }

  defaultProperty(key) { return defaultProperties[key]; }

  getProperty(key) {
     var c = this.lastChangeFor(key);
     return c ? c.value : this.defaultProperty(key); 
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // changes
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  lastChangeFor(prop, onlyCommited) {
    var changes = this._changes.concat(onlyCommited ? [] : this._pendingChanges);
    return changes.reverse().find(ea => ea.prop === prop);
  }

  change(change) {
    this._pendingChanges.push(change);
    this.makeDirty();
    return change;
  }

  hasPendingChanges() { return !!this._pendingChanges.length; }

  commitChanges() {
    this._changes = this._changes.concat(this._pendingChanges);
    this._pendingChanges = [];
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // render hooks
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  makeDirty() {
    this._dirty = true;
    if (this.owner) this.owner.makeDirty();
  }

  needsRerender() {
    return this._dirty || !!this._pendingChanges.length;
  }
  
  aboutToRender() {
    this.commitChanges();
    this._dirty = false;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // morphic interface
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  get position()       { return this.getProperty("position"); }
  set position(value)  { this.change({prop: "position", value}); }

  get scale()          { return this.getProperty("scale"); }
  set scale(value)     { this.change({prop: "scale", value}); }

  get rotation()       { return this.getProperty("rotation"); }
  set rotation(value)  { this.change({prop: "rotation", value}); }

  get extent()         { return this.getProperty("extent"); }
  set extent(value)    { this.change({prop: "extent", value}); }

  get fill()           { return this.getProperty("fill"); }
  set fill(value)      { this.change({prop: "fill", value}); }

  get clipMode()       { return this.getProperty("clipMode"); }
  set clipMode(value)  { this.change({prop: "clipMode", value}); }

  get submorphs()      { return this.getProperty("submorphs"); }
  addMorph(morph) {
    morph._owner = this;
    this.change({prop: "submorphs", value: this.submorphs.concat(morph)});
  }
  get owner() { return this._owner; }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-  
  // undo / redo
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  undo() {
    // fixme redo stack
    this._changes.pop();
    this.makeDirty();
  }
}
