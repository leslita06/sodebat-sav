(function(){
"use strict";
var S=window.S, ICO=window.ICO, NOW=new Date(S.now+":00");
var $=function(id){return document.getElementById(id);};
function f1(x){return (Math.round(x*10)/10).toString().replace(".",",");}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function ic(n,c){return '<svg class="i'+(c?" "+c:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||"")+"</svg>";}
function pl(n,s,p){return n+" "+(n>1?(p||s+"s"):s);}
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],MC=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."],JRS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
function dt(s){return new Date(s.length>10?s+":00":s+"T00:00:00");}
function dd(s){var d=dt(s);return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2);}
function hm(s){return s.slice(11,16).replace(":"," h ");}
function longD(s){var d=dt(s);return JRS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()];}
function add(s,min){var d=new Date(dt(s).getTime()+min*6e4);return d;}
function hhmm(d){return d.getHours()+" h "+("0"+d.getMinutes()).slice(-2);}
function dur(h){if(h<1)return Math.round(h*60)+" min";if(h<48)return f1(h)+" h";return Math.round(h/24)+" j";}
function mn(m){return m<60?m+" min":Math.floor(m/60)+" h "+("0"+(m%60)).slice(-2);}
var TECH={};S.techs.forEach(function(t){TECH[t.id]=t;});
function av(id){var t=TECH[id];return '<span class="av '+t.c+'" title="'+esc(t.nom)+'">'+id+"</span>";}
var C={acc:"#004AAD",sky:"#38B6FF",ink:"#3A3A3B",red:"#C8352B",amb:"#D99A1E",grn:"#18794E",gry:"#D4D4D0",line:"#E3E8EF",mut:"#6B6B6B",pale:"#C9DDF5"};
var ZC={nord:C.acc,sud:C.sky,int:C.ink};
var MOB=function(){return window.matchMedia("(max-width:700px)").matches;};
var ST={attente:["Attente de pièce","a"],accord:["Attente d'accord client","a"],repar:["En intervention","o"],resolu:["Résolu","g"]};
S.t.forEach(function(t){t.td=dt(t.d);});

/* ---------- filtres ---------- */
var F={per:365,zone:"",tech:"",type:""};
var PER=[[30,"30 jours"],[90,"90 jours"],[365,"12 mois"]];
var TYPES=["Ascenseur","Monte-charge","Escalator","Monte-malades"];
function keepA(t){return (!F.zone||t.zone===F.zone)&&(!F.tech||t.tech===F.tech)&&(!F.type||t.type===F.type);}
function inPer(t){return (NOW-t.td)/864e5<=F.per||t.st!=="resolu";}
function TK(){return S.t.filter(function(t){return keepA(t)&&inPer(t);});}
function anyF(){return F.zone||F.tech||F.type;}
function fdesc(){var p=[];if(F.zone)p.push(S.zones[F.zone]);if(F.tech)p.push(TECH[F.tech].nom);if(F.type)p.push(F.type+"s");return p.join(", ");}
function perTxt(){return F.per===365?"sur 12 mois":"sur les "+F.per+" derniers jours";}
function closeMenus(){document.querySelectorAll(".menu.on").forEach(function(m){m.classList.remove("on");});}
document.addEventListener("click",closeMenus);
function menu(key,btn,box,items){
  btn.addEventListener("click",function(e){e.stopPropagation();var on=box.classList.contains("on");closeMenus();
    if(!on){box.innerHTML=items().map(function(it){return '<button class="mi'+(F[key]===it[0]?" on":"")+'" data-k="'+esc(it[0])+'"><span>'+esc(it[1])+(it[2]?"<small>"+esc(it[2])+"</small>":"")+"</span>"+ic("check","ck")+"</button>";}).join("");box.classList.add("on");}});
  box.addEventListener("click",function(e){var b=e.target.closest(".mi");if(!b)return;F[key]=b.getAttribute("data-k");
    if(key==="zone"&&F.zone&&F.tech&&TECH[F.tech].zone!==F.zone)F.tech="";closeMenus();applyF();});
}
function nT(f){return S.t.filter(f).length;}
menu("zone",$("z-b"),$("z-m"),function(){return [["","Toutes les zones",pl(S.t.length,"ticket")+" sur 12 mois"]].concat(Object.keys(S.zones).map(function(z){return [z,S.zones[z],pl(nT(function(t){return t.zone===z;}),"ticket")];}));});
menu("tech",$("t-b"),$("t-m"),function(){return [["","Tous les techniciens",""]].concat(S.techs.filter(function(t){return !F.zone||t.zone===F.zone;}).map(function(t){return [t.id,t.nom,S.zones[t.zone]+", "+pl(nT(function(x){return x.tech===t.id;}),"ticket")];}));});
menu("type",$("y-b"),$("y-m"),function(){return [["","Tous les appareils",""]].concat(TYPES.map(function(y){return [y,y+"s",pl(nT(function(t){return t.type===y;}),"ticket")];}));});
$("per").innerHTML=PER.map(function(p){return '<button data-p="'+p[0]+'">'+p[1]+"</button>";}).join("");
$("per").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;F.per=+b.getAttribute("data-p");applyF();});
$("f-x").addEventListener("click",function(){F.zone=F.tech=F.type="";applyF();});
function applyF(){
  $("z-l").textContent=F.zone?S.zones[F.zone]:"Toutes les zones";
  $("t-l").textContent=F.tech?TECH[F.tech].nom:"Tous les techniciens";
  $("y-l").textContent=F.type?F.type+"s":"Tous les appareils";
  $("z-b").classList.toggle("on",!!F.zone);$("t-b").classList.toggle("on",!!F.tech);$("y-b").classList.toggle("on",!!F.type);
  [].forEach.call($("per").children,function(b){b.classList.toggle("on",+b.getAttribute("data-p")===F.per);});
  $("f-x").style.display=anyF()?"":"none";PAGE=1;PAGEA=1;render();
}

