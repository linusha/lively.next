System.register(["./__root_module__-89b08ab2.js"],function(){var ta,nb,xb,Ob;return{setters:[function(Hb){ta=Hb.aj;nb=Hb.ap;xb=Hb.C;Ob=Hb.at}],execute:function(){var Hb=lively.FreezerRuntime.recorderFor("FastLoadToggler/index.js");Hb.Morph=ta;Hb.Icon=nb;Hb.Color=xb;var qd=function(Dc){var hd=lively.FreezerRuntime.recorderFor("FastLoadToggler/index.js"),Hc=hd.hasOwnProperty("FastLoadToggler")&&"function"===typeof hd.FastLoadToggler?hd.FastLoadToggler:hd.FastLoadToggler=function(Fc){Fc&&Fc[Symbol.for("lively-instance-restorer")]||
this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Ob(Hc,Dc,[{key:"onLoad",value:function(){localStorage.getItem("lively.load-config")||localStorage.setItem("lively.load-config",JSON.stringify({"lively.lang":"dynamic","lively.ast":"dynamic","lively.source-transform":"dynamic","lively.classes":"dynamic","lively.vm":"dynamic","lively.modules":"dynamic","lively.user":"dynamic","lively.storage":"dynamic","lively.morphic":"dynamic"}))}},{key:"onMouseDown",value:function(Fc){Ob._get(Object.getPrototypeOf(Hc.prototype),
"onMouseDown",this).call(this,Fc);this.toggleFastLoad()}},{key:"refresh",value:function(){var Fc=this.getSubmorphNamed("toggle indicator"),Sc=this.getSubmorphNamed("label"),ad=this.getSubmorphNamed("bolt"),Jd=Object.values(this.loadConfig).every(function(sc){return"frozen"==sc}),ed=Jd?this.owner.haloColor:this.owner.get("label").fontColor;Fc.fontColor=Sc.fontColor=ad.fontColor=ed;Fc.textAndAttributes=Hb.Icon.textAttribute(Jd?"toggle-on":"toggle-off")}},{key:"toggleFastLoad",value:function(){var Fc=
this.loadConfig,Sc=Object.values(Fc).every(function(Jd){return"frozen"==Jd}),ad;for(ad in Fc)Fc[ad]=Sc?"dynamic":"frozen";this.loadConfig=Fc;this.refresh()}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"FastLoadToggler"}},{key:"properties",get:function(){return{loadConfig:{derived:!0,get:function(){return JSON.parse(localStorage.getItem("lively.load-config")||"{}")},set:function(Fc){localStorage.setItem("lively.load-config",JSON.stringify(Fc))}}}}}],hd,{pathInPackage:function(){return"index.js"},
unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"FastLoadToggler",version:"0.1.1-17"}}},{start:112,end:1847})}(Hb.Morph);qd=Hb.FastLoadToggler;Hb.default=qd}}});