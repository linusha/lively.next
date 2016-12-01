import {diff, patch, create} from "virtual-dom";
import "gsap";
import bowser from "bowser";
import { num, obj, arr, properties, promise } from "lively.lang";
import { Transform, Color, pt, Point } from "lively.graphics";
import { Morph, config } from '../index.js';

export class ShadowObject {

    constructor(args) {
        if (obj.isBoolean(args)) args = config.defaultShadow;
        const {rotation, distance, blur, color, morph} = args;
        this.rotation = obj.isNumber(rotation) ? rotation : 45; // in degrees
        this.distance = obj.isNumber(distance) ? distance : 2;
        this.blur = obj.isNumber(blur) ? blur : 6;
        this.color = color || Color.gray.darker();
        this.morph = morph;
    }

    get distance() { return this._distance }
    get blur() { return this._blur }
    get rotation() { return this._rotation }
    get color() { return this._color }

    set distance(d) {
       this._distance = d;
       if (this.morph) this.morph.dropShadow = this;
    }

    set blur(b) {
       this._blur = b;
       if (this.morph) this.morph.dropShadow = this;
    }

    set rotation(r) {
       this._rotation = r;
       if (this.morph) this.morph.dropShadow = this;
    }

    set color(c) {
       this._color = c;
       if (this.morph) this.morph.dropShadow = this;
    }

    get isShadowObject() { return true; }
    
    toCss() {
       const {x, y} = Point.polar(this.distance, num.toRadians(this.rotation));
       return `${this.color.toString()} ${x}px ${y}px ${this.blur}px`
    }

    toFilterCss() {
       const {x, y} = Point.polar(this.distance, num.toRadians(this.rotation));
       return `drop-shadow(${x}px ${y}px ${this.blur}px ${this.color.toString()})`;
    }

}

class StyleMapper {

  static getTransform({position, origin, scale, rotation}) {
    return {
       transform: `translateX(${position.x - origin.x}px) translateY(${position.y - origin.y}px) rotate(${num.toDegrees(rotation)}deg) scale(${scale},${scale})`}
  }

  static getTransformOrigin({origin}) {
    return origin && {transformOrigin: `${origin.x}px ${origin.y}px`};
  }

  static getDisplay({visible}) {
    return (visible != null) && {display: visible ? "inline" : "none"};
  }

  static getBorderRadius({borderRadiusLeft, borderRadiusRight, borderRadiusBottom, borderRadiusTop}) {
    return {borderRadius: `${borderRadiusTop}px ${borderRadiusTop}px ${borderRadiusBottom}px ${borderRadiusBottom}px / ${borderRadiusLeft}px ${borderRadiusRight}px ${borderRadiusRight}px ${borderRadiusLeft}px`};
  }

  static getBorder({borderWidthLeft, borderColorLeft, borderStyleLeft,
             borderWidthRight, borderColorRight, borderStyleRight,
             borderWidthBottom, borderColorBottom, borderStyleBottom,
             borderWidthTop, borderColorTop, borderStyleTop}) {
    return {
      "border-left":   `${borderWidthLeft}px   ${borderStyleLeft}   ${borderColorLeft ? borderColorLeft.toString() : "transparent"}`,
      "border-right":  `${borderWidthRight}px  ${borderStyleRight}  ${borderColorRight ? borderColorRight.toString() : "transparent"}`,
      "border-bottom": `${borderWidthBottom}px ${borderStyleBottom} ${borderColorBottom ? borderColorBottom.toString() : "transparent"}`,
      "border-top":    `${borderWidthTop}px    ${borderStyleTop}    ${borderColorTop ? borderColorTop.toString() : "transparent"}`
    }
  }

  static getFill({fill}) {
    return fill && {background: fill.toString()}
  }

  static getExtentStyle({width, height, extent}) {
    if(width && height) return {width: width + 'px', height: height + 'px'};
    if(extent) return {width: extent.x + 'px', height: extent.y + 'px'};
    return null;
  }

  static getShadowStyle(morph) {
    if (morph.isSvgMorph || morph.isImage) return {filter: shadowCss(morph)}
    return {boxShadow: morph.dropShadow ?
                    morph.dropShadow.toCss():
                    "none"}
  }