/* ---------- outils ---------- */
function kc(o){return '<div class="kc'+(o.key?" key":"")+'"><p class="l">'+ic(o.i)+esc(o.l)+'</p><div class="vr"><p class="v">'+o.v+(o.u?"<small>"+o.u+"</small>":"")+'</p></div><p class="s">'+o.s+"</p></div>";}
var charts={};
function mk(id,cfg){if(charts[id])charts[id].destroy();charts[id]=new Chart($(id),cfg);return charts[id];}
Chart.defaults.font.family="Inter, system-ui, sans-serif";Chart.defaults.font.size=12;Chart.defaults.color=C.mut;
if(window.__CAPTURE)Chart.defaults.animation=false;
function avg(a,f){return a.length?a.reduce(function(s,x){return s+f(x);},0)/a.length:0;}
function med(a){if(!a.length)return 0;var b=a.slice().sort(function(x,y){return x-y;});return b[Math.floor(b.length/2)];}
function stars(n){var h="";for(var i=1;i<=5;i++)h+=ic("star",i<=n?"":"off");return '<span class="stars" aria-label="'+n+' sur 5">'+h+"</span>";}
function pill(t){var s=ST[t.st];return '<span class="pill '+s[1]+'">'+(t.st==="resolu"?ic("check"):'<span class="dot"></span>')+s[0]+"</span>";}
function who(t,sub){return '<div class="who"><span class="av cl">'+ic(t.bloq?"users":t.type==="Escalator"?"arrow-up-down":"layers")+'</span><div><p class="nm">'+esc(t.site)+'</p><p class="mt2">'+esc(sub||(t.lib+", "+t.marque))+"</p></div></div>";}
function canalIc(c){return c==="WhatsApp"?"message-circle":c==="Téléphone SAV"?"phone":"calendar-clock";}

