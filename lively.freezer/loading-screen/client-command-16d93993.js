System.register(["./__root_module__-89b08ab2.js","kld-intersections"],function(ta){var nb,xb,Ob,Hb,qd;return{setters:[function(Dc){nb=Dc.$;xb=Dc.bn;Ob=Dc.a6;Hb=Dc.a7;qd=Dc.as},function(){}],execute:function(){function Dc(sc,Sa){Sa=void 0===Sa?{}:Sa;var ob=Sa.l2lClient;if(!ob)throw Error("lively.shell client side runCommand needs opts.l2lClient!");ed.ClientCommand.installLively2LivelyServices(ob);ob=new ed.ClientCommand(ob);ob.spawn(Object.assign({command:sc},ed.obj.dissoc(Sa,["l2lClient"])));
return ob}function hd(sc){return ed.dirCache[sc.trackerId]?ed.dirCache[sc.trackerId]:Promise.resolve().then(function(){var Sa,ob,$b;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Sb){if(1==Sb.nextAddress)return Sb.yield(sc.sendToAndWait(sc.trackerId,"lively.shell.info",{}),2);Sa=Sb.yieldResult;ob=Sa.data;$b=ob.defaultDirectory;return Sb.return(ed.dirCache[sc.trackerId]=$b)})})}function Hc(sc){var Sa,ob,$b;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Sb){if(1==Sb.nextAddress)return Sb.yield(sc.sendToAndWait(sc.trackerId,
"lively.shell.env",{}),2);Sa=Sb.yieldResult;ob=Sa.data;$b=ob.env;return Sb.return($b)})}function Fc(sc,Sa){Sa=(Sa=void 0===Sa?{}:Sa)||{};var ob=ed.runCommand('cat "'+sc+'"',Sa);return ob.whenDone().then(function(){if(ob.exitCode)throw Error("Read "+sc+" failed: "+ob.stderr);return ob.output})}function Sc(sc,Sa,ob){!ob&&Sa&&Sa.content&&(ob=Sa,Sa=ob.content);var $b=ed.runCommand('tee "'+sc+'"',Object.assign({stdin:Sa||""},ob));return $b.whenDone().then(function(){if($b.exitCode)throw Error("Write "+
sc+" failed: "+$b.stderr);return $b})}ta({defaultDirectory:hd,env:Hc,readFile:Fc,runCommand:Dc,writeFile:Sc});var ad=lively.FreezerRuntime.recorderFor("lively.shell/command-interface.js");ad.promise=nb;ad.events=xb;var Jd=function(){this._stderr=this._stdout="";this.exitCode=void 0;this.commandString="";this.process=null;this._whenDone=ad.promise.deferred();this._whenStarted=ad.promise.deferred();this.startTime=0;this.lastSignal=null;ad.events.makeEmitter(this)};Jd.findCommand=function(sc){return this.commands.find(function(Sa){return Sa.pid===
sc})};Jd.prototype.isRunning=function(){return this.process&&void 0===this.exitCode};Jd.prototype.isDone=function(){return void 0!=this.exitCode};Jd.prototype.whenStarted=function(){return this._whenStarted.promise};Jd.prototype.whenDone=function(){return this._whenDone.promise};Jd.prototype.spawn=function(sc){throw Error("not yet implemented");};Jd.prototype.kill=function(sc){this.lastSignal=void 0===sc?"KILL":sc};Jd.prototype.toString=function(){return this.constructor.name+"("+this.commandString+
", "+this.status+")"};$jscomp.global.Object.defineProperties(Jd.prototype,{isShellCommand:{configurable:!0,enumerable:!0,get:function(){return!0}},status:{configurable:!0,enumerable:!0,get:function(){return this.process?void 0===this.exitCode?"running, pid "+this.pid:"exited "+this.exitCode+", pid "+this.pid:"not started"}},pid:{configurable:!0,enumerable:!0,get:function(){return this.process?this.process.pid:null}},output:{configurable:!0,enumerable:!0,get:function(){return this.stdout+(this.stderr?
"\n"+this.stderr:"")}},stdout:{configurable:!0,enumerable:!0,get:function(){return this._stdout}},stderr:{configurable:!0,enumerable:!0,get:function(){return this._stderr}}});$jscomp.global.Object.defineProperties(Jd,{commands:{configurable:!0,enumerable:!0,get:function(){return this._commands||(this._commands=[])}}});ad.CommandInterface=Jd;ad.default=Jd;var ed=lively.FreezerRuntime.recorderFor("lively.shell/client-command.js");ed.runCommand=Dc;ed.defaultDirectory=hd;ed.env=Hc;ed.readFile=Fc;ed.writeFile=
Sc;ed.CommandInterface=Jd;ed.promise=nb;ed.arr=Ob;ed.obj=Hb;ed.signal=qd;ed.debug=!1;ed.runCommand=Dc;ed.runCommand=Dc;ed.dirCache={};ed.defaultDirectory=hd;ed.defaultDirectory=hd;ed.env=Hc;ed.env=Hc;ed.readFile=Fc;ed.readFile=Fc;ed.writeFile=Sc;ed.writeFile=Sc;Jd=function(sc){var Sa=ed.CommandInterface.call(this)||this;Sa.debug=ed.debug;Sa.l2lClient=sc;return Sa};$jscomp.inherits(Jd,ed.CommandInterface);Jd.installLively2LivelyServices=function(sc){Object.keys(ed.L2LServices).forEach(function(Sa){return sc.addService(Sa,
function(ob,$b,Sb){return $jscomp.asyncExecutePromiseGeneratorProgram(function(Bc){return Bc.return(ed.L2LServices[Sa](ob,$b,Sb))})})})};Jd.prototype.envForCommand=function(sc){var Sa=this.l2lClient,ob=Sa.id,$b=Sa.origin,Sb=Sa.path;Sa=Sa.namespace;var Bc=sc||{};sc=Bc.env;Bc=Bc.owner;sc=sc||{};Bc&&(sc.LIVELY_COMMAND_OWNER=Bc);return Object.assign({ASKPASS_SESSIONID:ob,L2L_EDITOR_SESSIONID:ob,L2L_SESSIONTRACKER_SERVER:$b,L2L_SESSIONTRACKER_PATH:Sb,L2L_SESSIONTRACKER_NS:Sa},sc)};Jd.prototype.spawn=function(sc){sc=
void 0===sc?{command:null,env:{},cwd:null,stdin:null}:sc;var Sa=this,ob,$b,Sb,Bc,id,Xb,Ub,ub,hc,wc,bd;return $jscomp.asyncExecutePromiseGeneratorProgram(function(cd){if(1==cd.nextAddress)return ob=Sa,$b=ob.l2lClient,Sb=sc,Bc=Sb.command,id=Sb.env,Xb=Sb.cwd,Ub=Sb.stdin,Sa.startTime=new Date,id=Sa.envForCommand(sc),Sa.debug&&console.log(Sa+" spawning "+Bc),Sa.debug&&Sa.whenStarted().then(function(){return console.log(Sa+" started")}),Sa.debug&&Sa.whenDone().then(function(){return console.log(Sa+" exited")}),
ed.arr.pushIfNotIncluded(Sa.constructor.commands,Sa),Sa.commandString=Array.isArray(Bc)?Bc.join(""):Bc,cd.yield($b.sendToAndWait($b.trackerId,"lively.shell.spawn",{command:Bc,env:id,cwd:Xb,stdin:Ub},{ackTimeout:3E4}),2);ub=cd.yieldResult;hc=ub.data;wc=hc.error;bd=hc.pid;if(wc)throw ed.debug&&console.error("["+Sa+"] error at start: "+wc),Sa.process={error:wc},Sa.exitCode=1,ed.signal(Sa,"error",wc),Error(wc);Sa.process={pid:bd};ed.debug&&console.log("["+Sa+"] got pid "+bd);ed.signal(Sa,"pid",bd);Sa._whenStarted.resolve();
return cd.return(Sa)})};Jd.prototype.writeToStdin=function(sc){var Sa=this,ob,$b,Sb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Bc){if(!Sa.isRunning())return Bc.return();ob=Sa;$b=ob.l2lClient;Sb=ob.pid;return Bc.yield($b.sendToAndWait($b.trackerId,"lively.shell.writeToStdin",{pid:Sb,stdin:String(sc)}),0)})};Jd.prototype.kill=function(sc){sc=void 0===sc?"KILL":sc;var Sa=this,ob,$b,Sb,Bc,id,Xb,Ub;return $jscomp.asyncExecutePromiseGeneratorProgram(function(ub){if(1==ub.nextAddress){if(!Sa.isRunning())return ub.return();
ed.debug&&console.log(Sa+" signaling "+sc);Sa.lastSignal=sc;ob=Sa;$b=ob.pid;Sb=ob.l2lClient;return ub.yield(Sb.sendToAndWait(Sb.trackerId,"lively.shell.kill",{pid:$b}),2)}Bc=ub.yieldResult;id=Bc.data;Xb=id.status;Ub=id.error;ed.debug&&console.log(Sa+" kill send: "+(Ub||Xb));if(Ub)throw Error(Ub);return ub.return(Sa.whenDone())})};Jd.prototype.onOutput=function(sc){var Sa=sc.stdout;sc=sc.stderr;Sa&&(this._stdout+=Sa,ed.signal(this,"stdout",Sa),this.emit("stdout",Sa));sc&&(this._stderr+=sc,ed.signal(this,
"stderr",sc),this.emit("stderr",sc))};Jd.prototype.onClose=function(sc){ed.arr.remove(this.constructor.commands,this);this.exitCode=sc;this.emit("close",sc);ed.signal(this,"close",sc);this._whenDone.resolve(this)};Jd.prototype.onError=function(sc){ed.arr.remove(this.constructor.commands,this);this._stderr+=sc.stack;this.exitCode=1;this.emit("error",sc.stack);ed.signal(this,"error",sc.stack);this._whenDone.reject(sc)};ta("default",Jd);ed.ClientCommand=Jd;ed.L2LServices={"lively.shell.onOutput":function(sc,
Sa,ob,$b){sc=Sa.data;var Sb=sc.pid,Bc=sc.stdout,id=sc.stderr,Xb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Ub){switch(Ub.nextAddress){case 1:return ed.debug&&console.log("[lively.shell] client received lively.shell.onOutput for command "+Sb),Ub.setCatchFinallyBlocks(2),Ub.yield(ed.promise.waitFor(1E3,function(){return ed.ClientCommand.findCommand(Sb)}),4);case 4:Xb=Ub.yieldResult;Ub.leaveTryBlock(3);break;case 2:return Ub.enterCatchBlock(),console.warn("[lively.shell] received output for command "+
Sb+" but it isn't registered!'"),Ub.return();case 3:Xb.onOutput({stdout:Bc,stderr:id}),Ub.jumpToEnd()}})},"lively.shell.onExit":function(sc,Sa,ob,$b){sc=Sa.data;var Sb=sc.pid,Bc=sc.code,id=sc.error,Xb;return $jscomp.asyncExecutePromiseGeneratorProgram(function(Ub){switch(Ub.nextAddress){case 1:return ed.debug&&console.log("[lively.shell] client received lively.shell.onExit for command "+Sb),Ub.setCatchFinallyBlocks(2),Ub.yield(ed.promise.waitFor(1E3,function(){return ed.ClientCommand.findCommand(Sb)}),
4);case 4:Xb=Ub.yieldResult;Ub.leaveTryBlock(3);break;case 2:return Ub.enterCatchBlock(),console.warn("[lively.shell] received exit message for command "+Sb+" but it isn't registered!'"),Ub.return();case 3:if(id)"string"===typeof id&&(id=Error(id)),Xb.onError(id);else Xb.onClose(Bc);Ub.jumpToEnd()}})}};ed.default=Jd}}});