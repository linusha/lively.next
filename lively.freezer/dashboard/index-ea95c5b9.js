System.register(["./__root_module__-aefa9179.js"],function(){var Da,Bb,Qb;return{setters:[function(hc){Da=hc.b4;Bb=hc.C;Qb=hc.as}],execute:function(){var hc=lively.FreezerRuntime.recorderFor("StripeButton/index.js");hc.Button=Da;hc.Color=Bb;var ac=function(be){var bd=lively.FreezerRuntime.recorderFor("StripeButton/index.js"),Sd=bd.hasOwnProperty("StripeButton")&&"function"===typeof bd.StripeButton?bd.StripeButton:bd.StripeButton=function(ed){ed&&ed[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,
arguments)};return Qb(Sd,be,[{key:"onDrop",value:function(ed){(ed=$jscomp.makeIterator(ed.hand.grabbedMorphs).next().value)&&ed.isLabel&&(this.label=ed.textAndAttributes,ed.remove())}},{key:"onHoverIn",value:function(ed){Qb._get(Object.getPrototypeOf(Sd.prototype),"onHoverIn",this).call(this,ed);!1!==this.haloShadowEnabled&&(ed=this.dropShadow.toJson(),ed.blur=10,ed.distance=3,this.animate({dropShadow:ed,duration:200}))}},{key:"onHoverOut",value:function(ed){Qb._get(Object.getPrototypeOf(Sd.prototype),
"onHoverOut",this).call(this,ed);!1!==this.haloShadowEnabled&&(ed=this.dropShadow.toJson(),ed.blur=6,ed.distance=1,this.animate({dropShadow:ed,duration:200}))}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"StripeButton"}},{key:"properties",get:function(){return{haloShadowEnabled:{defaultValue:!0},toggleFill:{}}}}],bd,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},
package:function(){return{name:"StripeButton",version:"0.1.1-26"}}},{start:121,end:1027})}(hc.Button);ac=hc.StripeButton;hc.default=ac}}});