/* ---------- Tickets ---------- */
var SEG="tous",PAGE=1,Q="";
function rTickets(){
  var L=TK(),O=L.filter(function(t){return t.st!=="resolu";}),R=L.filter(function(t){return t.st==="resolu";});
  var am=Math.round(avg(L,function(t){return t.arr;})),rap=R.filter(function(t){return t.rap<=24;}).length;
  var bl=L.filter(function(t){return t.bloq;}).length;
  $("lede-t").innerHTML=(anyF()?"<b>"+esc(fdesc())+"</b> : ":"")+pl(L.length,"ticket")+" "+perTxt()+", dont "+pl(bl,"personne bloquée","personnes bloquées")+" en cabine. "+(O.length?'<span class="r">'+pl(O.length,"appareil")+" encore à l'arrêt</span>.":"Aucun appareil à l'arrêt.");
  $("kpis").innerHTML=kc({key:1,i:"timer",l:"Délai moyen d'arrivée sur panne",v:L.length?am:"0",u:"min",s:"<b>"+Math.round(100*L.filter(function(t){return t.arr<=60;}).length/Math.max(1,L.length))+"\u00a0%</b> des arrivées en moins d'une heure"})+
    kc({i:"bell-ring",l:"Tickets en cours",v:O.length,s:O.length?"<b>"+O.filter(function(t){return t.st==="repar";}).length+"</b> en intervention, "+O.filter(function(t){return t.st!=="repar";}).length+" en attente de pièce ou d'accord":"aucun appareil à l'arrêt"})+
    kc({i:"file-check",l:"Rapports envoyés sous 24 h",v:R.length?Math.round(100*rap/R.length):0,u:"%",s:"<b>"+rap+"</b> sur "+pl(R.length,"intervention")+" terminée"+(R.length>1?"s":"")});
  // colonnes
  var C1=O.filter(function(t){return t.st!=="repar";}),C2=O.filter(function(t){return t.st==="repar";}),C3=R.slice().sort(function(a,b){return b.td-a.td;}).slice(0,3);
  function col(tt,dot,arr,emp){return '<div class="bcol"><p class="bcol-h"><span class="d" style="background:'+dot+'"></span>'+tt+'<span class="n">'+arr.length+'</span></p>'+(arr.length?arr.map(card).join(""):'<p class="bempty">'+emp+"</p>")+"</div>";}
  function card(t){return '<button class="tk" data-t="'+t.id+'"><p class="r1"><span>'+t.id+"</span><span>"+(t.st==="resolu"?"le "+dd(t.d):"depuis "+dur(t.dur))+'</span></p><p class="nm">'+esc(t.site)+'</p><p class="ap">'+esc(t.lib)+", "+esc(t.commune)+'</p><p class="cz">'+esc(t.st==="resolu"?t.cause:t.suite)+'</p><div class="r3">'+pill(t)+av(t.tech)+(t.st==="resolu"?'<span class="pill n">Arrivée '+mn(t.arr)+"</span>":"")+"</div></button>";}
  $("board").innerHTML=col("Ouverts, en attente",C.amb,C1,"Aucun ticket en attente.")+col("En intervention",C.acc,C2,"Aucune intervention en cours.")+col("Résolus récemment",C.grn,C3,"Aucun ticket résolu sur la période.");
  // par mois
  var mo=[],d0=new Date(NOW.getFullYear(),NOW.getMonth()-11,1);
  for(var i=0;i<12;i++){var m=new Date(d0.getFullYear(),d0.getMonth()+i,1);mo.push([m.getFullYear()+"-"+("0"+(m.getMonth()+1)).slice(-2),MC[m.getMonth()]]);}
  var LA=S.t.filter(keepA);
  var cnt=mo.map(function(m){return LA.filter(function(t){return t.d.slice(0,7)===m[0];}).length;});
  var arrm=mo.map(function(m){var x=LA.filter(function(t){return t.d.slice(0,7)===m[0];});return x.length?Math.round(avg(x,function(t){return t.arr;})):null;});
  $("u-mois").textContent="12 derniers mois";
  mk("c-mois",{data:{labels:mo.map(function(m){return m[1];}),datasets:[
    {type:"bar",label:"Tickets",data:cnt,backgroundColor:mo.map(function(m){var d=dt(m[0]+"-28");return (NOW-d)/864e5<=F.per+31?C.acc:C.pale;}),borderRadius:4,maxBarThickness:28,yAxisID:"y"},
    {type:"line",label:"Arrivée moyenne (min)",data:arrm,borderColor:C.ink,borderDash:[4,3],borderWidth:1.6,pointRadius:2.5,pointBackgroundColor:C.ink,tension:.3,spanGaps:true,yAxisID:"y1"}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{autoSkip:MOB(),maxRotation:0}},y:{grid:{color:C.line},border:{display:false},ticks:{precision:0}},y1:{position:"right",grid:{display:false},border:{display:false},min:0,ticks:{callback:function(v){return v+" min";}}}}}});
  // canaux
  var CN=["WhatsApp","Téléphone SAV","Visite préventive"],CC=[C.acc,C.sky,C.gry];
  var cc=CN.map(function(c){return L.filter(function(t){return t.canal===c;}).length;});
  mk("c-canal",{type:"doughnut",data:{labels:CN,datasets:[{data:cc,backgroundColor:CC,borderWidth:2,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,cutout:"66%",plugins:{legend:{display:false}}}});
  $("l-canal").innerHTML=CN.map(function(c,i){return '<span><i style="background:'+CC[i]+'"></i>'+c+" <b>"+cc[i]+"</b></span>";}).join("");
  // tableau
  var SG=[["tous","Tous",L.length],["ouverts","En cours",O.length],["bloq","Personne bloquée",L.filter(function(t){return t.bloq;}).length],["resolus","Résolus",R.length]];
  $("seg-t").innerHTML=SG.map(function(s){return '<button data-s="'+s[0]+'" class="'+(SEG===s[0]?"on":"")+'">'+s[1]+' <span class="c">'+s[2]+"</span></button>";}).join("");
  var X=L.filter(function(t){return SEG==="tous"||(SEG==="ouverts"&&t.st!=="resolu")||(SEG==="resolus"&&t.st==="resolu")||(SEG==="bloq"&&t.bloq);});
  if(Q){var q=Q.toLowerCase();X=X.filter(function(t){return (t.site+" "+t.lib+" "+t.id+" "+t.app+" "+t.cause+" "+t.commune).toLowerCase().indexOf(q)>=0;});}
  X.sort(function(a,b){return ((a.st==="resolu")-(b.st==="resolu"))||(b.td-a.td);});
  var V=X.slice(0,PAGE*10);
  $("t-t").innerHTML='<thead><tr><th>Immeuble et appareil</th><th>Ticket</th><th>Cause</th><th class="r">Arrivée</th><th class="r">Arrêt</th><th class="hm">Canal</th><th>Technicien</th><th>Statut</th></tr></thead><tbody>'+
    (V.length?V.map(function(t){return '<tr data-t="'+t.id+'"><td class="w">'+who(t)+'</td><td data-l="Ticket"><b>'+t.id+'</b><small class="sub">'+dd(t.d)+", "+hm(t.d)+'</small></td><td data-l="Cause">'+esc(t.cause)+'</td><td class="r num" data-l="Arrivée">'+mn(t.arr)+'</td><td class="r" data-l="Arrêt">'+dur(t.dur)+'</td><td class="hm" data-l="Canal"><span class="com">'+ic(canalIc(t.canal))+esc(t.canal)+'</span></td><td data-l="Technicien"><span class="com">'+av(t.tech)+(MOB()?"":esc(TECH[t.tech].nom))+'</span></td><td data-l="Statut">'+pill(t)+"</td></tr>";}).join(""):'<tr><td colspan="8"><p class="empty">Aucun ticket ne correspond.</p></td></tr>')+"</tbody>";
  $("more-t").hidden=X.length<=V.length;$("more-t").textContent="Afficher plus ("+(X.length-V.length)+" restants)";
}
$("seg-t").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;SEG=b.getAttribute("data-s");PAGE=1;rTickets();});
$("q-t").addEventListener("input",function(){Q=this.value.trim();PAGE=1;rTickets();});
$("more-t").addEventListener("click",function(){PAGE++;rTickets();});

