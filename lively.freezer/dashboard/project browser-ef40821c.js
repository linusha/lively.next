System.register(["./__root_module__-aefa9179.js","kld-intersections","./user-ui-0f5aeda0.js","./index-ea95c5b9.js","./index-9b6165d2.js"],function(Da,Bb){var Qb,hc,ac,be,bd,Sd,ed,Mc,pd,Dd,ke,Kd,jd,cb,Ab,Yb,gc,dd,Zd;return{setters:[function(Wb){Qb=Wb.ai;hc=Wb.aB;ac=Wb.ak;be=Wb.an;bd=Wb.Z;Sd=Wb.a6;ed=Wb.at;Mc=Wb.s;pd=Wb.C;Dd=Wb.a3;ke=Wb.r;Kd=Wb.as;jd=Wb.aA;cb=Wb.a$;Ab=Wb.b0;Yb=Wb.aq;gc=Wb.aY;dd=Wb.aX},function(){},function(Wb){Zd=Wb.UserUI},function(){},function(){}],execute:function(){var Wb=
lively.FreezerRuntime.recorderFor("WorldDashboard/index.js");Wb.Morph=Qb;Wb.HorizontalLayout=hc;Wb.VerticalLayout=ac;Wb.morph=be;Wb.MorphicDB=bd;Wb.arr=Sd;Wb.fun=ed;Wb.string=Mc;Wb.Color=pd;Wb.pt=Dd;Wb.UserUI=Zd;Wb.resource=ke;var oc=function(Sc){var Yc=lively.FreezerRuntime.recorderFor("WorldDashboard/index.js"),Xb=Yc.hasOwnProperty("WorldDashboard")&&"function"===typeof Yc.WorldDashboard?Yc.WorldDashboard:Yc.WorldDashboard=function(qb){qb&&qb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,
arguments)};return Kd(Xb,Sc,[{key:"focus",value:function(){this.ui.searchField.focus()}},{key:"update",value:function(){this.displayWorlds()}},{key:"beforePublish",value:function(){this.reset()}},{key:"reset",value:function(){this.ui.worldList.items=[];this.ui.noWorldWarning.visible=!1}},{key:"relayout",value:function(){this.alignInWorld()}},{key:"alignInWorld",value:function(qb){qb=void 0===qb?$world:qb;this.owner!=qb&&qb.addMorph(this);this.center=qb.visibleBounds().center()}},{key:"sortAndFilterPreviews",
value:function(qb){var uc=Wb.UserUI.getCurrentUser();qb=this.ui.searchField.fuzzyFilter(qb,function(Hc){return Hc._commit.name+Hc._commit.description});switch(this.ui.sortSelector.selection){case "RECENT":return Wb.arr.sortBy(qb,function(Hc){return-Hc._commit.timestamp});case "TEMPLATES":return qb;case "MY PROJECTS":return Wb.arr.filter(qb,function(Hc){return Hc._commit.author.name===uc.name});case "PUBLISHED":return qb}}},{key:"updateList",value:function(){var qb=this;this.previews&&Wb.fun.debounceNamed("update world list",
150,function(){qb.ui.worldList.items=qb.sortAndFilterPreviews(qb.previews)})()}},{key:"displayWorlds",value:function(){var qb=this,uc,Hc,Ia,Va,tb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Jb){switch(Jb.nextAddress){case 1:return qb.reset(),uc=qb.ui,Hc=uc.loadingLabel,Hc.animate({opacity:1,duration:300}),Jb.yield(qb.db.latestCommits("world"),2);case 2:return Ia=Jb.yieldResult,Jb.yield(Bb.import("./world preview-a7255209.js"),4);case 4:if(!(Va=Jb.yieldResult)){Jb.jumpTo(5);break}return Jb.yield(Wb.resource("part://partial freezing/world preview"),
6);case 6:Va=Jb.yieldResult;case 5:return Jb.yield(Va.read(),3);case 3:return tb=Jb.yieldResult,qb.previews=Ia.map(function(Ib){var ib=Wb.morph({reactsToPointer:!1,fill:Wb.Color.transparent,extent:tb.extent});ib._commit=Ib;ib.displayPreview=function(){var jb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Fb){if(1==Fb.nextAddress)return jb=tb.copy(),jb._commit=Ib,jb.opacity=0,ib.addMorph(jb),jb.displayPreview(),jb.position=Wb.pt(0,0),Fb.yield(ib.whenRendered(),2);ib.layout=new Wb.HorizontalLayout({autoResize:!0,
reactToSubmorphAnimations:!0});Fb.jumpToEnd()})};return ib}),Jb.yield(Hc.animate({opacity:0,duration:300}),7);case 7:qb.updateList(),0==Ia.length&&(qb.ui.noWorldWarning.center=qb.innerBounds().center(),qb.ui.noWorldWarning.animate({visible:!0,duration:300})),Jb.jumpToEnd()}})}},{key:"createNewProject",value:function(){document.location="/worlds/load?name=__newWorld__"}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"WorldDashboard"}},{key:"properties",get:function(){return{showCloseButton:{derived:!0,
get:function(){return this.ui.closeButton.visible},set:function(qb){this.ui.closeButton.visible=qb}},db:{serialize:!1,get:function(){return Wb.MorphicDB.default}},ui:{derived:!0,get:function(){return{worldList:this.getSubmorphNamed("world list"),sortSelector:this.getSubmorphNamed("search selector"),searchField:this.getSubmorphNamed("search field"),closeButton:this.getSubmorphNamed("close button"),loadingLabel:this.getSubmorphNamed("loading label"),noWorldWarning:this.getSubmorphNamed("no world warning")}}}}}}],
Yc,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"WorldDashboard",version:"0.1.1-127"}}},{start:330,end:3954})}(Wb.Morph);oc=Wb.WorldDashboard;Wb.default=oc;var Lb=lively.FreezerRuntime.recorderFor("GrowingWorldList/index.js");Lb.Morph=Qb;Lb.touchInputDevice=jd;Lb.TilingLayout=cb;Lb.arr=Sd;Lb.pt=Dd;oc=function(Sc){var Yc=lively.FreezerRuntime.recorderFor("GrowingWorldList/index.js"),
Xb=Yc.hasOwnProperty("GrowingWorldList")&&"function"===typeof Yc.GrowingWorldList?Yc.GrowingWorldList:Yc.GrowingWorldList=function(qb){qb&&qb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Kd(Xb,Sc,[{key:"onLoad",value:function(){this.clipMode="auto"}},{key:"onScroll",value:function(qb){Kd._get(Object.getPrototypeOf(Xb.prototype),"onScroll",this).call(this,qb);this.update()}},{key:"onChange",value:function(qb){Kd._get(Object.getPrototypeOf(Xb.prototype),
"onChange",this).call(this,qb);"extent"==qb.prop&&this.update(!0)}},{key:"onHoverIn",value:function(qb){this.clipMode="auto"}},{key:"onHoverOut",value:function(qb){Lb.touchInputDevice||(this.clipMode="hidden")}},{key:"update",value:function(qb){var uc=this.items;if(uc&&0!=uc.length){var Hc=this.scrollContainer,Ia=Hc.layout.spacing;Hc.extent=this.extent;var Va=this.ui,tb=Va.bufferTop;Va=Va.bufferBottom;tb=tb||Hc.addMorph({fill:null,name:"buffer top",height:10});Va=Va||Hc.addMorph({fill:null,name:"buffer bottom",
height:10});tb.width=Va.width=this.width-100;Hc.layout.disable();var Jb=uc[0];Ia=uc.slice(0,Math.floor(this.width/(Jb.width+Ia))*(Math.ceil((this.scroll.y+this.height)/(Jb.height+Ia))+1)).filter(function(Fb){return Fb.owner!=Hc});Jb=this.scroll.y+2*this.height;for(var Ib={},ib=$jscomp.makeIterator(Ia),jb=ib.next();!jb.done;Ib={$jscomp$loop$prop$item$2263:Ib.$jscomp$loop$prop$item$2263},jb=ib.next())Ib.$jscomp$loop$prop$item$2263=jb.value,Jb++,Ib.$jscomp$loop$prop$item$2263.top=Jb,Hc.addMorph(Ib.$jscomp$loop$prop$item$2263),
Ib.$jscomp$loop$prop$item$2263._initialized||Ib.$jscomp$loop$prop$item$2263.whenRendered().then(function(Fb){return function(){return $jscomp.asyncExecutePromiseGeneratorProgram(function(rc){Fb.$jscomp$loop$prop$item$2263._initialized=!0;return rc.yield(Fb.$jscomp$loop$prop$item$2263.displayPreview(),0)})}}(Ib));qb&&(tb.position=Lb.pt(0,0),uc.forEach(function(Fb,rc){return Fb.position=Lb.pt(rc+1,rc+1)}),Va.position=Lb.pt(uc.length+2,uc.length+2));Hc.layout.enable();if(qb||0<Ia.length)Va.top=this.submorphBounds().height,
Hc.layout.apply()}}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"GrowingWorldList"}},{key:"properties",get:function(){return{scrollContainer:{get:function(){return this.getSubmorphNamed("scroll container")||this.addMorph({name:"scroll container",fill:null,reactsToPointer:!1,renderOnGPU:!0,layout:new Lb.TilingLayout({spacing:25,align:"center",autoResize:!0})})}},ui:{get:function(){return{bufferTop:this.getSubmorphNamed("buffer top"),bufferBottom:this.getSubmorphNamed("buffer bottom")}}},
items:{after:["layout","scrollContainer"],set:function(qb){this.setProperty("items",qb);var uc=this.scrollContainer;uc.layout&&uc.layout.disable();var Hc=this.ui,Ia=Hc.bufferTop;Hc=Hc.bufferBottom;Lb.arr.withoutAll(uc.submorphs,[].concat($jscomp.arrayFromIterable(qb),[Ia,Hc])).forEach(function(Va){return Va.remove()});this.update(!0)}}}}}],Yc,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},
package:function(){return{name:"GrowingWorldList",version:"0.1.1-32"}}},{start:179,end:3777})}(Lb.Morph);oc=Lb.GrowingWorldList;Lb.default=oc;var Bc=lively.FreezerRuntime.recorderFor("SearchInputLine/index.js");Bc.InputLine=Ab;Bc.Color=pd;Bc.connect=Yb;Bc.disconnectAll=gc;Bc.disconnect=dd;Bc.arr=Sd;Bc.string=Mc;oc=function(Sc){var Yc=lively.FreezerRuntime.recorderFor("SearchInputLine/index.js"),Xb=Yc.hasOwnProperty("SearchInputLine")&&"function"===typeof Yc.SearchInputLine?Yc.SearchInputLine:Yc.SearchInputLine=
function(qb){qb&&qb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Kd(Xb,Sc,[{key:"fuzzyMatch",value:function(qb,uc){uc=void 0===uc?this.parseInput():uc;if(uc.lowercasedTokens.every(function(Ia){return qb.toLowerCase().includes(Ia)}))return!0;var Hc=qb.toLowerCase();return 3>=Bc.arr.sum(uc.lowercasedTokens.map(function(Ia){return Bc.string.levenshtein(Hc,Ia)}))}},{key:"fuzzyFilter",value:function(qb,uc){var Hc=this;uc=void 0===
uc?function(Va){return Va}:uc;var Ia=this.parseInput();return Bc.arr.filter(qb,function(Va){return Hc.fuzzyMatch(uc(Va),Ia)})}},{key:"parseInput",value:function(){var qb=Array.from(this.textString).reduce(function(Hc,Ia){if("\\"===Ia&&!Hc.escaped)return Hc.escaped=!0,Hc;" "!==Ia||Hc.escaped?(Hc.spaceSeen=!1,Hc.current+=Ia):(!Hc.spaceSeen&&Hc.current&&(Hc.tokens.push(Hc.current),Hc.current=""),Hc.spaceSeen=!0);Hc.escaped=!1;return Hc},{tokens:[],current:"",escaped:!1,spaceSeen:!1});qb.current&&qb.tokens.push(qb.current);
var uc=qb.tokens.map(function(Hc){return Hc.toLowerCase()});return{tokens:qb.tokens,lowercasedTokens:uc}}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"SearchInputLine"}}],Yc,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"SearchInputLine",version:"0.1.1-4"}}},{start:239,end:1834})}(Bc.InputLine);oc=Bc.SearchInputLine;
Bc.default=oc}}});