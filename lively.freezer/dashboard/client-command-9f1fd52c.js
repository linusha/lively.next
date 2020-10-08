System.register(["./__root_module__-cd530690.js","kld-intersections"],function(Da){var zb,Rb,kc,dc,ke;return{setters:[function(hd){zb=hd._;Rb=hd.bm;kc=hd.a5;dc=hd.a6;ke=hd.aq},function(){}],execute:function(){function hd(nd,Za){Za=void 0===Za?{}:Za;var Cb=Za.l2lClient;if(!Cb)throw Error("lively.shell client side runCommand needs opts.l2lClient!");Ud.ClientCommand.installLively2LivelyServices(Cb);Cb=new Ud.ClientCommand(Cb);Cb.spawn(Object.assign({command:nd},Ud.obj.dissoc(Za,["l2lClient"])));
return Cb}function $d(nd){return Ud.dirCache[nd.trackerId]?Ud.dirCache[nd.trackerId]:Promise.resolve().then(function(){var Za,Cb,bc;return $jscomp.asyncExecutePromiseGeneratorProgram(function(ic){if(1==ic.nextAddress)return ic.yield(nd.sendToAndWait(nd.trackerId,"lively.shell.info",{}),2);Za=ic.yieldResult;Cb=Za.data;bc=Cb.defaultDirectory;return ic.return(Ud.dirCache[nd.trackerId]=bc)})})}function md(nd){var Za,Cb,bc;return $jscomp.asyncExecutePromiseGeneratorProgram(function(ic){if(1==ic.nextAddress)return ic.yield(nd.sendToAndWait(nd.trackerId,
"lively.shell.env",{}),2);Za=ic.yieldResult;Cb=Za.data;bc=Cb.env;return ic.return(bc)})}function Qc(nd,Za){Za=(Za=void 0===Za?{}:Za)||{};var Cb=Ud.runCommand('cat "'+nd+'"',Za);return Cb.whenDone().then(function(){if(Cb.exitCode)throw Error("Read "+nd+" failed: "+Cb.stderr);return Cb.output})}function xd(nd,Za,Cb){!Cb&&Za&&Za.content&&(Cb=Za,Za=Cb.content);var bc=Ud.runCommand('tee "'+nd+'"',Object.assign({stdin:Za||""},Cb));return bc.whenDone().then(function(){if(bc.exitCode)throw Error("Write "+
nd+" failed: "+bc.stderr);return bc})}Da({defaultDirectory:$d,env:md,readFile:Qc,runCommand:hd,writeFile:xd});var Od=lively.FreezerRuntime.recorderFor("lively.shell/command-interface.js");Od.promise=zb;Od.events=Rb;var ge=function(){this._stderr=this._stdout="";this.exitCode=void 0;this.commandString="";this.process=null;this._whenDone=Od.promise.deferred();this._whenStarted=Od.promise.deferred();this.startTime=0;this.lastSignal=null;Od.events.makeEmitter(this)};ge.findCommand=function(nd){return this.commands.find(function(Za){return Za.pid===
nd})};ge.prototype.isRunning=function(){return this.process&&void 0===this.exitCode};ge.prototype.isDone=function(){return void 0!=this.exitCode};ge.prototype.whenStarted=function(){return this._whenStarted.promise};ge.prototype.whenDone=function(){return this._whenDone.promise};ge.prototype.spawn=function(nd){throw Error("not yet implemented");};ge.prototype.kill=function(nd){this.lastSignal=void 0===nd?"KILL":nd};ge.prototype.toString=function(){return this.constructor.name+"("+this.commandString+
", "+this.status+")"};$jscomp.global.Object.defineProperties(ge.prototype,{isShellCommand:{configurable:!0,enumerable:!0,get:function(){return!0}},status:{configurable:!0,enumerable:!0,get:function(){return this.process?void 0===this.exitCode?"running, pid "+this.pid:"exited "+this.exitCode+", pid "+this.pid:"not started"}},pid:{configurable:!0,enumerable:!0,get:function(){return this.process?this.process.pid:null}},output:{configurable:!0,enumerable:!0,get:function(){return this.stdout+(this.stderr?
"\n"+this.stderr:"")}},stdout:{configurable:!0,enumerable:!0,get:function(){return this._stdout}},stderr:{configurable:!0,enumerable:!0,get:function(){return this._stderr}}});$jscomp.global.Object.defineProperties(ge,{commands:{configurable:!0,enumerable:!0,get:function(){return this._commands||(this._commands=[])}}});Od.CommandInterface=ge;Od.default=ge;var Ud=lively.FreezerRuntime.recorderFor("lively.shell/client-command.js");Ud.runCommand=hd;Ud.defaultDirectory=$d;Ud.env=md;Ud.readFile=Qc;Ud.writeFile=
xd;Ud.CommandInterface=ge;Ud.promise=zb;Ud.arr=kc;Ud.obj=dc;Ud.signal=ke;Ud.debug=!1;Ud.runCommand=hd;Ud.runCommand=hd;Ud.dirCache={};Ud.defaultDirectory=$d;Ud.defaultDirectory=$d;Ud.env=md;Ud.env=md;Ud.readFile=Qc;Ud.readFile=Qc;Ud.writeFile=xd;Ud.writeFile=xd;ge=function(nd){var Za=Ud.CommandInterface.call(this)||this;Za.debug=Ud.debug;Za.l2lClient=nd;return Za};$jscomp.inherits(ge,Ud.CommandInterface);ge.installLively2LivelyServices=function(nd){Object.keys(Ud.L2LServices).forEach(function(Za){return nd.addService(Za,
function(Cb,bc,ic){return $jscomp.asyncExecutePromiseGeneratorProgram(function(id){return id.return(Ud.L2LServices[Za](Cb,bc,ic))})})})};ge.prototype.envForCommand=function(nd){var Za=this.l2lClient,Cb=Za.id,bc=Za.origin,ic=Za.path;Za=Za.namespace;var id=nd||{};nd=id.env;id=id.owner;nd=nd||{};id&&(nd.LIVELY_COMMAND_OWNER=id);return Object.assign({ASKPASS_SESSIONID:Cb,L2L_EDITOR_SESSIONID:Cb,L2L_SESSIONTRACKER_SERVER:bc,L2L_SESSIONTRACKER_PATH:ic,L2L_SESSIONTRACKER_NS:Za},nd)};ge.prototype.spawn=function(nd){nd=
void 0===nd?{command:null,env:{},cwd:null,stdin:null}:nd;var Za=this,Cb,bc,ic,id,fe,Zb,rc,Lb,Gc,$c,ed;return $jscomp.asyncExecutePromiseGeneratorProgram(function($b){if(1==$b.nextAddress)return Cb=Za,bc=Cb.l2lClient,ic=nd,id=ic.command,fe=ic.env,Zb=ic.cwd,rc=ic.stdin,Za.startTime=new Date,fe=Za.envForCommand(nd),Za.debug&&console.log(Za+" spawning "+id),Za.debug&&Za.whenStarted().then(function(){return console.log(Za+" started")}),Za.debug&&Za.whenDone().then(function(){return console.log(Za+" exited")}),
Ud.arr.pushIfNotIncluded(Za.constructor.commands,Za),Za.commandString=Array.isArray(id)?id.join(""):id,$b.yield(bc.sendToAndWait(bc.trackerId,"lively.shell.spawn",{command:id,env:fe,cwd:Zb,stdin:rc},{ackTimeout:3E4}),2);Lb=$b.yieldResult;Gc=Lb.data;$c=Gc.error;ed=Gc.pid;if($c)throw Ud.debug&&console.error("["+Za+"] error at start: "+$c),Za.process={error:$c},Za.exitCode=1,Ud.signal(Za,"error",$c),Error($c);Za.process={pid:ed};Ud.debug&&console.log("["+Za+"] got pid "+ed);Ud.signal(Za,"pid",ed);Za._whenStarted.resolve();
return $b.return(Za)})};ge.prototype.writeToStdin=function(nd){var Za=this,Cb,bc,ic;return $jscomp.asyncExecutePromiseGeneratorProgram(function(id){if(!Za.isRunning())return id.return();Cb=Za;bc=Cb.l2lClient;ic=Cb.pid;return id.yield(bc.sendToAndWait(bc.trackerId,"lively.shell.writeToStdin",{pid:ic,stdin:String(nd)}),0)})};ge.prototype.kill=function(nd){nd=void 0===nd?"KILL":nd;var Za=this,Cb,bc,ic,id,fe,Zb,rc;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Lb){if(1==Lb.nextAddress){if(!Za.isRunning())return Lb.return();
Ud.debug&&console.log(Za+" signaling "+nd);Za.lastSignal=nd;Cb=Za;bc=Cb.pid;ic=Cb.l2lClient;return Lb.yield(ic.sendToAndWait(ic.trackerId,"lively.shell.kill",{pid:bc}),2)}id=Lb.yieldResult;fe=id.data;Zb=fe.status;rc=fe.error;Ud.debug&&console.log(Za+" kill send: "+(rc||Zb));if(rc)throw Error(rc);return Lb.return(Za.whenDone())})};ge.prototype.onOutput=function(nd){var Za=nd.stdout;nd=nd.stderr;Za&&(this._stdout+=Za,Ud.signal(this,"stdout",Za),this.emit("stdout",Za));nd&&(this._stderr+=nd,Ud.signal(this,
"stderr",nd),this.emit("stderr",nd))};ge.prototype.onClose=function(nd){Ud.arr.remove(this.constructor.commands,this);this.exitCode=nd;this.emit("close",nd);Ud.signal(this,"close",nd);this._whenDone.resolve(this)};ge.prototype.onError=function(nd){Ud.arr.remove(this.constructor.commands,this);this._stderr+=nd.stack;this.exitCode=1;this.emit("error",nd.stack);Ud.signal(this,"error",nd.stack);this._whenDone.reject(nd)};Da("default",ge);Ud.ClientCommand=ge;Ud.L2LServices={"lively.shell.onOutput":function(nd,
Za,Cb,bc){nd=Za.data;var ic=nd.pid,id=nd.stdout,fe=nd.stderr,Zb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(rc){switch(rc.nextAddress){case 1:return Ud.debug&&console.log("[lively.shell] client received lively.shell.onOutput for command "+ic),rc.setCatchFinallyBlocks(2),rc.yield(Ud.promise.waitFor(1E3,function(){return Ud.ClientCommand.findCommand(ic)}),4);case 4:Zb=rc.yieldResult;rc.leaveTryBlock(3);break;case 2:return rc.enterCatchBlock(),console.warn("[lively.shell] received output for command "+
ic+" but it isn't registered!'"),rc.return();case 3:Zb.onOutput({stdout:id,stderr:fe}),rc.jumpToEnd()}})},"lively.shell.onExit":function(nd,Za,Cb,bc){nd=Za.data;var ic=nd.pid,id=nd.code,fe=nd.error,Zb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(rc){switch(rc.nextAddress){case 1:return Ud.debug&&console.log("[lively.shell] client received lively.shell.onExit for command "+ic),rc.setCatchFinallyBlocks(2),rc.yield(Ud.promise.waitFor(1E3,function(){return Ud.ClientCommand.findCommand(ic)}),
4);case 4:Zb=rc.yieldResult;rc.leaveTryBlock(3);break;case 2:return rc.enterCatchBlock(),console.warn("[lively.shell] received exit message for command "+ic+" but it isn't registered!'"),rc.return();case 3:if(fe)"string"===typeof fe&&(fe=Error(fe)),Zb.onError(fe);else Zb.onClose(id);rc.jumpToEnd()}})}};Ud.default=ge}}});