/* ---------- Délais ---------- */
var PAGEA=1;
function byApp(L){var m={};L.forEach(function(t){(m[t.app]=m[t.app]||[]).push(t);});return Object.keys(m).map(function(k){var a=m[k];return {id:k,a:S.app[k],t:a,n:a.length,arr:Math.round(avg(a,function(t){return t.arr;})),h:a.reduce(function(s,t){return s+t.dur;},0),last:a.reduce(function(s,t){return t.d>s?t.d:s;},""),open:a.some(function(t){return t.st!=="resolu";})};});}
function rDelais(){
  var L=TK(),R=L.filter(function(t){return t.st==="resolu";}),B=L.filter(function(t){return t.bloq;});
  var ab=Math.round(avg(L.filter(function(t){return t.zone!=="int";}),function(t){return t.arr;})),ai=Math.round(avg(L.filter(function(t){return t.zone==="int";}),function(t){return t.arr;}));
  $("lede-d").innerHTML=(anyF()?"<b>"+esc(fdesc())+"</b> : ":"")+"Temps entre le signalement de la panne et l'arrivée du technicien, puis durée de l'arrêt jusqu'à la remise en service, "+perTxt()+".";
  $("kpis-d").innerHTML=kc({key:1,i:"timer",l:"Arrivée moyenne sur panne",v:L.length?Math.round(avg(L,function(t){return t.arr;})):0,u:"min",s:(ab?"<b>"+ab+" min</b> à Abidjan":"")+(ai?(ab?", ":"")+"<b>"+ai+" min</b> à l'intérieur":"")})+
    kc({i:"users",l:"Personne bloquée en cabine",v:B.length?Math.round(avg(B,function(t){return t.arr;})):"0",u:B.length?"min":"",s:"<b>"+B.length+"</b> cas, arrivée moyenne du technicien"})+
    kc({i:"hourglass",l:"Durée médiane d'arrêt",v:f1(med(R.map(function(t){return t.dur;}))),u:"h",s:"<b>"+R.filter(function(t){return t.dur>=24;}).length+"</b> arrêts d'une journée ou plus"});
  var BI=[[0,30,"< 30 min"],[30,45,"30 à 45"],[45,60,"45 à 60"],[60,90,"1 h à 1 h 30"],[90,120,"1 h 30 à 2 h"],[120,1e4,"> 2 h"]];
  mk("c-hist",{type:"bar",data:{labels:BI.map(function(b){return b[2];}),datasets:[{data:BI.map(function(b){return L.filter(function(t){return t.arr>=b[0]&&t.arr<b[1];}).length;}),backgroundColor:BI.map(function(b){return b[1]<=60?C.acc:b[0]>=90?C.red:C.amb;}),borderRadius:5,maxBarThickness:46}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:false,font:{size:MOB()?10:12}}},y:{grid:{color:C.line},border:{display:false},ticks:{precision:0}}}}});
  var A=byApp(L);
  mk("c-zone",{type:"bubble",data:{datasets:Object.keys(S.zones).map(function(z){return {label:S.zones[z],data:A.filter(function(x){return x.a.zone===z;}).map(function(x){return {x:x.n,y:Math.round(x.h),r:Math.max(4,Math.min(16,x.arr/7)),nm:x.a.site+", "+x.a.lib,arr:x.arr};}),backgroundColor:ZC[z]+"B3",borderColor:ZC[z],borderWidth:1};})},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){var r=c.raw;return r.nm+" : "+pl(r.x,"panne")+", "+r.y+" h d'arrêt, arrivée "+r.arr+" min";}}}},
      scales:{x:{title:{display:!MOB(),text:"pannes"},grid:{color:C.line},border:{display:false},ticks:{precision:0},suggestedMin:0},y:{title:{display:!MOB(),text:"heures d'arrêt"},grid:{color:C.line},border:{display:false},suggestedMin:0}}}});
  $("l-zone").innerHTML=Object.keys(S.zones).map(function(z){return '<span><i style="background:'+ZC[z]+';border-radius:50%"></i>'+S.zones[z]+"</span>";}).join("")+"<span>taille du point : temps d'arrivée</span>";
  A.sort(function(a,b){return (b.open-a.open)||(b.h-a.h);});
  var V=A.slice(0,PAGEA*8);
  $("t-app").innerHTML='<thead><tr><th>Appareil</th><th class="r">Pannes</th><th class="r">Arrivée moyenne</th><th class="r">Arrêt cumulé</th><th class="hm">Dernière panne</th><th>Technicien</th><th>État</th></tr></thead><tbody>'+
    V.map(function(x){var a=x.a;return '<tr data-t="'+x.t.slice().sort(function(p,q){return q.td-p.td;})[0].id+'"><td class="w"><div class="who"><span class="av cl">'+ic("layers")+'</span><div><p class="nm">'+esc(a.site)+'</p><p class="mt2">'+x.id+", "+esc(a.lib)+", "+esc(a.marque)+" "+a.annee+'</p></div></div></td><td class="r num" data-l="Pannes">'+x.n+'</td><td class="r" data-l="Arrivée moyenne">'+mn(x.arr)+'</td><td class="r num" data-l="Arrêt cumulé">'+dur(x.h)+'</td><td class="hm" data-l="Dernière panne">'+dd(x.last)+'</td><td data-l="Technicien">'+av(a.tech)+'</td><td data-l="État">'+(x.open?'<span class="pill r"><span class="dot"></span>À l\'arrêt</span>':x.n>=3?'<span class="pill a">À surveiller</span>':'<span class="pill g">'+ic("check")+"En service</span>")+"</td></tr>";}).join("")+"</tbody>";
  $("more-a").hidden=A.length<=V.length;$("more-a").textContent="Afficher plus ("+(A.length-V.length)+" restants)";
}
$("more-a").addEventListener("click",function(){PAGEA++;rDelais();});

