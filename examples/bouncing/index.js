import { pt, Color, Point } from "lively.graphics";
import { Renderer } from "lively.morphic/renderer.js";
import { Morph, Ellipse } from "lively.morphic/morph.js";

var {scrollWidth: w, scrollHeight: h} = document.body,
    world = new Morph({extent: pt(w, h)});

var r = new Renderer(world, document.getElementById("lively-world"))
r.startRenderWorldLoop();

Object.assign(Morph.prototype, {
  bounce() {
    var {x,y} = this.velocity,
        outer = this.owner.innerBounds(),
        inner = this.bounds();
    if (inner.right() > outer.right() || inner.left() < outer.left()) x = -x;
    if (inner.bottom() > outer.bottom() || inner.top() < outer.top()) y = -y;
    this.velocity = pt(x,y);
    this.moveBy(this.velocity);
  }
});

var wbounds = world.bounds(), morphs = [];
for (var i = 0; i < 100; i++) {
  var m = new Ellipse({
    position: wbounds.insetBy(10).randomPoint(),
    extent: Point.random(pt(10,10)).addXY(10,10),
    fill: Color.random()
  });
  m.velocity = Point.random(pt(10,10));
  morphs.push(world.addMorph(m))
}

(function loop() {
  morphs.forEach(ea => ea.bounce());
  requestAnimationFrame(loop);
})();