  static getSvgAttributes({width, height, borderWidth}) {
     return {width, height, "viewBox": [-borderWidth,-borderWidth, width ,height].join(" ")};
  }

  static getPathAttributes(path) {
     return {"stroke-width": path.borderWidth, ...this.getSvgBorderStyle(path),
             "stroke": (path.gradient ? "url(#gradient-" + path.id + ")" : path.borderColor.toString()),
              d: "M" + path.vertices.map(({x, y}) => `${x},${y}`).join(" L")}
  }

  static getSvgBorderStyle(svg) {
      const style = {
          solid: {},
          dashed: {"stroke-dasharray": svg.borderWidth * 1.61 + " " + svg.borderWidth},
          dotted: {"stroke-dasharray": "1 " + svg.borderWidth * 2,"stroke-linecap": "round", "stroke-linejoin": "round",}
      }
      return style[svg.borderStyle];
  }

  static getPolygonAttributes(polygon) {
     return {"stroke-width": polygon.borderWidth,
             ...this.getSvgBorderStyle(polygon),
             "stroke": polygon.borderColor.toString(),
             "fill": (polygon.gradient ? "url(#gradient-" + polygon.id + ")" : polygon.fill.toString()),
             points: polygon.vertices.map(({x,y}) => (x - polygon.borderWidth) + "," + (y - polygon.borderWidth)).join(" ")}
  }

  static getStyleProps(morph) {
    return {
      ...this.getFill(morph),
      ...this.getTransform(morph),
      ...this.getTransformOrigin(morph),
      ...this.getDisplay(morph),
      ...this.getExtentStyle(morph),
      ...this.getBorder(morph),
      ...this.getBorderRadius(morph),
      ...this.getShadowStyle(morph),
      ...(morph.opacity != null && {opacity: morph.opacity})
    }
  }

}

export class AnimationQueue {

  constructor(morph) {
    this.morph = morph;
    this.animations = [];
  }

  maskedProps(type) { 
     const l = this.animations.length;
     if (l > 0) {
        return obj.merge(this.animations.map(a => a.getAnimationProps(type)[0]));
     } else {
        return {}
     } 
  }

  get animationsActive() { return true }

  registerAnimation(config) {
    const anim = new PropertyAnimation(this, this.morph, config);
    return this.morph.withMetaDo({animation: anim}, () => {
      if (!this.animations.find(a => a.equals(anim)) && anim.affectsMorph) {
        anim.assignProps();
        this.animations.push(anim);
        return anim;
      }
    })
  }

  startAnimationsFor(node) { this.animations.forEach(anim => anim.start(node)); }
  startSvgAnimationsFor(svgNode, type) { this.animations.forEach(anim => anim.startSvg(svgNode, type)) }

  removeAnimation(animation) {
    arr.remove(this.animations, animation);
  }

}

export class PropertyAnimation {

  constructor(queue, morph, config) {
    this.queue = queue;
    this.morph = morph;
    this.config = this.convertBounds(config);
    this.needsAnimation = {svg: morph.isSvgMorph, path: morph.isPath, polygon: morph.isPolygon};
  }

  asPromise() {
     return new Promise((resolve, reject) => {
         this.resolvePromise = () => {
              this.onFinish(this);
              resolve(this.morph);             
         }
     })
  }

  finish() {
    this.queue.removeAnimation(this);
    this.resolvePromise ? this.resolvePromise() : this.onFinish();
  }

  convertBounds(config) {
    var {bounds, origin, rotation, scale, layout} = config,
         origin = origin || this.morph.origin,
         rotation = rotation || this.morph.rotation,
         scale = scale || this.morph.scale;
    if (bounds) {
      return {...obj.dissoc(config, ["bounds"]),
              origin, rotation, scale,
              position: bounds.topLeft().addPt(origin),
              extent: bounds.extent()};
    } else {
      return config
    }
  }

  equals(animation) {
    return obj.equals(this.changedProps, animation.changedProps);
  }