/* ---------- Pannes répétées ---------- */
function rRep(){
  var L=TK(),REP=S.rep.filter(function(r){var a=S.app[r.app];return (!F.zone||a.zone===F.zone)&&(!F.tech||a.tech===F.tech)&&(!F.type||a.type===F.type)&&(NOW-dt(r.alerte))/864e5<=F.per;});
  $("lede-r").innerHTML=(anyF()?"<b>"+esc(fdesc())+"</b> : ":"")+(REP.length?'<span class="r">'+pl(REP.length,"alerte")+"</span> "+perTxt()+", sur "+pl(new Set(REP.map(function(r){return r.app;})).size,"appareil")+". ":"Aucune alerte "+perTxt()+". ")+"Une panne qui revient coûte plus cher que la visite qui l'aurait évitée.";
  $("alerts").innerHTML=REP.length?'<div class="alg">'+REP.map(function(r){var a=S.app[r.app],tt=r.ids.map(function(i){return S.t.filter(function(t){return t.id===i;})[0];});
    var j=Math.round((dt(r.alerte)-dt(r.debut))/864e5);
    return '<button class="card alc" data-t="'+tt[tt.length-1].id+'"><div class="h"><span class="pill r">'+ic("refresh-cw")+r.n+" pannes en "+j+' jours</span>'+av(a.tech)+'</div><p class="t">'+esc(a.site)+'</p><p class="s">'+esc(a.lib)+", "+esc(a.marque)+" "+a.annee+", "+esc(a.commune)+'</p><div class="tl3">'+tt.map(function(t,i){return (i?"<em></em>":"")+'<i title="'+esc(t.cause)+'"></i>';}).join("")+'</div><p class="dts"><span>'+dd(r.debut)+"</span><span>"+dd(r.alerte)+'</span></p><p class="s">'+esc(Array.from(new Set(tt.map(function(t){return t.cause;}))).join(", "))+'</p><p class="f">'+(a.statut==="arret"?"Appareil à l'arrêt aujourd'hui":"Visite approfondie à proposer")+ic("arrow-right")+"</p></button>";}).join("")+"</div>":'<div class="okbox">'+ic("circle-check-big")+"Aucun appareil n'a eu 3 pannes en 30 jours sur la période.</div>";
  var A=byApp(L.filter(function(t){return !(t.st!=="resolu"&&false);})).sort(function(a,b){return b.n-a.n||b.h-a.h;}).slice(0,8),mx=A.length?A[0].n:1;
  $("hb-top").innerHTML=A.length?A.map(function(x){return '<div class="r'+(x.n>=3?" hot":"")+'"><span class="n" title="'+esc(x.a.site+", "+x.a.lib)+'">'+esc(x.a.site)+"<small>"+esc(x.a.lib)+'</small></span><span class="t"><i style="width:'+(100*x.n/mx)+'%"></i></span><span class="v">'+x.n+"</span></div>";}).join(""):'<p class="empty">Aucune panne sur la période.</p>';
  var cz={};L.forEach(function(t){if(t.st==="resolu")cz[t.cause]=(cz[t.cause]||0)+1;});
  var K=Object.keys(cz).sort(function(a,b){return cz[b]-cz[a];}).slice(0,7);
  mk("c-cause",{type:"bar",data:{labels:K,datasets:[{data:K.map(function(k){return cz[k];}),backgroundColor:K.map(function(k,i){return i<2?C.acc:C.pale;}),borderRadius:4,maxBarThickness:20}]},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:C.line},border:{display:false},ticks:{precision:0}},y:{grid:{display:false},ticks:{font:{size:MOB()?10.5:12},callback:function(v){var s=this.getLabelForValue(v);return MOB()&&s.length>22?s.slice(0,21)+"…":s;}}}}}});
}

