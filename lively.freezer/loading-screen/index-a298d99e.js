System.register(["./__root_module__-2cc1f5a8.js","./index-c23d9181.js","./color-picker-2c622495.js"],function(){var ya,wb,Ab,ac,Ob,kd,Cc,qd,Dc,Ic,Qc,Bd,ne,ve,Wd,Tb,wc,od,Ub,xd,Gd,lc,rc,Kb,qc,Hc,ad,dd,fc;return{setters:[function(jb){ya=jb.ax;wb=jb.a7;Ab=jb.a8;ac=jb.a_;Ob=jb.a6;kd=jb.ac;Cc=jb.ad;qd=jb.aD;Dc=jb.ap;Ic=jb.ab;Qc=jb.an;Bd=jb.as;ne=jb.a3;ve=jb.a1;Wd=jb.C;Tb=jb.au;wc=jb.aj;od=jb.bP;Ub=jb.bs;xd=jb.af;Gd=jb.aw;lc=jb.bk;rc=jb.br;Kb=jb.bp;qc=jb.bv;Hc=jb.bR},function(jb){ad=jb.N;dd=jb.I},
function(jb){fc=jb.a}],execute:function(){var jb=lively.FreezerRuntime.recorderFor("lively.ide/text/ui.js");jb.fun=ya;jb.string=wb;jb.obj=Ab;jb.properties=ac;jb.arr=Ob;jb.Text=kd;jb.config=Cc;jb.HorizontalLayout=qd;jb.VerticalLayout=Dc;jb.morph=Ic;jb.Morph=Qc;jb.Icon=Bd;jb.pt=ne;jb.Rectangle=ve;jb.Color=Wd;jb.connect=Tb;jb.once=wc;jb.noUpdate=od;jb.ColorPicker=fc;jb.DropDownList=Ub;jb.loadObjectFromPartsbinFolder=xd;jb.cachedControls=new WeakMap;var yb=function(Xa){var Hb=lively.FreezerRuntime.recorderFor("lively.ide/text/ui.js"),
ic=Hb.hasOwnProperty("RichTextControl")&&"function"===typeof Hb.RichTextControl?Hb.RichTextControl:Hb.RichTextControl=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Gd(ic,Xa,[{key:"toggleButton",value:function(lb,tb){lb.master=tb?{auto:"styleguide://SystemIDE/selected button"}:{auto:"styleguide://System/dark button"}}},{key:"reset",value:function(){var lb=this.ui.fontSelection;lb.items=jb.RichTextControl.basicFontItems();
lb.selection=lb.items[0].value;jb.connect(this.target,"selectionChange",this,"update")}},{key:"alignAtTarget",value:function(lb){lb=void 0===lb?!!this.world():lb;var tb=this.target,nb=tb.world()||$world,Y=this.globalBounds();tb=(tb.selection.isEmpty()?tb.globalBounds():tb.getGlobalTransform().transformRectToRect(tb.selectionBounds().translatedBy(tb.scroll.negated()))).bottomCenter().subPt(Y.topCenter());nb=nb.visibleBounds().translateForInclusion(Y.translatedBy(tb)).topLeft().subPt(Y.topLeft());nb=
this.position.addPt(nb);lb?this.animate({duration:300,position:nb}):this.position=nb}},{key:"removeFocus",value:function(){this.autoRemove&&this.target&&(this.remove(),this.target=null)}},{key:"focusOn",value:function(lb,tb){tb=void 0===tb?!0:tb;var nb=this;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Y){if(1==Y.nextAddress)return nb.target=lb,nb.update(),Y.yield(nb.whenRendered(),2);nb.ui.fontSizeField.relayout();tb&&nb.alignAtTarget();Y.jumpToEnd()})}},{key:"setupConnections",value:function(){jb.connect(this.ui.paddingField,
"number",this,"setPadding");jb.connect(this.ui.paddingFieldTop,"number",this,"setPaddingTop");jb.connect(this.ui.paddingFieldBottom,"number",this,"setPaddingBottom");jb.connect(this.ui.paddingFieldLeft,"number",this,"setPaddingLeft");jb.connect(this.ui.paddingFieldRight,"number",this,"setPaddingRight")}},{key:"update",value:function(){var lb=this,tb=this.target,nb=this.updateSpec,Y=tb.selection;Y=Y?Y.isEmpty()?tb.textAttributeAt(Y.start):tb.getStyleInRange(Y):{};var Ba=this.managedProps,P=jb.obj.select(tb,
Ba);tb=$jscomp.makeIterator(Object.entries(jb.obj.select(Y||{},Ba)));for(Y=tb.next();!Y.done;Y=tb.next())Ba=$jscomp.makeIterator(Y.value),Y=Ba.next().value,Ba=Ba.next().value,"undefined"!==typeof Ba&&(P[Y]=Ba);jb.noUpdate(function(){for(var na=$jscomp.makeIterator(Object.entries(lb.ui)),Sa=na.next();!Sa.done;Sa=na.next()){var hb=$jscomp.makeIterator(Sa.value);Sa=hb.next().value;hb=hb.next().value;if(nb[Sa])nb[Sa](P,hb)}})}},{key:"relayout",value:function(){}},{key:"changeAttributeInSelectionOrMorph",
value:function(lb,tb){var nb=this.target,Y=nb.selection;nb.isLabel||Y.isEmpty()?nb[lb]="function"===typeof tb?tb(nb[lb]):tb:(nb.undoManager.group(),nb.changeStyleProperty(lb,function(Ba){return"function"===typeof tb?tb(Ba):tb}),nb.undoManager.group())}},{key:"changeFont",value:function(lb){var tb=this,nb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Y){if(1==Y.nextAddress)return tb._last=lb,(nb="custom..."===lb)?Y.yield($world.prompt("Enter font family name",{requester:tb.target,historyId:"lively.morphic-rich-text-font-names",
useLastInput:!0}),3):Y.jumpTo(2);if(2!=Y.nextAddress&&(lb=Y.yieldResult,!lb))return Y.return();tb.changeAttributeInSelectionOrMorph("fontFamily",lb);Y.jumpToEnd()})}},{key:"setPadding",value:function(lb){this.target.padding=jb.Rectangle.inset(lb)}},{key:"setPaddingTop",value:function(lb){var tb=this.target.padding;this.target.padding=jb.Rectangle.inset(tb.left(),lb,tb.right(),tb.bottom())}},{key:"setPaddingLeft",value:function(lb){var tb=this.target.padding;this.target.padding=jb.Rectangle.inset(lb,
tb.top(),tb.right(),tb.bottom())}},{key:"setPaddingRight",value:function(lb){var tb=this.target.padding;this.target.padding=jb.Rectangle.inset(tb.left(),tb.top(),lb,tb.bottom())}},{key:"setPaddingBottom",value:function(lb){var tb=this.target.padding;this.target.padding=jb.Rectangle.inset(tb.left(),tb.top(),tb.right(),lb)}},{key:"setLineWrapping",value:function(lb){this.target.lineWrapping=lb}},{key:"changeFontWeight",value:function(lb){this.changeAttributeInSelectionOrMorph("fontWeight",lb)}},{key:"changeTextAlign",
value:function(lb){this.changeAttributeInSelectionOrMorph("textAlign",lb)}},{key:"changeFontColor",value:function(lb){this.changeAttributeInSelectionOrMorph("fontColor",lb)}},{key:"changeFontSize",value:function(lb){this.changeAttributeInSelectionOrMorph("fontSize",lb)}},{key:"changeFixedWidth",value:function(lb){this.target.fixedWidth=lb}},{key:"changeFixedHeight",value:function(lb){this.target.fixedHeight=lb}},{key:"changeLink",value:function(){var lb=this,tb,nb,Y,Ba,P;return $jscomp.asyncExecutePromiseGeneratorProgram(function(na){if(1==
na.nextAddress)return tb=lb.target,nb=tb.selection,Y=tb.getStyleInRange(nb),Ba=Y.link,na.yield(lb.world().prompt("Set link",{input:Ba||"https://"}),2);P=na.yieldResult;tb.undoManager.group();tb.setStyleInRange({link:P||void 0},nb);tb.undoManager.group();lb.autoRemove&&lb.remove();na.jumpToEnd()})}},{key:"toggleUnderline",value:function(){this.changeAttributeInSelectionOrMorph("textDecoration",function(lb){return"underline"===lb?"none":"underline"})}},{key:"toggleItalic",value:function(){this.changeAttributeInSelectionOrMorph("fontStyle",
function(lb){return"italic"===lb?"normal":"italic"})}},{key:"toggleBold",value:function(){this.changeAttributeInSelectionOrMorph("fontWeight",function(lb){return"bold"===lb||"700"===lb?"normal":"bold"})}},{key:"copyStyle",value:function(){var lb=this,tb=this.target,nb=this.ui.applyStyleButton;tb=tb.selection.isEmpty()?tb.defaultTextStyle:tb.getStyleInRange(tb.selection);var Y=JSON.stringify(tb,null,2);this.constructor.copiedStyle=tb;nb.tooltip="paste style\n"+Y;this.env.eventDispatcher.doCopyWithMimeTypes([{type:"text/plain",
data:Y},{type:"application/morphic-text-style",styleString:Y}]).then(function(){return lb.setStatusMessage("Copied style\n"+Y)}).catch(function(Ba){return lb.showError(Ba)})}},{key:"pasteStyle",value:function(){var lb=this,tb=this.target,nb=this.constructor.copiedStyle;tb.selection.isEmpty()?Object.assign(tb,nb):tb.selections.forEach(function(Y){return tb.addTextAttribute(lb.constructor.copiedStyle,Y)});this.update()}},{key:"clearStyle",value:function(){var lb=this.target;lb.selections.forEach(function(tb){return lb.resetStyleInRange(tb)});
this.update()}},{key:"configureRichTextOptions",value:function(){this.getSubmorphNamed("config panel")&&this.getSubmorphNamed("config panel").remove();var lb=this.defaultSpec,tb=this.uiSpec;lb=this.addMorph({name:"config panel",layout:new jb.VerticalLayout({spacing:5}),epiMorph:!0,submorphs:[].concat($jscomp.arrayFromIterable(Object.keys(lb).map(function(nb){var Y=tb.rows.some(function(Ba){return Ba.some(function(P){return P===nb})});return{type:"labeledcheckbox",label:nb,name:nb,checked:Y}})),[{layout:new jb.HorizontalLayout({spacing:3}),
submorphs:[{type:"button",name:"OK button",label:"OK"},{type:"button",name:"cancel button",label:"Cancel"}]}])});lb.center=this.innerBounds().center();jb.connect(lb.getSubmorphNamed("OK button"),"fire",this,"configureAccepted");jb.connect(lb.getSubmorphNamed("cancel button"),"fire",this,"configureCanceled")}},{key:"configureAccepted",value:function(){var lb=this.getSubmorphNamed("config panel");lb&&(lb.remove(),lb.submorphs.filter(function(tb){return"LabeledCheckBox"===tb.constructor.name}))}},{key:"configureCanceled",
value:function(){var lb=this.getSubmorphNamed("config panel");lb&&lb.remove()}},{key:"close",value:function(){var lb=this;this.target&&this.target.attributeConnections&&this.target.attributeConnections.forEach(function(tb){return tb.targetObj===lb&&tb.disconnect()});this.remove()}},{key:"alwaysTargetFocusedMorph",value:function(){this.startStepping(1500,"updateTarget")}},{key:"updateTarget",value:function(){var lb=this.world();lb&&(lb=lb.focusedMorph)&&(lb.isLabel||lb.isText)&&!this.isAncestorOf(lb)&&
this.target!==lb&&this.focusOn(lb,!1)}},{key:"onMouseUp",value:function(lb){var tb=this;return $jscomp.asyncExecutePromiseGeneratorProgram(function(nb){if(1==nb.nextAddress)return nb.yield(tb.whenRendered(),2);tb.update();nb.jumpToEnd()})}},{key:"attachToWorld",value:function(){jb.connect($world,"onMouseDown",this,"updateTarget",{garbageCollect:!0})}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"RichTextControl"}},{key:"properties",get:function(){return{autoRemove:{defaultValue:!1},
target:{},toggleColor:{},managedProps:{readOnly:!0,get:function(){return"fontFamily fontWeight fontSize fontStyle isText fontColor textAlign link textDecoration fixedWidth fixedHeight lineWrapping padding".split(" ")}},updateSpec:{get:function(){var lb=this;return Object.assign({fontSelection:function(tb,nb){var Y=tb.fontFamily;(tb=Y&&nb.items.find(function(Ba){return Ba.value.toLowerCase()===Y.toLowerCase()}))?nb.selection=tb.value:Y&&(nb.items=nb.items.concat({isListItem:!0,label:[Y,{fontFamily:Y}],
value:Y}),nb.selection=jb.arr.last(nb.items));nb.fit();nb.width=Math.max(nb.width,170)},fontWeightSelection:function(tb,nb){nb.selection="normal"==tb.fontWeight?"Medium":tb.fontWeight?jb.string.capitalize(tb.fontWeight):"Medium"},boldButton:function(tb,nb){lb.toggleButton(nb,"bold"===tb.fontWeight)},italicButton:function(tb,nb){lb.toggleButton(nb,"italic"===tb.fontStyle)},underlineButton:function(tb,nb){lb.toggleButton(nb,"underline"===tb.textDecoration)},linkButton:function(tb,nb){lb.toggleButton(nb,
!!tb.link)},colorPicker:function(tb,nb){nb.colorValue=tb.fontColor},fontSizeField:function(tb,nb){nb.number=tb.fontSize},fixedWidthControl:function(tb,nb){tb.isText?nb.enable():nb.disable();nb.checked=tb.fixedWidth},fixedHeightControl:function(tb,nb){tb.isText?nb.enable():nb.disable();nb.checked=tb.fixedHeight},lineWrappingControl:function(tb,nb){var Y=$jscomp.makeIterator(nb.submorphs);nb=Y.next().value;Y=Y.next().value;nb.checked=!!tb.lineWrapping;tb.isText?nb.enable():nb.disable();Y.deactivated=
!tb.lineWrapping;Y.deactivated?Y.opacity=.5:(Y.opacity=1,Y.selection=tb.lineWrapping)},paddingControl:function(tb,nb){var Y=tb.padding,Ba=Y.left();tb=Y.top();var P=Y.right();Y=Y.bottom();var na=!jb.arr.every([Ba,tb,P,Y],function(Sa){return Sa==Ba});nb.get("multi value indicator").visible=na;jb.connect(nb.get("multi value indicator"),"onMouseDown",nb.get("padding field"),"number",{converter:"() => left",varMapping:{left:Ba}});nb.get("padding field").number=Ba;nb.get("padding field").visible=!na;nb.get("padding field top").number=
tb;nb.get("padding field left").number=Ba;nb.get("padding field right").number=P;nb.get("padding field bottom").number=Y}},["left","center","right","block"].reduce(function(tb,nb){tb[nb+"Align"]=function(Y,Ba){Ba.deactivated=!Y.isText;lb.toggleButton(Ba,Y.textAlign==nb)};return tb},{}))}},ui:{get:function(){var lb=this,tb={fontSelection:"font selection",fontWeightSelection:"font weight selection",boldButton:"bold button",italicButton:"italic button",underlineButton:"underline button",linkButton:"link button",
leftAlign:"left align",centerAlign:"center align",rightAlign:"right align",blockAlign:"block align",fontSizeField:"font size field",colorPicker:"color picker",copyStyleButton:"copy style",applyStyleButton:"apply style",removeStyleButton:"remove style",fixedHeightControl:"fixed height control",fixedWidthControl:"fixed width control",lineWrappingControl:"line wrapping control",paddingControl:"padding control",paddingField:"padding field",paddingFieldTop:"padding field top",paddingFieldLeft:"padding field left",
paddingFieldRight:"padding field right",paddingFieldBottom:"padding field bottom"};return jb.obj.extract(tb,jb.obj.keys(tb),function(nb,Y){return lb.getSubmorphNamed(Y)})}}}}},{key:"openDebouncedFor",value:function(lb){var tb=lb.selection;if(tb.isEmpty()){var nb=jb.cachedControls.get(lb);nb&&(nb.update(),nb.alignAtTarget(),nb.world()||lb.world().addMorph(nb))}else jb.fun.debounceNamed(lb.id+"openRichTextControl",600,function(){var Y=jb.cachedControls.get(lb);tb.isEmpty()?Y&&Y.removeFocus():(Y&&Y.world()||
(Y=new jb.RichTextControl,jb.cachedControls.set(lb,Y)),lb.world().addMorph(Y),Y.focusOn(lb,!0),Y.alwaysTargetFocusedMorph())})()}},{key:"openFor",value:function(lb){var tb=jb.cachedControls.get(lb);tb?tb.update():(tb=new jb.RichTextControl,jb.cachedControls.set(lb,tb),tb.focusOn(lb,!0),tb.alwaysTargetFocusedMorph());tb.alignAtTarget();tb.world()||lb.world().addMorph(tb);return tb}}],Hb,{pathInPackage:function(){return"text/ui.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},
subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"lively.ide",version:"0.1.0"}}},{start:624,end:17067})}(jb.Morph);jb.RichTextControl=yb;jb.RichTextControl=yb;jb.RichTextControl=yb;yb=lively.FreezerRuntime.recorderFor("ProtoSearchField/index.js");yb.SearchField=lc;var Ja=function(Xa){var Hb=lively.FreezerRuntime.recorderFor("ProtoSearchField/index.js"),ic=Hb.hasOwnProperty("ProtoSearchField")&&"function"===typeof Hb.ProtoSearchField?Hb.ProtoSearchField:
Hb.ProtoSearchField=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Gd(ic,Xa,void 0,[{key:Symbol.for("__LivelyClassName__"),get:function(){return"ProtoSearchField"}},{key:"properties",get:function(){return{master:{initialize:function(){}}}}}],Hb,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},
package:function(){return{name:"ProtoSearchField",version:"0.1.1-0"}}},{start:76,end:221})}(yb.SearchField);Ja=yb.ProtoSearchField;yb.default=Ja;var Ta=lively.FreezerRuntime.recorderFor("ProtoTree/index.js");Ta.Tree=rc;Ta.TreeData=Kb;yb=function(Xa){var Hb=lively.FreezerRuntime.recorderFor("ProtoTree/index.js"),ic=Hb.hasOwnProperty("TestTreeData")&&"function"===typeof Hb.TestTreeData?Hb.TestTreeData:Hb.TestTreeData=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,
arguments)};return Gd(ic,Xa,[{key:"display",value:function(lb){return lb.name}},{key:"isCollapsed",value:function(lb){return lb.isCollapsed}},{key:"collapse",value:function(lb,tb){lb.isCollapsed=tb}},{key:"getChildren",value:function(lb){return lb.isLeaf?null:lb.isCollapsed?[]:lb.children}},{key:"isLeaf",value:function(lb){return lb.isLeaf}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"TestTreeData"}}],Hb,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},
subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"ProtoTree",version:"0.1.1-2"}}},{start:113,end:417})}(Ta.TreeData);Ta.TestTreeData=yb;Ta.TestTreeData=yb;Ta.TestTreeData=yb;yb=function(Xa){var Hb=lively.FreezerRuntime.recorderFor("ProtoTree/index.js"),ic=Hb.hasOwnProperty("ProtoTree")&&"function"===typeof Hb.ProtoTree?Hb.ProtoTree:Hb.ProtoTree=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,
arguments)};return Gd(ic,Xa,void 0,[{key:Symbol.for("__LivelyClassName__"),get:function(){return"ProtoTree"}},{key:"properties",get:function(){return{treeData:{initialize:function(){this.treeData=new Ta.TestTreeData({name:"root",isCollapsed:!1,isLeaf:!1,children:[{name:"child 1",isLeaf:!0},{name:"child 2",isLeaf:!1,isCollapsed:!0,children:[{name:"child 2 - 1",isLeaf:!0}]},{name:"child 3",isLeaf:!1,isCollapsed:!1,children:[{name:"child 3 - 1",isLeaf:!0},{name:"child 3 - 2",isLeaf:!0}]},{name:"child 4",
isLeaf:!0}]})}},master:{initialize:function(){}}}}}],Hb,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"ProtoTree",version:"0.1.1-2"}}},{start:434,end:1297})}(Ta.Tree);yb=Ta.ProtoTree;Ta.default=yb;var Ka=lively.FreezerRuntime.recorderFor("RadioButton/index.js");Ka.Morph=Qc;Ka.Color=Wd;Ka.pt=ne;Ka.connect=Tb;Ka.Closure=qc;yb=function(Xa){var Hb=
lively.FreezerRuntime.recorderFor("RadioButton/index.js"),ic=Hb.hasOwnProperty("RadioButton")&&"function"===typeof Hb.RadioButton?Hb.RadioButton:Hb.RadioButton=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Gd(ic,Xa,[{key:"reset",value:function(){var lb=this.indicator;lb.borderWidth=1;lb.borderColor=Ka.Color.gray;this.selected=!1;Ka.connect(lb,"onMouseUp",this,"select")}},{key:"morph",get:function(){var lb=
this.indicator;return this.submorphs.find(function(tb){return tb!==lb})}},{key:"morph",set:function(lb){var tb=this.indicator;this.submorphs.forEach(function(nb){nb!==tb&&nb.remove()});lb.position=Ka.pt(50,0);this.addMorph(lb)}},{key:"value",get:function(){if(!this.valueFn){try{var lb=JSON.parse(this.valueFunctionString)}catch(tb){lb=this.valueFunctionString}this.valueFn=Ka.Closure.fromSource(lb).recreateFunc()}return this.morph?this.valueFn(this.morph):void 0}},{key:"onMouseDown",value:function(lb){this.select()}},
{key:"select",value:function(){this.selected=!0;this.owner.setSelection(this)}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"RadioButton"}},{key:"properties",get:function(){return{indicator:{get:function(){return this.getSubmorphNamed("indicator")}},selectionColor:{},selectionStyle:{},selected:{after:["indicator"],defaultValue:!1,set:function(lb){var tb=this;this.whenRendered().then(function(nb){lb?(tb.indicator.fill=tb.selectionColor,tb.animate({opacity:1,duration:200})):(tb.indicator.fill=
Ka.Color.transparant,tb.animate({opacity:.5,duration:200}))});this.setProperty("selected",!!lb)}},valueFunctionString:{defaultValue:'"function (morph) { return morph.value; }"',set:function(lb){this.setProperty("valueFunctionString",lb.toString());this.valueFn=void 0}}}}}],Hb,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"RadioButton",
version:"0.1.1-48"}}},{start:210,end:2235})}(Ka.Morph);yb=Ka.RadioButton;Ka.default=yb;yb=lively.FreezerRuntime.recorderFor("ProtoNumberWidget/index.js");yb.NumberWidget=ad;Ja=function(Xa){var Hb=lively.FreezerRuntime.recorderFor("ProtoNumberWidget/index.js"),ic=Hb.hasOwnProperty("ProtoNumberWidget")&&"function"===typeof Hb.ProtoNumberWidget?Hb.ProtoNumberWidget:Hb.ProtoNumberWidget=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,
arguments)};return Gd(ic,Xa,void 0,[{key:Symbol.for("__LivelyClassName__"),get:function(){return"ProtoNumberWidget"}},{key:"properties",get:function(){return{master:{initialize:function(){}}}}}],Hb,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"ProtoNumberWidget",version:"0.1.1-0"}}},{start:76,end:224})}(yb.NumberWidget);Ja=yb.ProtoNumberWidget;
yb.default=Ja;yb=lively.FreezerRuntime.recorderFor("FrameResizer/index.js");yb.Morph=Qc;Ja=function(Xa){var Hb=lively.FreezerRuntime.recorderFor("FrameResizer/index.js"),ic=Hb.hasOwnProperty("FrameResizer")&&"function"===typeof Hb.FrameResizer?Hb.FrameResizer:Hb.FrameResizer=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Gd(ic,Xa,[{key:"onDrag",value:function(lb){var tb=this.owner.left;lb=lb.positionIn(this).x;
lb*="left"==this.direction?-1:1;this.owner.width+=lb;350>this.owner.width&&(lb+=350-this.owner.width,this.owner.width=350);this.owner.left="left"==this.direction?tb-lb:tb}}],[{key:Symbol.for("__LivelyClassName__"),get:function(){return"FrameResizer"}},{key:"properties",get:function(){return{direction:{type:"Enum",values:["left","right"]}}}}],Hb,{pathInPackage:function(){return"index.js"},unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},
package:function(){return{name:"FrameResizer",version:"0.1.1-24"}}},{start:56,end:840})}(yb.Morph);Ja=yb.FrameResizer;yb.default=Ja;var Fa=lively.FreezerRuntime.recorderFor("ShapeLayoutControl/index.js");Fa.Morph=Qc;Fa.morph=Ic;Fa.layouts=Hc;Fa.string=wb;Fa.connect=Tb;Fa.noUpdate=od;Fa.InteractiveMorphSelector=dd;Fa.Color=Wd;Fa.pt=ne;yb=function(Xa){var Hb=lively.FreezerRuntime.recorderFor("ShapeLayoutControl/index.js"),ic=Hb.hasOwnProperty("ShapeLayoutControl")&&"function"===typeof Hb.ShapeLayoutControl?
Hb.ShapeLayoutControl:Hb.ShapeLayoutControl=function(lb){lb&&lb[Symbol.for("lively-instance-restorer")]||this[Symbol.for("lively-instance-initialize")].apply(this,arguments)};return Gd(ic,Xa,[{key:"focusOn",value:function(lb){this.target=lb;this.update(!1)}},{key:"setupConnections",value:function(){var lb=this.ui;Fa.connect(lb.submorphSettingsControl,"fire",this,"chooseSubmorphToChangeLayoutSettings");Fa.connect(lb.dragmeControl,"onDragStart",this,"onSubmorphSettingsDragStart");Fa.connect(lb.xAxisPolicyControl,
"selection",this,"updateSubmorphProportionalLayoutSettings",{converter:'policy => ({\n        policy,\n        axis: "x",\n        submorph: self.selectedSubmorph,\n      })',varMapping:{self:this}});Fa.connect(lb.yAxisPolicyControl,"selection",this,"updateSubmorphProportionalLayoutSettings",{converter:'policy => ({\n        policy,\n        axis: "y",\n        submorph: self.selectedSubmorph,\n      })',varMapping:{self:this}});for(var tb={},nb=$jscomp.makeIterator(this.managedProps),Y=nb.next();!Y.done;tb=
{$jscomp$loop$prop$prop$2594:tb.$jscomp$loop$prop$prop$2594},Y=nb.next()){var Ba=$jscomp.makeIterator(Y.value),P=Ba.next().value;Y=Ba.next().value;Ba.next().value||(tb.$jscomp$loop$prop$prop$2594=this.join(P),Ba=lb[this.join(P,"control")],Fa.connect(Ba,Y,this,"updateLayout",{updater:function(na){return function(Sa,hb){Sa(na.$jscomp$loop$prop$prop$2594,hb)}}(tb),varMapping:{prop:tb.$jscomp$loop$prop$prop$2594}}))}}},{key:"lower",value:function(lb){return lb.charAt(0).toLowerCase()+lb.slice(1)}},{key:"join",
value:function(lb,tb){return this.lower(Fa.string.camelCaseString(lb+(tb?" "+tb:"")))}},{key:"updateLayoutOfTarget",value:function(lb){lb=Fa.layouts[Fa.string.camelCaseString(lb)];this.target.layout=lb?new lb({autoResize:!1}):null;this.update()}},{key:"updateLayout",value:function(lb,tb){this.target.layout[lb]=tb}},{key:"update",value:function(lb){var tb=this;this.target&&Fa.noUpdate(function(){for(var nb=tb.ui,Y=tb.target.layout||{name:function(){return"No"}},Ba=$jscomp.makeIterator(tb.managedProps),
P=Ba.next();!P.done;P=Ba.next()){var na=$jscomp.makeIterator(P.value);P=na.next().value;var Sa=na.next().value;na.next();na=nb[tb.join(P,"control")];var hb=nb[tb.join(P,"label")];if(Sa)if("type"===P)na.selection=Y.name()+" Layout";else{var cc=Y[tb.join(P)],Uc="undefined"!==typeof cc;if(Uc){switch(P){case "align":na.items=Y.possibleAlignValues;break;case "direction":na.items=Y.possibleDirectionValues;break;case "axis":na.items=Y.possibleAxisValues}na[Sa]=cc}hb.isLayoutable=hb.visible=Uc}}tb.showGridLayoutControl("Grid"===
Y.name());tb.showProportionalControl("Proportional"===Y.name())})}},{key:"updateSubmorphProportionalLayoutSettings",value:function(lb){var tb={};this.target.layout.changeSettingsFor(lb.submorph,(tb[lb.axis]=lb.policy,tb),!0)}},{key:"onSubmorphSettingsDragStart",value:function(lb){var tb=this;lb.stop();var nb=this.target.layout,Y=nb.settingsFor(this.selectedSubmorph),Ba=[],P;for(P in Y)Ba=[].concat($jscomp.arrayFromIterable(Ba),[P+": ",{fontWeight:"bold"},Y[P]+" ",{}]);var na=Fa.morph({type:"label",
fontColor:Fa.Color.white,value:Ba,fill:Fa.Color.black.withA(.7),padding:5,borderRadius:10,isLayoutable:!1});na.wantsToBeDroppedOn=function(Sa){return nb.layoutableSubmorphs.includes(Sa)};na.onBeingDroppedOn=function(Sa,hb){na.remove();if(Sa=nb.layoutableSubmorphs.includes(hb)?hb:lb.world.morphsContainingPoint(lb.hand.position).find(function(cc){return nb.layoutableSubmorphs.includes(cc)}))tb.updateSubmorphProportionalLayoutSettings({policy:Y.x,axis:"x",submorph:Sa}),tb.updateSubmorphProportionalLayoutSettings({policy:Y.y,
axis:"y",submorph:Sa}),Sa.show(),$world.setStatusMessage("layout settings applied")};lb.hand.grab(na);na.moveBy(Fa.pt(10,10))}},{key:"chooseSubmorphToChangeLayoutSettings",value:function(){var lb=this,tb,nb,Y,Ba,P,na,Sa,hb,cc;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Uc){switch(Uc.nextAddress){case 1:return tb=lb.target.layout.layoutableSubmorphs,lb.manageFocus=!0,lb.env.eventDispatcher.isKeyPressed("Shift")?(Y=tb.map(function(Xb){return{isListItem:!0,string:String(Xb),value:Xb}}),
Uc.yield($world.listPrompt("Select morph",Y,{onSelection:function(Xb){return Xb.show()}}),5)):Uc.yield(Fa.InteractiveMorphSelector.selectMorph(lb.world(),lb,function(Xb){return tb.includes(Xb)}),4);case 4:nb=Uc.yieldResult;Uc.jumpTo(3);break;case 5:Ba=Uc.yieldResult,P=$jscomp.makeIterator(Ba.selected),nb=P.next().value;case 3:lb.manageFocus=!1;lb.selectedSubmorph=nb;if(!nb)return Uc.return();na=lb.ui;Sa=na.xAxisPolicyControl;hb=na.yAxisPolicyControl;cc=lb.target.layout.settingsFor(nb);Fa.noUpdate(function(){Sa.selection=
cc.x;hb.selection=cc.y});Uc.jumpToEnd()}})}},{key:"showProportionalControl",value:function(lb){var tb=this.ui;[tb.submorphSettingsControl,tb.dragmeControl,tb.xAxisPolicyControl,tb.xAxisPolicyLabel,tb.yAxisPolicyControl,tb.yAxisPolicyLabel].forEach(function(nb){nb.isLayoutable=lb;nb.visible=lb})}},{key:"showGridLayoutHalo",value:function(){$world.showLayoutHaloFor(this.target)}},{key:"showGridLayoutControl",value:function(lb){var tb=this.ui.configureGridLayoutControl;tb.visible=tb.isLayoutable=lb}}],
[{key:Symbol.for("__LivelyClassName__"),get:function(){return"ShapeLayoutControl"}},{key:"properties",get:function(){return{managedProps:{get:function(){return[["type","selection",!0],["align","selection"],["direction","selection"],["axis","selection"],["spacing","number"],["auto resize","checked"],["resize submorphs","checked"],["x axis policy","selection",!0],["y axis policy","selection",!0],["react to submorph animations","checked"],["submorph settings",!1,!0],["order by index","checked"],["dragme",
!1,!0],["configure grid layout",!1,!0]]}},ui:{readOnly:!0,get:function(){for(var lb={labelContainer:this.getSubmorphNamed("label container"),controlContainer:this.getSubmorphNamed("control container")},tb=$jscomp.makeIterator(this.managedProps),nb=tb.next();!nb.done;nb=tb.next()){var Y=$jscomp.makeIterator(nb.value).next().value;nb=Y+" label";Y+=" control";lb[this.join(nb)]=this.getSubmorphNamed(nb);lb[this.join(Y)]=this.getSubmorphNamed(Y)}return lb}}}}}],Hb,{pathInPackage:function(){return"index.js"},
unsubscribeFromToplevelDefinitionChanges:function(){return function(){}},subscribeToToplevelDefinitionChanges:function(){return function(){}},package:function(){return{name:"ShapeLayoutControl",version:"0.1.1-166"}}},{start:345,end:7771})}(Fa.Morph);yb=Fa.ShapeLayoutControl;Fa.default=yb}}});