  get affectsMorph() {
    return properties.any(this.changedProps, (changedProps, prop) => !obj.equals(changedProps[prop], this.morph[prop]));
  }

  get changedProps() {
    return obj.dissoc(this.config, ["easing", "onFinish", "duration"]);
  }

  get easing() { return this.config.easing || "easeInOutQuint" }
  get onFinish() { return this.config.onFinish || (() => {})}
  set onFinish(cb) { this.config.onFinish = cb }
  get duration() { return this.config.duration || 1000 }


  getChangedProps(before, after) {
    const unchangedProps = [];
    for (var prop in before) {
      if (obj.equals(after[prop], before[prop])) {
         unchangedProps.push(prop);
      }
    }
    return [obj.dissoc(before, unchangedProps), 
            obj.dissoc(after, unchangedProps)];
  }

  getAnimationProps(type) {
    const [before, after] = this.getChangedProps(this.beforeProps[type], this.afterProps[type]);
    if (before.d) {
        // var before_d = before.d.splitBy(" "), after_d = after.d.splitBy(" ");
        // repeat last element until points are of equal number
    }
    if (before.points) {
        // var before_points = before.points.splitBy(" "), after_points = after.points.splitBy(" ");
        // repeat last element until points are of equal number
    }
     return [before, after]
  }

  gatherAnimationProps() {
     return {css: StyleMapper.getStyleProps(this.morph),
             svg: this.morph.isSvgMorph && StyleMapper.getSvgAttributes(this.morph),
             path: this.morph.isPath && StyleMapper.getPathAttributes(this.morph),
             polygon: this.morph.isPolygon && StyleMapper.getPolygonAttributes(this.morph)}
  }

  assignProps() {
    this.beforeProps = this.gatherAnimationProps();
    Object.assign(this.morph, this.changedProps);
    this.afterProps = this.gatherAnimationProps();
  }

  startSvg(svgNode, type) {
     if (TweenMax && this.needsAnimation[type]) {
       this.needsAnimation[type] = false;
       const [before, after] = this.getAnimationProps(type);
       TweenMax.fromTo(svgNode, 
                       this.duration / 1000, 
                       {attr: before}, 
                       {attr: after, ease: this.easing,
                        onOverwrite: (args) => {
                           this.finish();
                         },
                         onComplete: () => {
                           this.finish();
                           this.morph.makeDirty();
                       }});
     }
  }

  start(node) {
    if (TweenMax && !this.active) {
      this.active = true;
      let animationProps = this.getAnimationProps("css");
      if (animationProps) {
         TweenMax.fromTo(node, this.duration / 1000, 
                         animationProps[0],
                        {...animationProps[1],
                         ease: this.easing,
                         onOverwrite: (args) => {
                           this.finish();
                         },
                         onComplete: () => {
                           this.finish();
                           this.morph.makeDirty();
                       }});
      }
    } else if (!this.active) {
      this.onFinish();
    }
  }
}

export function defaultStyle(morph) {

  const {
    opacity, clipMode, reactsToPointer,
    nativeCursor,
  } = morph;

  return {
    ...StyleMapper.getStyleProps(morph),
    ...morph._animationQueue.maskedProps("css"),
    position: "absolute",
    overflow: clipMode,
    "pointer-events": reactsToPointer ? "auto" : "none",
    cursor: nativeCursor
  };
}