/* ---------- Rapports et satisfaction ---------- */
function rClients(){
  var L=TK(),R=L.filter(function(t){return t.st==="resolu";}),N=R.filter(function(t){return t.note;});
  var sat=avg(N,function(t){return t.note;});
  $("lede-c").innerHTML=(anyF()?"<b>"+esc(fdesc())+"</b> : ":"")+"Après chaque intervention, le client reçoit le rapport du technicien sur WhatsApp et par e-mail, puis une question : « Comment s'est passée l'intervention ? », de 1 à 5.";
  $("kpis-c").innerHTML=kc({key:1,i:"star",l:"Satisfaction après intervention",v:N.length?f1(sat):"0",u:"sur 5",s:"<b>"+N.length+"</b> avis "+perTxt()})+
    kc({i:"file-check",l:"Rapports envoyés sous 24 h",v:R.length?Math.round(100*R.filter(function(t){return t.rap<=24;}).length/R.length):0,u:"%",s:"délai médian <b>"+med(R.map(function(t){return t.rap;}))+" h</b> après la remise en service"})+
    kc({i:"message-circle",l:"Clients qui répondent",v:R.length?Math.round(100*N.length/R.length):0,u:"%",s:"<b>"+N.filter(function(t){return t.note<=2;}).length+"</b> notes basses à rappeler"});
  mk("c-notes",{type:"bar",data:{labels:["1","2","3","4","5"].map(function(x){return x+(MOB()?"":" sur 5");}),datasets:[{data:[1,2,3,4,5].map(function(n){return N.filter(function(t){return t.note===n;}).length;}),backgroundColor:[C.red,C.red,C.amb,C.sky,C.acc],borderRadius:5,maxBarThickness:46}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:C.line},border:{display:false},ticks:{precision:0}}}}});
  var SG=["Syndic","Bureaux","Hôtel","Clinique","Commerce","Industrie"].filter(function(s){return N.some(function(t){return t.seg===s;});});
  mk("c-seg",{type:"radar",data:{labels:SG.map(function(s){return s==="Syndic"?"Syndics":s==="Industrie"?"Industrie":s+"s";}),datasets:[{data:SG.map(function(s){var x=N.filter(function(t){return t.seg===s;});return Math.round(10*avg(x,function(t){return t.note;}))/10;}),backgroundColor:"rgba(0,74,173,.14)",borderColor:C.acc,pointBackgroundColor:C.acc,borderWidth:1.6}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{min:0,max:5,ticks:{stepSize:1,backdropColor:"transparent",font:{size:10}},grid:{color:C.line},angleLines:{color:C.line},pointLabels:{font:{size:12}}}}}});
  var t=S.t.filter(function(x){return x.id==="T-2611-118";})[0];
  $("rap").innerHTML='<div class="rp"><div class="rp-h"><img src="assets/logo-sodebat.png?v=20261125b" alt="SODEBAT"><small>Rapport d\'intervention<br>'+t.id+"</small></div><dl><dt>Immeuble</dt><dd>"+esc(t.site)+", "+esc(t.commune)+"</dd><dt>Appareil</dt><dd>"+esc(t.lib)+", "+esc(t.marque)+" ("+t.app+")</dd><dt>Signalé</dt><dd>"+longD(t.d)+", "+hm(t.d)+", par "+t.canal+"</dd><dt>Technicien sur place</dt><dd>"+hhmm(add(t.d,t.arr))+", "+esc(TECH[t.tech].nom)+"</dd><dt>Remis en service</dt><dd>"+hhmm(add(t.d,t.dur*60))+"</dd><dt>Cause</dt><dd>"+esc(t.cause)+"</dd><dt>Travaux</dt><dd>Nettoyage et réglage de la cellule, essais de fermeture à chaque niveau</dd><dt>Avis du client</dt><dd>"+stars(t.note)+'</dd></dl><p class="tx">Rapport envoyé '+t.rap+' h après la remise en service. Le même modèle part après chaque intervention, signé par le technicien.</p></div>';
  var LO=N.filter(function(t){return t.note<=2;}).sort(function(a,b){return b.td-a.td;}).slice(0,6);
  $("low").innerHTML=LO.length?LO.map(function(t){return '<button class="li" data-t="'+t.id+'">'+who(t,t.cause+", "+dd(t.d))+'<div class="rr">'+stars(t.note)+"</div></button>";}).join(""):'<p class="empty">Aucune note basse sur la période.</p>';
}

/* ---------- volet ticket ---------- */
function openDr(k,h){$("dr-k").innerHTML=k;$("dr-b").innerHTML=h;$("drawer").classList.add("on");$("scrim").classList.add("on");$("drawer").setAttribute("aria-hidden","false");}
function closeDr(){$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");}
$("dr-x").addEventListener("click",closeDr);$("scrim").addEventListener("click",closeDr);
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeDr();});
function showT(id){
  var t=S.t.filter(function(x){return x.id===id;})[0];if(!t)return;var a=S.app[t.app];
  var n=S.t.filter(function(x){return x.app===t.app;}).length;
  var tl='<li><b>Panne signalée</b> par '+t.canal+"<small>"+longD(t.d)+", "+hm(t.d)+"</small></li>"+
    "<li><b>Technicien d'astreinte prévenu</b>, "+esc(TECH[t.tech].nom)+"<small>dans la minute, avec l'adresse et l'historique de l'appareil</small></li>"+
    "<li><b>Arrivée sur site</b> en "+mn(t.arr)+"<small>"+hhmm(add(t.d,t.arr))+"</small></li>";
  if(t.bloq)tl+="<li><b>Personne libérée</b><small>"+hhmm(add(t.d,t.lib_min))+", "+t.lib_min+" min après l'appel</small></li>";
  if(t.st==="resolu"){
    tl+="<li><b>Appareil remis en service</b><small>après "+dur(t.dur)+" d'arrêt</small></li><li><b>Rapport envoyé au client</b><small>"+t.rap+" h après la remise en service</small></li>"+(t.note?"<li><b>Avis du client</b> "+stars(t.note)+"</li>":'<li class="todo">Avis du client non reçu</li>');
  }else{
    tl+="<li><b>"+esc(t.suite)+"</b><small>à l'arrêt depuis "+dur(t.dur)+"</small></li>"+'<li class="todo">Remise en service<small>date confirmée au client dès réception</small></li>';
  }
  openDr(ic("inbox")+t.id,'<div class="tags">'+pill(t)+(t.bloq?'<span class="pill r">'+ic("users")+"Personne bloquée</span>":"")+(n>=3?'<span class="pill a">'+pl(n,"panne")+" sur 12 mois</span>":"")+'</div><h3>'+esc(t.site)+'</h3><p class="why">'+esc(t.lib)+", "+esc(a.marque)+" "+a.annee+", "+esc(t.commune)+'</p><dl class="props"><dt>Cause</dt><dd>'+esc(t.cause)+'</dd><dt>Appareil</dt><dd>'+t.app+'</dd><dt>Technicien</dt><dd>'+esc(TECH[t.tech].nom)+", "+esc(S.zones[t.zone])+'</dd><dt>Canal</dt><dd>'+esc(t.canal)+'</dd></dl><p class="lbl">Déroulé</p><ul class="tlv">'+tl+'</ul><div class="acts"><button class="btn pri" id="dr-rap">'+ic("file-check")+(t.st==="resolu"?"Renvoyer le rapport au client":"Prévenir le client de l'avancement")+'</button><button class="btn" id="dr-call">'+ic("phone")+"Appeler le technicien</button></div><p class=\"dnote\">Rien ne part depuis cette page : le message est préparé, un conseiller SODEBAT le relit et l'envoie.</p>");
  $("dr-rap").addEventListener("click",function(){toast("Message préparé pour le conseiller SAV.");});
  $("dr-call").addEventListener("click",function(){toast("Appel à passer depuis le téléphone SAV.");});
}
document.addEventListener("click",function(e){var x=e.target.closest("[data-t]");if(x&&!e.target.closest(".drawer"))showT(x.getAttribute("data-t"));});
function toast(t){var x=$("toast");x.textContent=t;x.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(function(){x.classList.remove("on");},2600);}