// Sets the scroll later...
// See https://github.com/Matt-Esch/virtual-dom/issues/338 for why that is necessary.
// See https://github.com/Matt-Esch/virtual-dom/blob/dcb8a14e96a5f78619510071fd39a5df52d381b7/docs/hooks.md
// for why this has to be a function of prototype
function MorphAfterRenderHook(morph, renderer) { this.morph = morph; this.renderer = renderer; }
MorphAfterRenderHook.prototype.hook = function(node, propertyName, previousValue) {
  // 1. wait for node to be really rendered, i.e. it's in DOM
  // this.morph._dirty = false;
  promise.waitFor(400, () => !!node.parentNode).catch(err => false).then(isInDOM => {
    if (isInDOM) {
      // 2. update scroll of morph itself
      if (this.morph.isClip()) this.updateScroll(this.morph, node);
      // 3. Update scroll of DOM nodes of submorphs
      if (this.morph._submorphOrderChanged && this.morph.submorphs.length) {
        this.morph._submorphOrderChanged = false;
        this.updateScrollOfSubmorphs(this.morph, this.renderer);
      }
    }
    this.morph._rendering = false; // see morph.makeDirty();
  });
}
MorphAfterRenderHook.prototype.updateScroll = function(morph, node) {
  // interactiveScrollInProgress: see morph.onMouseWheel
  var { interactiveScrollInProgress } = morph.env.eventDispatcher.eventState.scroll;
  if (interactiveScrollInProgress)
    return interactiveScrollInProgress.then(() =>
      this.updateScroll(morph,node));

  if (node) {
    const {x, y} = morph.scroll;
    node.scrollTop !== y && (node.scrollTop = y);
    node.scrollLeft !== x && (node.scrollLeft = x);
  }
}
MorphAfterRenderHook.prototype.updateScrollOfSubmorphs = function(morph, renderer) {
  morph.submorphs.forEach(m => {
    if (m.isClip())
      this.updateScroll(m, renderer.getNodeForMorph(m))
    this.updateScrollOfSubmorphs(m, renderer);
  });
}



// simple toplevel constructor, not a class and not wrapped for efficiency
function Animation(morph) { this.morph = morph; };
Animation.prototype.hook = function(node) {
  this.morph._animationQueue.startAnimationsFor(node);
}

export function SvgAnimation(morph, type) { this.morph = morph; this.type = type; };
SvgAnimation.prototype.hook = function(node) {
  this.morph._animationQueue.startSvgAnimationsFor(node, this.type);
}


export function defaultAttributes(morph, renderer) {
  return {
    animation: new Animation(morph),
    key: morph.id,
    id: morph.id,
    className: morph.styleClasses.concat([morph.hideScrollbars ? "hiddenScrollbar" : null]).join(" "),
    draggable: false,

    // rk 2016-09-13: scroll issues: just setting the scroll on the DOM node
    // doesn't work b/c of https://github.com/Matt-Esch/virtual-dom/issues/338
    // check the pull request mentioned in the issue, once that's merged we
    // might be able to remove the hook
    // scrollLeft: morph.scroll.x, scrollTop: morph.scroll.y,
    "morph-after-render-hook": new MorphAfterRenderHook(morph, renderer)
  };
}

export function svgAttributes(svg) {
   return {animation: new SvgAnimation(svg, "svg"),
           attributes: {
             ...StyleMapper.getSvgAttributes(svg),
             ...svg._animationQueue.maskedProps("svg")}}
}

export function pathAttributes(path) {
   return {animation: new SvgAnimation(path, "path"), 
           attributes: {...StyleMapper.getPathAttributes(path),
           ...path._animationQueue.maskedProps("path")}};
}

export function polygonAttributes(polygon) {
   return {animation: new SvgAnimation(polygon, "polygon"), 
           attributes: {
           ...StyleMapper.getPolygonAttributes(polygon),
           ...polygon._animationQueue.maskedProps("polygon")}};
}

function shadowCss(morph) {
  return morph.dropShadow ?
            morph.dropShadow.toFilterCss() :
            `drop-shadow(0px 0px 0px rgb(120, 120, 120))`;
}

function initDOMState(renderer, world) {
  renderer.rootNode.appendChild(renderer.domNode);
  renderer.ensureDefaultCSS()
    .then(() => promise.delay(500))
    .then(() => world.env.fontMetric.reset())
    .then(() => world.withAllSubmorphsDo(ea => (ea.isText || ea.isLabel) && ea.forceRerender()))
    .catch(err => console.error());
}

export function renderRootMorph(world, renderer) {
  if (!world.needsRerender()) return;

  var tree = renderer.renderMap.get(world) || renderer.render(world),
      domNode = renderer.domNode || (renderer.domNode = create(tree, renderer.domEnvironment)),
      newTree = renderer.render(world),
      patches = diff(tree, newTree);

  if (!domNode.parentNode) initDOMState(renderer, world);

  patch(domNode, patches);
}