/* ---------- navigation ---------- */
var VIEWS={tickets:["Tickets",rTickets],delais:["Délais et arrêts",rDelais],repetees:["Pannes répétées",rRep],clients:["Rapports et satisfaction",rClients]},CUR="tickets";
function go(v){if(!VIEWS[v])v="tickets";CUR=v;
  document.querySelectorAll(".view").forEach(function(s){s.classList.toggle("on",s.id==="v-"+v);});
  document.querySelectorAll("[data-v]").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-v")===v);});
  $("crumb-v").textContent=VIEWS[v][0];if(location.hash!=="#"+v)history.replaceState(null,"",location.search+"#"+v);}
function render(){VIEWS[CUR][1]();
  var o=S.t.filter(function(t){return t.st!=="resolu";}).length;$("k-t").textContent=o;$("m-t").textContent=o;
  var r=S.rep.filter(function(x){return (NOW-dt(x.alerte))/864e5<=F.per;}).length;$("k-r").textContent=r||"";$("m-r").textContent=r||"";}
document.querySelectorAll("[data-v]").forEach(function(b){b.addEventListener("click",function(){go(b.getAttribute("data-v"));render();window.scrollTo(0,0);});});
window.addEventListener("hashchange",function(){go(location.hash.slice(1));render();});
var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(render,200);});
document.querySelectorAll("i[data-i]").forEach(function(i){var c=i.getAttribute("class");i.outerHTML=ic(i.getAttribute("data-i"),c);});
var dN=NOW;$("date").textContent=JRS[dN.getDay()]+" "+dN.getDate()+" "+MOIS[dN.getMonth()]+", "+dN.getHours()+" h";
var qp=new URLSearchParams(location.search);if(qp.get("p"))F.per=+qp.get("p")||365;if(qp.get("zone")&&S.zones[qp.get("zone")])F.zone=qp.get("zone");
go(location.hash.slice(1)||"tickets");applyF();
})();
