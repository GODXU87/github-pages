
const $ = (id)=>document.getElementById(id);
const fmt = (n)=>Math.round(n).toLocaleString('zh-TW');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

const FACTIONS={
 han:{name:'漢',ruler:'劉邦',color:'#81949a',capital:'nanzheng',ai:'balanced'},
 chu:{name:'西楚',ruler:'項羽',color:'#9a6058',capital:'pengcheng',ai:'aggressive'},
 yong:{name:'雍',ruler:'章邯',color:'#9b865e',capital:'feiqiu',ai:'defensive'},
 qi:{name:'齊',ruler:'田榮',color:'#8e8667',capital:'linzi',ai:'economic'},
 zhao:{name:'趙',ruler:'趙歇',color:'#6e7f85',capital:'xiangguo',ai:'balanced'},
 wei:{name:'西魏',ruler:'魏豹',color:'#8c795f',capital:'pingyang',ai:'balanced'},
 jiu:{name:'九江',ruler:'英布',color:'#7d6d82',capital:'liuxian',ai:'aggressive'},
 yan:{name:'燕',ruler:'臧荼',color:'#6c7186',capital:'ji',ai:'defensive'}
};

const CITIES={
 chengdu:{name:'成都',region:'巴蜀',x:150,y:520,f:'han',pop:320000,farm:86,trade:69,order:88,def:62,food:68000,gold:6200,garrison:9000,cap:0,terrain:'盆地',nb:['nanzheng']},
 nanzheng:{name:'南鄭',region:'漢中',x:255,y:430,f:'han',pop:188000,farm:74,trade:50,order:83,def:70,food:52000,gold:7000,garrison:15000,cap:1,terrain:'山地',nb:['chengdu','chenchang','wuguan']},
 chenchang:{name:'陳倉',region:'關中',x:335,y:345,f:'han',pop:132000,farm:59,trade:46,order:78,def:75,food:29000,gold:3900,garrison:11000,cap:0,terrain:'山口',nb:['nanzheng','feiqiu','lixian']},
 wuguan:{name:'武關',region:'南陽',x:425,y:430,f:'han',pop:76000,farm:43,trade:33,order:74,def:86,food:21000,gold:2200,garrison:8500,cap:0,terrain:'關隘',nb:['nanzheng','lixian','wancheng']},
 feiqiu:{name:'廢丘',region:'關中',x:385,y:286,f:'yong',pop:160000,farm:66,trade:52,order:71,def:80,food:43000,gold:4800,garrison:18500,cap:1,terrain:'平原',nb:['chenchang','lixian','pingyang']},
 lixian:{name:'櫟陽',region:'關中',x:445,y:315,f:'yong',pop:151000,farm:68,trade:58,order:72,def:72,food:38000,gold:5300,garrison:14500,cap:0,terrain:'平原',nb:['chenchang','feiqiu','luoyang','wuguan']},
 pingyang:{name:'平陽',region:'河東',x:520,y:220,f:'wei',pop:174000,farm:70,trade:56,order:75,def:69,food:40000,gold:4900,garrison:15500,cap:1,terrain:'平原',nb:['feiqiu','luoyang','xiangguo']},
 luoyang:{name:'洛陽',region:'河南',x:535,y:335,f:'chu',pop:228000,farm:60,trade:88,order:64,def:83,food:39000,gold:9200,garrison:18500,cap:0,terrain:'都市',nb:['lixian','pingyang','wancheng','xingyang']},
 wancheng:{name:'宛城',region:'南陽',x:515,y:430,f:'chu',pop:201000,farm:73,trade:63,order:70,def:71,food:42000,gold:5600,garrison:16800,cap:0,terrain:'平原',nb:['wuguan','luoyang','xingyang','jiangling']},
 xingyang:{name:'滎陽',region:'河南',x:615,y:348,f:'chu',pop:181000,farm:66,trade:72,order:68,def:88,food:48000,gold:6000,garrison:20500,cap:0,terrain:'要衝',nb:['luoyang','wancheng','pengcheng','xiangguo']},
 pengcheng:{name:'彭城',region:'楚地',x:755,y:395,f:'chu',pop:356000,farm:78,trade:81,order:73,def:78,food:76000,gold:12600,garrison:33500,cap:1,terrain:'平原',nb:['xingyang','linzi','liuxian','jiangling']},
 jiangling:{name:'江陵',region:'荊楚',x:585,y:525,f:'chu',pop:214000,farm:85,trade:68,order:71,def:72,food:54000,gold:5900,garrison:17500,cap:0,terrain:'水網',nb:['wancheng','pengcheng','liuxian']},
 linzi:{name:'臨淄',region:'齊地',x:810,y:248,f:'qi',pop:304000,farm:82,trade:92,order:77,def:74,food:69000,gold:11000,garrison:27500,cap:1,terrain:'平原',nb:['pengcheng','xiangguo','ji']},
 xiangguo:{name:'襄國',region:'趙地',x:665,y:205,f:'zhao',pop:220000,farm:76,trade:57,order:68,def:76,food:48000,gold:6100,garrison:23000,cap:1,terrain:'平原',nb:['pingyang','xingyang','linzi','ji']},
 ji:{name:'薊',region:'燕地',x:755,y:110,f:'yan',pop:149000,farm:57,trade:50,order:72,def:72,food:33000,gold:4200,garrison:15000,cap:1,terrain:'丘陵',nb:['xiangguo','linzi']},
 liuxian:{name:'六縣',region:'九江',x:755,y:505,f:'jiu',pop:171000,farm:74,trade:53,order:69,def:64,food:44000,gold:4500,garrison:19500,cap:1,terrain:'水網',nb:['pengcheng','jiangling']}
};

const OFFICERS=[
 {id:'liubang',name:'劉邦',f:'han',city:'nanzheng',role:'君主',cmd:79,war:66,int:88,pol:92,cha:99,trait:'知人善任'},
 {id:'xiaoh',name:'蕭何',f:'han',city:'nanzheng',role:'丞相',cmd:55,war:31,int:93,pol:100,cha:87,trait:'鎮國後勤'},
 {id:'zhangliang',name:'張良',f:'han',city:'nanzheng',role:'軍師',cmd:65,war:40,int:100,pol:95,cha:90,trait:'運籌帷幄'},
 {id:'hanxin',name:'韓信',f:'han',city:'nanzheng',role:'大將軍',cmd:100,war:80,int:97,pol:66,cha:83,trait:'國士無雙'},
 {id:'fankuai',name:'樊噲',f:'han',city:'chenchang',role:'將軍',cmd:84,war:95,int:50,pol:42,cha:72,trait:'猛將'},
 {id:'zhoubo',name:'周勃',f:'han',city:'wuguan',role:'將軍',cmd:90,war:88,int:68,pol:63,cha:76,trait:'堅陣'},
 {id:'cao',name:'曹參',f:'han',city:'nanzheng',role:'將軍',cmd:92,war:86,int:83,pol:82,cha:79,trait:'善戰'},
 {id:'guanying',name:'灌嬰',f:'han',city:'chenchang',role:'騎將',cmd:88,war:87,int:72,pol:58,cha:73,trait:'騎戰'},
 {id:'xiangyu',name:'項羽',f:'chu',city:'pengcheng',role:'霸王',cmd:99,war:100,int:72,pol:42,cha:95,trait:'霸王破陣'},
 {id:'fanzeng',name:'范增',f:'chu',city:'pengcheng',role:'亞父',cmd:62,war:39,int:99,pol:86,cha:81,trait:'洞察'},
 {id:'longju',name:'龍且',f:'chu',city:'xingyang',role:'大將',cmd:91,war:94,int:62,pol:47,cha:71,trait:'猛攻'},
 {id:'zhongli',name:'鍾離眛',f:'chu',city:'luoyang',role:'將軍',cmd:89,war:90,int:79,pol:58,cha:76,trait:'善守'},
 {id:'zhanghan',name:'章邯',f:'yong',city:'feiqiu',role:'雍王',cmd:94,war:89,int:86,pol:72,cha:81,trait:'秦將'},
 {id:'yingbu',name:'英布',f:'jiu',city:'liuxian',role:'九江王',cmd:94,war:97,int:73,pol:55,cha:84,trait:'猛攻'},
 {id:'tianrong',name:'田榮',f:'qi',city:'linzi',role:'齊王',cmd:81,war:79,int:77,pol:79,cha:82,trait:'齊地人望'},
 {id:'weibao',name:'魏豹',f:'wei',city:'pingyang',role:'魏王',cmd:75,war:73,int:66,pol:68,cha:74,trait:'守成'},
 {id:'zhaoxie',name:'趙歇',f:'zhao',city:'xiangguo',role:'趙王',cmd:65,war:61,int:63,pol:70,cha:76,trait:'趙室'},
 {id:'zangtu',name:'臧荼',f:'yan',city:'ji',role:'燕王',cmd:78,war:80,int:67,pol:64,cha:72,trait:'北境'}
];

const REL={han:{chu:-100,yong:-80,qi:-10,zhao:10,wei:5,jiu:15,yan:0},chu:{han:-100,yong:55,qi:-55,zhao:20,wei:10,jiu:35,yan:15}};
const COLORS={han:'#81949a',chu:'#9a6058',yong:'#9b865e',qi:'#8e8667',zhao:'#6e7f85',wei:'#8c795f',jiu:'#7d6d82',yan:'#6c7186'};
const PERIODS=['上旬','中旬','下旬'];

let state={
 player:'han',turn:1,month:1,period:0,ap:3,selected:null,active:'city',
 armies:[
  {id:'h-main',f:'han',cmd:'liubang',city:'nanzheng',target:null,progress:0,inf:8500,xbow:2500,cav:1800,morale:84,supply:38,status:'駐紮'},
  {id:'c-main',f:'chu',cmd:'xiangyu',city:'pengcheng',target:null,progress:0,inf:15000,xbow:4000,cav:6000,morale:96,supply:45,status:'駐紮'}
 ],
 log:['漢王入漢中，天下諸侯並立。'],
 events:[],tutorialDone:false
};

function cloneBase(){
 return JSON.parse(JSON.stringify({cities:CITIES,officers:OFFICERS,relations:REL}));
}
let world=cloneBase();

function factionCities(f){return Object.entries(world.cities).filter(([_,c])=>c.f===f)}
function factionOfficers(f){return world.officers.filter(o=>o.f===f)}
function armiesOf(f){return state.armies.filter(a=>a.f===f)}
function officer(id){return world.officers.find(o=>o.id===id)}
function city(id){return world.cities[id]}
function armyTroops(a){return Math.max(0,a.inf+a.xbow+a.cav)}
function factionTotals(f){
 const cs=factionCities(f),as=armiesOf(f);
 return{
  cities:cs.length,
  gold:cs.reduce((s,[_,c])=>s+c.gold,0),
  food:cs.reduce((s,[_,c])=>s+c.food,0),
  troops:cs.reduce((s,[_,c])=>s+c.garrison,0)+as.reduce((s,a)=>s+armyTroops(a),0),
  pop:cs.reduce((s,[_,c])=>s+c.pop,0)
 };
}
function factionPower(f){
 const z=factionTotals(f);
 return z.cities*26000+z.troops+z.gold*2+z.food*.18;
}
function save(){
 localStorage.setItem('noirxu_chuhan_v02',JSON.stringify({state,world}));
 toast('進度已儲存');
}
function load(){
 const raw=localStorage.getItem('noirxu_chuhan_v02');
 if(!raw)return false;
 try{const d=JSON.parse(raw);state=d.state;world=d.world;render();toast('已讀取本機存檔');return true}catch(e){return false}
}
function newGame(f='han'){
 world=cloneBase();
 state={
  player:f,turn:1,month:1,period:0,ap:3,
  selected:null,active:'city',
  armies:[],
  log:['公元前206年，諸侯裂土，天下未定。'],
  events:[],tutorialDone:true
 };
 Object.keys(FACTIONS).forEach(k=>{
  const cap=FACTIONS[k].capital;
  if(city(cap)){
   const top=factionOfficers(k).sort((a,b)=>b.cmd-a.cmd)[0];
   state.armies.push({id:k+'-main',f:k,cmd:top?top.id:null,city:cap,target:null,progress:0,inf:Math.round(city(cap).garrison*.5),xbow:Math.round(city(cap).garrison*.16),cav:Math.round(city(cap).garrison*.12),morale:k==='chu'?95:82,supply:36,status:'駐紮'});
   city(cap).garrison=Math.max(3500,city(cap).garrison-Math.round(city(cap).garrison*.78));
  }
 });
 closeStart();
 render();
 toast('劇本開始：鴻門之後');
}

function render(){
 renderTop();
 renderSidebar();
 renderMap();
 renderInspector();
 renderIntel();
 renderAdvisor();
 renderBottom();
}
function renderTop(){
 const f=FACTIONS[state.player];
 $('topFaction').textContent=f.name+' · '+f.ruler;
 $('era').textContent='漢元年 · '+state.month+'月'+PERIODS[state.period];
 $('turn').textContent='公元前 206 年｜第 '+state.turn+' 旬';
 const quote={
  han:'大丈夫當以天下為心。',
  chu:'力能扛鼎，天下莫敢當。',
  qi:'齊地富庶，足以圖天下。',
  jiu:'亂世唯強者能自立。'
 }[state.player]||'天下未定，皆有可為。';
 if($('topRulerQuote'))$('topRulerQuote').textContent=quote;
}
function renderSidebar(){
 const f=FACTIONS[state.player],z=factionTotals(state.player);
 $('crest').textContent=f.name.slice(0,1);$('crest').className='crest '+(state.player==='chu'?'chu':'han');
 $('ruler').textContent=f.name+' · '+f.ruler;
 $('capital').textContent='都城：'+city(f.capital).name+'｜勢力：'+f.name;
 $('gold').textContent=fmt(z.gold);$('food').textContent=fmt(z.food);$('troops').textContent=fmt(z.troops);$('cities').textContent=z.cities;
 const all=Object.keys(FACTIONS).reduce((s,k)=>s+factionPower(k),0),hp=Math.round(factionPower('han')/all*100),cp=Math.round(factionPower('chu')/all*100);
 $('hp').textContent=hp+'%';$('cp').textContent=cp+'%';$('hbar').style.width=hp+'%';$('cbar').style.width=cp+'%';
 document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===state.active));
 const owned=Object.values(world.cities).filter(c=>c.f===state.player);
 $('obj1').classList.toggle('done',owned.some(c=>['廢丘','櫟陽'].includes(c.name)));
 $('obj2').classList.toggle('done',owned.some(c=>c.name==='洛陽'));
 $('obj3').classList.toggle('done',owned.some(c=>c.name==='彭城'));
}

function renderIntel(){
 const table=$('intelTable'),title=$('intelTitle'),eventBox=$('eventList'),eventTitle=$('eventTitle');
 if(!table||!eventBox)return;
 const mode=state.intelTab||'power';
 document.querySelectorAll('[data-intel]').forEach(b=>b.classList.toggle('active',b.dataset.intel===mode));

 if(mode==='power'){
  title.textContent='天下勢力';
  table.innerHTML='<thead><tr><th>勢力</th><th>城</th><th>兵力</th><th>國力</th></tr></thead><tbody id="rankings"></tbody>';
  const rows=Object.keys(FACTIONS).map(f=>{const z=factionTotals(f);return{f,p:factionPower(f),...z}}).sort((a,b)=>b.p-a.p).slice(0,6);
  table.querySelector('tbody').innerHTML=rows.map(r=>'<tr class="'+(r.f===state.player?'player':'')+'"><td><span style="color:'+FACTIONS[r.f].color+'">■</span> '+FACTIONS[r.f].name+'</td><td>'+r.cities+'</td><td>'+Math.round(r.troops/1000)+'k</td><td>'+Math.round(r.p/1000)+'</td></tr>').join('');
  eventTitle.innerHTML='天下紀事 <span>EVENTS</span>';
  eventBox.innerHTML=state.log.slice(0,6).map((x,i)=>'<div class="event-item"><span>'+(i<3?'今旬':'前旬')+'</span><b>'+x+'</b></div>').join('');
 } else if(mode==='officer'){
  title.textContent='天下名將';
  table.innerHTML='<thead><tr><th>人物</th><th>勢力</th><th>統</th><th>智</th></tr></thead><tbody></tbody>';
  const os=[...world.officers].sort((a,b)=>(b.cmd+b.int)-(a.cmd+a.int)).slice(0,7);
  table.querySelector('tbody').innerHTML=os.map(o=>'<tr><td>'+o.name+'</td><td>'+FACTIONS[o.f].name+'</td><td>'+o.cmd+'</td><td>'+o.int+'</td></tr>').join('');
  eventTitle.innerHTML='人才情報 <span>OFFICERS</span>';
  eventBox.innerHTML=os.slice(0,5).map(o=>'<div class="event-item"><span>'+o.role+'</span><b>'+o.name+' · '+o.trait+'</b></div>').join('');
 } else if(mode==='diplo'){
  title.textContent='列國外交';
  table.innerHTML='<thead><tr><th>勢力</th><th>君主</th><th>關係</th><th>態度</th></tr></thead><tbody></tbody>';
  const rel=REL[state.player]||{};
  table.querySelector('tbody').innerHTML=Object.keys(FACTIONS).filter(f=>f!==state.player).map(f=>{
    const v=rel[f]??0,label=v<=-70?'敵對':v<0?'警戒':v>=35?'友好':'中立';
    return '<tr><td>'+FACTIONS[f].name+'</td><td>'+FACTIONS[f].ruler+'</td><td>'+(v>0?'+':'')+v+'</td><td>'+label+'</td></tr>';
  }).join('');
  eventTitle.innerHTML='外交判讀 <span>DIPLOMACY</span>';
  eventBox.innerHTML='<div class="event-item"><span>楚</span><b>西楚為主要敵對勢力，關係已無緩和餘地。</b></div><div class="event-item"><span>九江</span><b>九江仍有拉攏空間，可觀察英布動向。</b></div><div class="event-item"><span>齊</span><b>齊楚關係不穩，可能成為牽制西楚的力量。</b></div>';
 } else {
  title.textContent='軍情摘要';
  table.innerHTML='<thead><tr><th>項目</th><th>數值</th><th>狀態</th><th>判讀</th></tr></thead><tbody></tbody>';
  const me=factionTotals(state.player);
  table.querySelector('tbody').innerHTML='<tr><td>城池</td><td>'+me.cities+'</td><td>領地</td><td>'+(me.cities>=5?'擴張':'發展')+'</td></tr><tr><td>總兵</td><td>'+Math.round(me.troops/1000)+'k</td><td>軍力</td><td>'+(me.troops>70000?'充足':'需整備')+'</td></tr><tr><td>糧草</td><td>'+Math.round(me.food/1000)+'k</td><td>後勤</td><td>'+(me.food>120000?'穩定':'注意')+'</td></tr>';
  eventTitle.innerHTML='近期軍情 <span>INTELLIGENCE</span>';
  eventBox.innerHTML=state.log.slice(0,6).map((x,i)=>'<div class="event-item"><span>#'+(i+1)+'</span><b>'+x+'</b></div>').join('');
 }
}
function renderAdvisor(){
 if(!$('advisorText'))return;
 let name='張良',role='軍師',text='主公，天下形勢瞬息萬變，當先穩後方，再圖東進。';
 if(state.active==='city'){
  if(!state.selected||!city(state.selected)){
    text='主公，先從天下圖選一座城。自己的城可直接治理與出征，敵城則可查看進攻路線。';
    $('advisorName').innerHTML=name+' <small>'+role+'</small>';
    $('advisorText').textContent=text;
    return;
  }
  const c=city(state.selected);
  if(c.f===state.player){
   if(c.food<18000)text=c.name+'糧草偏低，不宜再抽兵遠征，宜先開墾或運糧。';
   else if(c.garrison<8000)text=c.name+'守備空虛，若敵軍趁勢來攻，恐難久守。';
   else if(c.name==='南鄭'||c.name==='陳倉')text='主公，欲定三秦，當先由陳倉打開關中門戶，再乘勢東進。';
   else text=c.name+'目前民力尚可，可依前線需要在內政與軍備之間取捨。';
  }else{
   text=c.name+'隸屬'+FACTIONS[c.f].name+'，守軍約'+fmt(c.garrison)+'。若要進攻，先確認相鄰據點兵力與補給。';
  }
 }else if(state.active==='army'){
  const a=armiesOf(state.player).find(x=>x.id===state.selected)||armiesOf(state.player)[0];
  if(a){
   const o=officer(a.cmd);
   text=(o?o.name:'我軍')+'部目前'+(a.target?'正在前往'+city(a.target).name:'駐於'+city(a.city).name)+'，士氣 '+a.morale+'，軍糧約 '+a.supply+' 日。';
  }
 }else if(state.active==='officer'){
  text='蕭何可安後方，韓信可統大軍，張良可觀天下。用人之道，勝於一城一地之得失。';
 }else if(state.active==='diplo'){
  text='齊、趙、九江皆可能左右楚漢消長。外交若用得其所，可少打一場仗。';
 }else if(state.active==='log'){
  text='從天下紀事觀察誰在擴軍、誰在失城，往往比只看眼前兵力更重要。';
 }
 $('advisorName').innerHTML=name+' <small>'+role+'</small>';
 $('advisorText').textContent=text;
}

function renderBottom(){
 $('ap').innerHTML=[0,1,2].map(i=>'<i class="pip '+(i<state.ap?'on':'')+'"></i>').join('')+'<b style="font-size:10px;margin-left:6px">'+state.ap+' / 3</b>';
 $('ticker').textContent=state.log[0]||'天下無事';
}

function cityKind(id,c){
 if(c.cap)return 'capital';
 if(c.terrain==='關隘'||c.terrain==='山口')return 'pass';
 if(c.terrain==='要衝'||c.pop>=200000||c.garrison>=20000||c.trade>=82)return 'major';
 return 'city';
}

function cityRadius(id,c){
 const kind=cityKind(id,c);
 return kind==='capital'?40:kind==='major'?33:kind==='pass'?29:24;
}

function cityCastleSvg(id,c){
 const kind=cityKind(id,c);
 const col=FACTIONS[c.f]?.color||'#9a907c';
 const isSelected=state.selected===id;
 const flag='<g class="city-flag"><line x1="12" y1="-23" x2="12" y2="-5"/><path d="M12 -23 L25 -19 L12 -15 Z"/></g>';
 let body='';
 if(kind==='capital'){
  body=
   '<g class="castle capital-castle">'+
    '<path class="city-wall" d="M-27 7 L27 7 L27 21 L-27 21 Z"/>'+
    '<path class="city-merlon" d="M-27 7 L-22 7 L-22 2 L-16 2 L-16 7 L-9 7 L-9 2 L-3 2 L-3 7 L4 7 L4 2 L10 2 L10 7 L17 7 L17 2 L23 2 L23 7 L27 7"/>'+
    '<rect class="city-tower" x="-24" y="-8" width="12" height="15"/><path class="city-roof" d="M-27 -8 L-18 -17 L-9 -8 Z"/>'+
    '<rect class="city-tower" x="-7" y="-15" width="14" height="22"/><path class="city-roof" d="M-11 -15 L0 -26 L11 -15 Z"/>'+
    '<rect class="city-tower" x="12" y="-8" width="12" height="15"/><path class="city-roof" d="M9 -8 L18 -17 L27 -8 Z"/>'+
    '<path class="city-gate" d="M-5 21 L-5 12 Q0 6 5 12 L5 21 Z"/>'+
   '</g>'+flag;
 }else if(kind==='major'){
  body=
   '<g class="castle major-castle">'+
    '<path class="city-wall" d="M-23 6 L23 6 L23 20 L-23 20 Z"/>'+
    '<path class="city-merlon" d="M-23 6 L-17 6 L-17 2 L-11 2 L-11 6 L-4 6 L-4 2 L2 2 L2 6 L9 6 L9 2 L15 2 L15 6 L23 6"/>'+
    '<rect class="city-tower" x="-20" y="-8" width="13" height="14"/><path class="city-roof" d="M-23 -8 L-13.5 -17 L-4 -8 Z"/>'+
    '<rect class="city-tower" x="7" y="-8" width="13" height="14"/><path class="city-roof" d="M4 -8 L13.5 -17 L23 -8 Z"/>'+
    '<path class="city-gate" d="M-5 20 L-5 11 Q0 5 5 11 L5 20 Z"/>'+
   '</g>'+flag;
 }else if(kind==='pass'){
  body=
   '<g class="castle pass-castle">'+
    '<path class="pass-wing" d="M-29 16 L-17 4 L-11 16 Z M11 16 L17 4 L29 16 Z"/>'+
    '<rect class="city-wall" x="-16" y="-2" width="32" height="21"/>'+
    '<path class="city-merlon" d="M-16 -2 L-10 -2 L-10 -7 L-4 -7 L-4 -2 L3 -2 L3 -7 L9 -7 L9 -2 L16 -2"/>'+
    '<path class="city-roof" d="M-19 -2 L0 -17 L19 -2 Z"/>'+
    '<path class="city-gate" d="M-5 19 L-5 9 Q0 3 5 9 L5 19 Z"/>'+
   '</g>'+flag;
 }else{
  body=
   '<g class="castle town-castle">'+
    '<rect class="city-wall" x="-19" y="4" width="38" height="16"/>'+
    '<path class="city-merlon" d="M-19 4 L-13 4 L-13 0 L-7 0 L-7 4 L0 4 L0 0 L6 0 L6 4 L13 4 L13 0 L19 0"/>'+
    '<rect class="city-tower" x="-7" y="-9" width="14" height="13"/>'+
    '<path class="city-roof" d="M-11 -9 L0 -18 L11 -9 Z"/>'+
    '<path class="city-gate" d="M-4 20 L-4 12 Q0 7 4 12 L4 20 Z"/>'+
   '</g>';
 }

 const threatened=state.armies.some(a=>a.target===id&&a.f!==c.f);
 const owned=c.f===state.player;

 const factionChar=FACTIONS[c.f].name==='西楚'?'楚':FACTIONS[c.f].name.slice(0,1);
 const outer=(kind==='capital'||kind==='major')
   ?'<path class="outer-bailey" d="M-34 19 L-34 8 L-28 2 M34 19 L34 8 L28 2 M-34 19 L34 19"/>'
   :'';
 const defense='<g class="defense-pips">'+[0,1,2,3].map((_,i)=>'<circle cx="'+(-9+i*6)+'" cy="24" r="1.4" class="'+(c.def>=45+i*12?'on':'')+'"/>').join('')+'</g>';
 const threat=threatened?'<g class="siege-alert"><circle r="'+(cityRadius(id,c)+8)+'"/><path d="M-8 -8 L8 8 M8 -8 L-8 8"/></g>':'';
 const moat=(kind==='capital'||kind==='major')
   ?'<ellipse class="city-moat" cx="0" cy="17" rx="'+(kind==='capital'?43:36)+'" ry="'+(kind==='capital'?17:14)+'"/>'
   :'';
 const settlement=(kind==='capital'||kind==='major')
   ?'<g class="city-settlement">'+
      '<path d="M-38 13 l5 -7 l5 7 z"/><rect x="-35" y="13" width="5" height="5"/>'+
      '<path d="M31 11 l5 -7 l5 7 z"/><rect x="33" y="11" width="5" height="5"/>'+
      '<path d="M-32 25 l4 -6 l4 6 z"/><rect x="-30" y="25" width="4" height="4"/>'+
     '</g>'
   :'';
 const statusBadge='<g class="city-status-badge '+(owned?'owned':'foreign')+'">'+
   '<circle cx="-26" cy="-22" r="7"/>'+
   '<text x="-26" y="-19">'+(owned?'我':'敵')+'</text>'+
  '</g>';
 return '<g class="city-node '+kind+(isSelected?' selected-node':'')+(threatened?' threatened':'')+'" style="--faction:'+col+'">'+
   '<circle class="city-hit" r="'+cityRadius(id,c)+'"/>'+
   moat+
   '<ellipse class="city-ground" cx="0" cy="18" rx="'+(kind==='capital'?45:kind==='major'?37:29)+'" ry="'+(kind==='capital'?11:9)+'"/>'+
   settlement+
   '<circle class="city-selection-ring" r="'+(cityRadius(id,c)+4)+'"/>'+
   statusBadge+
   threat+outer+body+
   '<text class="flag-char" x="18" y="-18">'+factionChar+'</text>'+
   defense+
   '<g class="city-plaque"><rect x="-31" y="29" width="62" height="18" rx="3"/><text class="city-name" y="42">'+c.name+'</text></g>'+
   '<text class="city-meta" y="58">'+FACTIONS[c.f].name+' · '+Math.round(c.garrison/1000)+'k</text>'+
   '<text class="city-kind" y="-34">'+(kind==='capital'?'都城':kind==='major'?'重鎮':kind==='pass'?'關隘':'城池')+'</text>'+
  '</g>';
}

function roadSvg(id,c,n,d){
 const dx=d.x-c.x,dy=d.y-c.y,dist=Math.max(1,Math.hypot(dx,dy));
 const r1=cityRadius(id,c)+8,r2=cityRadius(n,d)+8;
 const x1=c.x+dx/dist*r1,y1=c.y+dy/dist*r1;
 const x2=d.x-dx/dist*r2,y2=d.y-dy/dist*r2;
 const important=(c.cap||d.cap||c.terrain==='關隘'||d.terrain==='關隘'||c.terrain==='要衝'||d.terrain==='要衝');
 return '<line class="road '+(important?'main-road':'')+'" x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'"/>';
}

function renderMap(){
 const cs=world.cities,seen={};
 $('roads').innerHTML=Object.entries(cs).flatMap(([id,c])=>c.nb.map(n=>{
  const k=[id,n].sort().join('-');if(seen[k])return'';seen[k]=1;
  return roadSvg(id,c,n,cs[n]);
 })).join('');

 $('marchLayer').innerHTML=state.armies.filter(a=>a.target).map(a=>{
  const from=city(a.city),to=city(a.target);
  const dx=to.x-from.x,dy=to.y-from.y,dist=Math.max(1,Math.hypot(dx,dy));
  const s=cityRadius(a.city,from)+15,e=cityRadius(a.target,to)+15;
  const x1=from.x+dx/dist*s,y1=from.y+dy/dist*s;
  const x2=to.x-dx/dist*e,y2=to.y-dy/dist*e;
  const col=FACTIONS[a.f]?.color||'#c9ad70';
  return '<g class="march-route" style="--march:'+col+'">'+
    '<line class="march-shadow" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"/>'+
    '<line class="march-line" marker-end="url(#marchArrow)" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"/>'+
    '<text class="march-label" x="'+((x1+x2)/2)+'" y="'+(((y1+y2)/2)-8)+'">'+Math.max(0,2-a.progress)+'旬</text>'+
    '<circle class="march-target" cx="'+x2+'" cy="'+y2+'" r="6"/>'+
   '</g>';
 }).join('');

 $('citiesLayer').innerHTML=Object.entries(cs).map(([id,c])=>
  '<g class="city '+c.f+(state.selected===id?' selected':'')+'" data-city="'+id+'" transform="translate('+c.x+','+c.y+')">'+
   '<title>'+c.name+'｜'+FACTIONS[c.f].name+'｜守軍 '+fmt(c.garrison)+'｜'+c.terrain+'</title>'+
   cityCastleSvg(id,c)+
  '</g>'
 ).join('');

 $('armiesLayer').innerHTML=state.armies.map(a=>{
  const from=city(a.city),to=a.target?city(a.target):from,p=a.target?Math.min(.82,.12+a.progress*.35):0;
  const x=from.x+(to.x-from.x)*p,y=from.y+(to.y-from.y)*p,o=officer(a.cmd),moving=!!a.target;
  const col=FACTIONS[a.f]?.color||'#c9ad70';
  return '<g class="army '+a.f+(moving?' moving':' stationed')+'" data-army="'+a.id+'" transform="translate('+x+','+y+')">'+
    '<line class="army-pole" x1="-13" y1="-25" x2="-13" y2="13"/>'+
    '<path class="army-banner" style="--army-color:'+col+'" d="M-13 -24 L16 -18 L16 4 L-13 -2 Z"/>'+
    '<text class="army-name" x="1" y="-7">'+(o?o.name.slice(0,2):'軍')+'</text>'+
    '<rect class="army-count-bg" x="-18" y="9" width="38" height="14" rx="3"/>'+
    '<text class="army-count" x="1" y="19">'+Math.round(armyTroops(a)/1000)+'k</text>'+
    '<circle class="army-status" cx="19" cy="-20" r="4"/>'+
   '</g>';
 }).join('');

 document.querySelectorAll('[data-city]').forEach(el=>el.onclick=()=>{state.selected=el.dataset.city;state.active='city';render()});
 document.querySelectorAll('[data-army]').forEach(el=>el.onclick=(e)=>{e.stopPropagation();state.active='army';state.selected=el.dataset.army;render()});
}

function renderInspector(){
 const box=$('inspector');
 if(state.active==='city'){
   if(!state.selected || !world.cities[state.selected]) return renderWelcome(box);
   return renderCity(box);
 }
 if(state.active==='officer')return renderOfficers(box);
 if(state.active==='army')return renderArmies(box);
 if(state.active==='diplo')return renderDiplo(box);
 return renderLog(box);
}

function renderWelcome(box){
 const cap=FACTIONS[state.player].capital;
 const frontier=factionCities(state.player)
   .map(([id,c])=>({id,c,enemy:c.nb.some(n=>city(n).f!==state.player)}))
   .filter(x=>x.enemy)
   .sort((a,b)=>b.c.garrison-a.c.garrison)
   .slice(0,2);
 box.innerHTML=
   '<div class="context-empty">'+
    '<div class="eyebrow">STRATEGIC COMMAND</div>'+
    '<h2>先選一座城</h2>'+
    '<p>直接點地圖上的城池即可查看情報與下令。自己的城能內政、徵兵與出征；敵城會直接顯示可用的進攻路線。</p>'+
    '<div class="guide-actions">'+
      '<button data-guide-city="'+cap+'"><b>'+city(cap).name+'</b><span>都城 · 查看政務</span></button>'+
      frontier.map(x=>'<button data-guide-city="'+x.id+'"><b>'+x.c.name+'</b><span>前線 · 守軍 '+fmt(x.c.garrison)+'</span></button>').join('')+
    '</div>'+
   '</div>';
 box.querySelectorAll('[data-guide-city]').forEach(b=>b.onclick=()=>{
   state.selected=b.dataset.guideCity;state.active='city';render();
 });
}

function renderCity(box){
 const c=city(state.selected);
 if(!c)return renderWelcome(box);
 const owned=c.f===state.player;
 const os=world.officers.filter(o=>o.city===state.selected);
 const governor=os.sort((a,b)=>b.pol-a.pol)[0];

 const header=
  '<div class="city-hero">'+
   '<div class="side-title">'+c.region+' · '+c.terrain+'</div>'+
   '<h2>'+c.name+'</h2>'+
   '<div class="city-kicker">'+
    '<span>'+FACTIONS[c.f].name+'</span>'+
    '<span>'+(c.cap?'都城':'城池')+'</span>'+
    '<span>守軍 '+fmt(c.garrison)+'</span>'+
   '</div>'+
  '</div>';

 const stats=
  '<div class="stat-grid">'+
   '<div class="stat"><span>人口</span><b>'+fmt(c.pop)+'</b><small>兵役基礎</small></div>'+
   '<div class="stat"><span>糧草</span><b>'+fmt(c.food)+'</b><small>後勤儲備</small></div>'+
   '<div class="stat"><span>金錢</span><b>'+fmt(c.gold)+'</b><small>府庫</small></div>'+
   '<div class="stat"><span>治安</span><b>'+c.order+'</b><small>'+ (c.order>=70?'穩定':'需注意') +'</small></div>'+
  '</div>';

 if(owned){
   box.innerHTML=header+stats+
    '<div class="section-title">城勢</div>'+
    '<div class="barline"><span>農業</span><div class="track"><i style="width:'+c.farm+'%"></i></div><b>'+c.farm+'</b></div>'+
    '<div class="barline"><span>商業</span><div class="track"><i style="width:'+c.trade+'%"></i></div><b>'+c.trade+'</b></div>'+
    '<div class="barline"><span>城防</span><div class="track"><i style="width:'+c.def+'%"></i></div><b>'+c.def+'</b></div>'+
    '<div class="section-title">主官與人才</div>'+
    '<div class="officer"><div><b>'+(governor?governor.name:'尚未任命')+'</b><small>'+(governor?governor.role+' · '+governor.trait:'此城目前沒有駐城人物')+'</small></div>'+(governor?'<div class="nums">政 '+governor.pol+'<br>智 '+governor.int+'</div>':'')+'</div>'+
    '<div class="city-command-grid">'+
      '<button id="developBtn"><b>內政</b><small>農業、商業、治安、城防</small></button>'+
      '<button id="recruit"><b>徵兵</b><small>補充 3,000 步卒</small></button>'+
      '<button id="appointBtn"><b>人才</b><small>查看與任用駐城人物</small></button>'+
      '<button class="primary-command" id="dispatch"><b>出征</b><small>編成軍團，選擇相鄰目標</small></button>'+
    '</div>';
   $('developBtn').onclick=()=>openDevelopMenu(c);
   $('recruit').onclick=recruit;
   $('appointBtn').onclick=()=>{state.active='officer';render();};
   $('dispatch').onclick=()=>dispatchModal();
 }else{
   const sources=c.nb
    .filter(id=>city(id).f===state.player)
    .sort((a,b)=>city(b).garrison-city(a).garrison);
   const source=sources[0];
   box.innerHTML=header+stats+
    '<div class="section-title">敵情</div>'+
    '<div class="officer"><div><b>'+(governor?governor.name:FACTIONS[c.f].ruler)+'</b><small>'+(governor?governor.role:'勢力君主')+'</small></div>'+(governor?'<div class="nums">統 '+governor.cmd+'<br>智 '+governor.int+'</div>':'')+'</div>'+
    '<div class="enemy-command">'+
      '<div class="muted">'+(source?'已找到可直接進攻的相鄰據點。':'我方目前沒有與此城相鄰的據點。')+'</div>'+
      (source?'<div class="route-line">'+city(source).name+' → '+c.name+'　｜　我方守軍 '+fmt(city(source).garrison)+'</div>'+
      '<button id="attackEnemy">從 '+city(source).name+' 出兵</button>':
      '<div class="route-line">先奪取相鄰城池，打通進軍路線。</div>')+
    '</div>';
   if($('attackEnemy'))$('attackEnemy').onclick=()=>{
      const target=state.selected;
      state.selected=source;
      render();
      dispatchModal(target);
   };
 }
}

function openDevelopMenu(c){
 modal(
  '<h3>'+c.name+' · 內政</h3>'+
  '<p>每項命令消耗 1 點本旬軍令。選一項執行後立即回到城池畫面。</p>'+
  '<div class="city-command-grid">'+
   '<button id="devFarm"><b>開墾農田</b><small>農業 +3｜糧草 +5,000</small></button>'+
   '<button id="devTrade"><b>振興商業</b><small>商業 +3｜金 +1,500</small></button>'+
   '<button id="devOrder"><b>安撫百姓</b><small>治安 +5</small></button>'+
   '<button id="devFort"><b>修築城防</b><small>城防 +3｜金 -800</small></button>'+
  '</div>'+
  '<div class="modal-row"><button class="btn" onclick="closeModal()">取消</button></div>'
 );
 [['devFarm','farm'],['devTrade','trade'],['devOrder','order'],['devFort','fort']].forEach(([id,type])=>{
   $(id).onclick=()=>{closeModal();develop(type);};
 });
}

function renderOfficers(box){
 const list=factionOfficers(state.player).sort((a,b)=>b.cmd-a.cmd);
 box.innerHTML='<div class="side-title">OFFICER CORPS</div><h2>'+FACTIONS[state.player].name+' · 人才</h2><p class="muted">以人物特性配置內政與軍事。高統率適合領軍，高政治適合經營後方。</p>'+
 '<div class="officer-grid">'+list.map(o=>
   '<div class="officer-card"><div class="officer-top"><div class="officer-seal">'+o.name.slice(0,1)+'</div><div><b>'+o.name+' · '+o.role+'</b><small>'+o.trait+'｜'+city(o.city).name+'</small></div></div>'+
   '<div class="officer-stats"><span><strong>'+o.cmd+'</strong>統</span><span><strong>'+o.war+'</strong>武</span><span><strong>'+o.int+'</strong>智</span><span><strong>'+o.pol+'</strong>政</span></div></div>'
 ).join('')+'</div>';
}
function renderArmies(box){
 const list=armiesOf(state.player);
 const selected=list.find(a=>a.id===state.selected);
 if(selected){
   const o=officer(selected.cmd),loc=city(selected.city),tar=selected.target?city(selected.target):null;
   box.innerHTML=
    '<div class="side-title">FIELD ARMY</div>'+
    '<h2>'+(o?o.name:'無名')+'軍</h2>'+
    '<div class="tagrow"><span class="tag">'+selected.status+'</span><span class="tag">士氣 '+selected.morale+'</span><span class="tag">軍糧 '+selected.supply+' 日</span></div>'+
    '<div class="stat-grid">'+
      '<div class="stat"><span>步兵</span><b>'+fmt(selected.inf)+'</b></div>'+
      '<div class="stat"><span>弩兵</span><b>'+fmt(selected.xbow)+'</b></div>'+
      '<div class="stat"><span>騎兵</span><b>'+fmt(selected.cav)+'</b></div>'+
      '<div class="stat"><span>總兵力</span><b>'+fmt(armyTroops(selected))+'</b></div>'+
    '</div>'+
    '<div class="section-title">行軍狀態</div>'+
    '<div class="muted">'+loc.name+(tar?' → '+tar.name+'｜預計 '+Math.max(0,2-selected.progress)+' 旬抵達':'｜目前駐紮')+'</div>'+
    '<div class="city-command-grid">'+
      '<button id="armyBack"><b>返回軍團列表</b><small>查看其他軍團</small></button>'+
      '<button id="armyCity"><b>查看所在城</b><small>'+loc.name+'</small></button>'+
    '</div>';
   $('armyBack').onclick=()=>{state.selected=null;renderArmies(box);};
   $('armyCity').onclick=()=>{state.selected=selected.city;state.active='city';render();};
   return;
 }
 box.innerHTML=
  '<div class="side-title">FIELD ARMIES</div><h2>'+FACTIONS[state.player].name+' · 軍團</h2>'+
  '<p class="muted">選擇一支軍團查看兵種、士氣、補給與行軍狀態。</p>'+
  '<div class="army-list">'+
  (list.length?list.map(a=>{
    const o=officer(a.cmd),loc=city(a.city),tar=a.target?city(a.target):null;
    return '<button data-army-open="'+a.id+'"><b>'+(o?o.name:'無名')+'軍 · '+fmt(armyTroops(a))+'</b><small>'+loc.name+(tar?' → '+tar.name:' · '+a.status)+'｜士氣 '+a.morale+'｜糧 '+a.supply+' 日</small></button>';
  }).join(''):'<div class="muted">目前沒有軍團。請先點己方城池，再使用出征。</div>')+
  '</div>';
 box.querySelectorAll('[data-army-open]').forEach(b=>b.onclick=()=>{state.selected=b.dataset.armyOpen;renderArmies(box);});
}

function renderDiplo(box){
 const rel=REL[state.player]||{};
 box.innerHTML='<div class="side-title">DIPLOMACY</div><h2>列國關係</h2><p class="muted">關係值會影響交涉難度。敵對勢力可能進攻，中立勢力則有機會拉攏。</p><div class="diplomacy-list">'+
 Object.keys(FACTIONS).filter(f=>f!==state.player).map(f=>{
  const v=rel[f]??0,label=v<=-70?'敵對':v<0?'警戒':v>=35?'友好':'中立';
  const cls=v<=-70?'hostile':v>=35?'friendly':'';
  const pct=Math.max(5,Math.min(100,(v+100)/2));
  return '<div class="dip-card"><div class="dip-head"><div><div class="dip-name">'+FACTIONS[f].name+'</div><div class="dip-ruler">'+FACTIONS[f].ruler+'</div></div><span class="dip-status '+cls+'">'+label+'</span></div>'+
  '<div class="dip-meter"><i style="width:'+pct+'%"></i></div><div class="dip-note"><span>關係</span><b>'+(v>0?'+':'')+v+'</b></div></div>';
 }).join('')+'</div>';
}
function renderLog(box){
 box.innerHTML='<div class="side-title">CHRONICLE</div><h2>天下紀事</h2><div class="divider"></div>'+
 state.log.slice(0,18).map((x,i)=>'<div class="stat" style="margin-bottom:7px"><span>第 '+Math.max(1,state.turn-i)+' 旬</span><b style="font-size:10px;font-weight:500;line-height:1.55">'+x+'</b></div>').join('');
}
function spend(){
 if(state.ap<=0){toast('本旬軍令已用盡');return false}
 state.ap--;return true;
}
function develop(type){
 const c=city(state.selected);if(!c||c.f!==state.player||!spend())return;
 if(type==='farm'){c.farm=clamp(c.farm+3,0,100);c.food+=5000;log(c.name+'完成開墾，糧產提升。')}
 if(type==='trade'){c.trade=clamp(c.trade+3,0,100);c.gold+=1500;log(c.name+'商業繁榮，府庫收入增加。')}
 if(type==='order'){c.order=clamp(c.order+5,0,100);log(c.name+'安撫百姓，治安提升。')}
 if(type==='fort'){if(c.gold<800){state.ap++;toast('金不足');return}c.gold-=800;c.def=clamp(c.def+3,0,100);log(c.name+'增築城防。')}
 render();
}
function recruit(){
 const c=city(state.selected);if(!c||!spend())return;
 if(c.food<2500||c.pop<12000){state.ap++;return toast('人口或糧草不足')}
 c.garrison+=3000;c.pop-=4200;c.food-=2200;log(c.name+'徵募步卒 3,000。');render();
}
function dispatchModal(preferredTarget=null){
 const c=city(state.selected);if(!c||c.f!==state.player)return;
 const os=factionOfficers(state.player).filter(o=>o.city===state.selected||o.city===FACTIONS[state.player].capital).sort((a,b)=>b.cmd-a.cmd);
 modal(
  '<h3>'+c.name+' · 編成軍團</h3><p>軍團至少 2,000 人。行軍需要兩旬抵達相鄰城池，途中持續消耗軍糧。</p>'+
  '<div class="field"><label>主將</label><select id="mCmd">'+os.map(o=>'<option value="'+o.id+'">'+o.name+'｜統率 '+o.cmd+'｜'+o.trait+'</option>').join('')+'</select></div>'+
  '<div class="field"><label>目標城池</label><select id="mTarget">'+c.nb.map(id=>'<option value="'+id+'">'+city(id).name+'｜'+FACTIONS[city(id).f].name+'｜守軍 '+fmt(city(id).garrison)+'</option>').join('')+'</select></div>'+
  '<div class="field"><label>步兵</label><input id="mInf" type="number" min="1000" step="500" value="'+Math.min(6000,c.garrison)+'"></div>'+
  '<div class="field"><label>弩兵</label><input id="mXbow" type="number" min="0" step="500" value="'+Math.min(1500,Math.floor(c.garrison*.18))+'"></div>'+
  '<div class="field"><label>騎兵</label><input id="mCav" type="number" min="0" step="500" value="'+Math.min(1500,Math.floor(c.garrison*.12))+'"></div>'+
  '<div class="modal-row"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" id="launch">下令出征</button></div>'
 );
 if(preferredTarget&&$('mTarget'))$('mTarget').value=preferredTarget;
 $('launch').onclick=()=>{
  const inf=+$('mInf').value||0,xbow=+$('mXbow').value||0,cav=+$('mCav').value||0,total=inf+xbow+cav;
  if(total<2000)return toast('軍團兵力至少 2,000');
  if(total>c.garrison)return toast('超過城內可用兵力');
  if(!spend())return;
  c.garrison-=total;
  const a={id:'u'+Date.now(),f:state.player,cmd:$('mCmd').value,city:state.selected,target:$('mTarget').value,progress:0,inf,xbow,cav,morale:84,supply:35,status:'行軍'};
  state.armies.push(a);log(officer(a.cmd).name+'率 '+fmt(total)+' 人自 '+c.name+' 出征 '+city(a.target).name+'。');
  closeModal();state.active='army';render();
 };
}
function terrainMod(t){
 return {山地:.90,山口:.82,關隘:.72,水網:.88,平原:1.03,都市:.92,要衝:.86,丘陵:.92,盆地:.96}[t]||1;
}
function compositionPower(a,o,attack=true){
 const inf=a.inf*(attack?1:.98),xbow=a.xbow*(attack?1.08:1.15),cav=a.cav*(attack?1.18:.95);
 const base=inf+xbow+cav;
 const mix=1+Math.min(.12,(a.cav/Math.max(1,base))*.22)+(a.xbow/Math.max(1,base))*.08;
 return base*(.72+o.cmd/190)*(a.morale/100)*mix;
}
function battle(a){
 const d=city(a.target),attO=officer(a.cmd)||{name:'將領',cmd:70},defO=world.officers.filter(o=>o.f===d.f&&o.city===a.target).sort((x,y)=>y.cmd-x.cmd)[0]||{name:'守將',cmd:66};
 const att=compositionPower(a,attO,true)*(0.9+rnd(0,20)/100);
 const defBase=d.garrison*(.72+defO.cmd/210)*(1+d.def/180)*terrainMod(d.terrain)*(0.9+rnd(0,20)/100);
 const win=att>defBase;
 const beforeA=armyTroops(a),beforeD=d.garrison;
 let lossA,lossD;
 if(win){lossA=Math.round(beforeA*(.12+Math.random()*.13));lossD=Math.round(beforeD*(.35+Math.random()*.32))}
 else{lossA=Math.round(beforeA*(.25+Math.random()*.22));lossD=Math.round(beforeD*(.10+Math.random()*.16))}
 applyArmyLoss(a,lossA);d.garrison=Math.max(0,d.garrison-lossD);
 const captured=win&&d.garrison<2200&&armyTroops(a)>1200;
 let old=d.f;
 if(captured){
  d.f=a.f;
  const leave=Math.max(1200,Math.round(armyTroops(a)*.22));
  d.garrison=leave;applyArmyLoss(a,leave);
  a.city=a.target;a.target=null;a.progress=0;a.status='駐紮';a.morale=clamp(a.morale+4,30,100);
  log(FACTIONS[a.f].name+'軍攻取 '+d.name+'，'+FACTIONS[old].name+'失城。');
 }else{
  a.target=null;a.progress=0;a.status='整備';a.morale=clamp(a.morale-(win?4:12),25,100);
  log(attO.name+'攻 '+d.name+(win?'得利，但未破城。':'失利，退軍整備。'));
 }
 showBattleReport(attO,defO,d,beforeA,beforeD,lossA,lossD,win,captured);
 if(armyTroops(a)<800)state.armies=state.armies.filter(x=>x!==a);
}
function applyArmyLoss(a,n){
 const total=armyTroops(a);if(total<=0)return;
 const inf=Math.min(a.inf,Math.round(n*a.inf/total)),xbow=Math.min(a.xbow,Math.round(n*a.xbow/total)),cav=Math.min(a.cav,Math.max(0,n-inf-xbow));
 a.inf-=inf;a.xbow-=xbow;a.cav-=cav;
}
function showBattleReport(attO,defO,d,a0,d0,la,ld,win,captured){
 modal('<h3>戰報 · '+d.name+'</h3><p>'+(captured?'城池陷落，勢力版圖已改變。':win?'攻軍取得優勢，但守軍仍控制城池。':'守軍成功擊退進攻。')+'</p>'+
 '<div class="report"><div class="side"><small>'+attO.name+'</small><div class="big">'+fmt(a0)+'</div><span class="loss">-'+fmt(la)+'</span></div><div class="vs">VS</div><div class="side"><small>'+defO.name+'</small><div class="big">'+fmt(d0)+'</div><span class="loss">-'+fmt(ld)+'</span></div></div>'+
 '<div class="modal-row"><button class="btn primary" onclick="closeModal()">確認</button></div>');
}
function economyTick(){
 Object.values(world.cities).forEach(c=>{
  const orderMod=.6+c.order/250;
  c.food+=Math.round(c.farm*55*orderMod);
  c.gold+=Math.round(c.trade*21*orderMod);
  c.pop+=Math.round(c.pop*.0009);
  if(c.order<45)c.gold=Math.max(0,c.gold-rnd(200,500));
 });
 state.armies.forEach(a=>{
  if(a.target){a.supply--;a.morale=clamp(a.morale-(a.supply<10?3:0),20,100)}
 });
}
function moveArmies(){
 state.armies.slice().forEach(a=>{
  if(!a.target)return;
  a.progress++;
  if(a.progress>=2)battle(a);
 });
}
function aiTurn(){
 Object.keys(FACTIONS).filter(f=>f!==state.player).forEach(f=>{
  const cs=factionCities(f);if(!cs.length)return;
  cs.forEach(([_,c])=>{
   if(Math.random()<.36)c.farm=clamp(c.farm+1,0,100);
   if(Math.random()<.30)c.trade=clamp(c.trade+1,0,100);
   if(c.garrison<10000&&c.food>7000&&Math.random()<.28){c.garrison+=1500;c.food-=1100}
  });
  const hasMarch=armiesOf(f).some(a=>a.target);
  if(hasMarch||Math.random()>.30)return;
  const source=cs.slice().sort((a,b)=>b[1].garrison-a[1].garrison)[0];
  if(!source)return;
  const [sid,sc]=source;
  const targets=sc.nb.map(id=>[id,city(id)]).filter(([_,c])=>c.f!==f).sort((a,b)=>a[1].garrison-b[1].garrison);
  if(!targets.length)return;
  const [tid,tc]=targets[0];
  const lead=factionOfficers(f).sort((a,b)=>b.cmd-a.cmd)[0];
  if(!lead||sc.garrison<tc.garrison*1.45||sc.garrison<13000)return;
  const send=Math.round(sc.garrison*.46);sc.garrison-=send;
  state.armies.push({id:'ai'+Date.now()+Math.random(),f,cmd:lead.id,city:sid,target:tid,progress:0,inf:Math.round(send*.63),xbow:Math.round(send*.18),cav:Math.round(send*.19),morale:f==='chu'?90:78,supply:30,status:'行軍'});
  log(FACTIONS[f].name+'軍自 '+sc.name+' 出動，目標 '+tc.name+'。');
 });
}
function randomEvent(){
 const roll=Math.random();
 if(roll<.13){
  const owned=factionCities(state.player);if(!owned.length)return;
  const [id,c]=owned[rnd(0,owned.length-1)];
  const gain=rnd(1600,3200);c.food+=gain;log(c.name+'秋成較佳，糧草增加 '+fmt(gain)+'。');
 }else if(roll<.19){
  const owned=factionCities(state.player);if(!owned.length)return;
  const [id,c]=owned[rnd(0,owned.length-1)];
  c.order=clamp(c.order-4,0,100);log(c.name+'流民增多，治安略降。');
 }
}
function endTurn(){
 state.turn++;state.ap=3;state.period=(state.period+1)%3;if(state.period===0)state.month++;
 economyTick();moveArmies();aiTurn();randomEvent();render();
 if(state.turn%3===0)toast('新的一月開始，請重新檢視前線補給與城內兵力。');
}
function log(s){state.log.unshift(s);state.log=state.log.slice(0,40)}
function toast(s){
 const d=document.createElement('div');d.className='toast';d.textContent=s;document.body.appendChild(d);setTimeout(()=>d.remove(),2200);
}
function modal(html){$('modal').innerHTML=html;$('modalBg').classList.remove('hidden')}
function closeModal(){$('modalBg').classList.add('hidden')}
window.closeModal=closeModal;

let mapScale=1,mapX=0,mapY=0,drag=false,sx=0,sy=0;
function applyMap(){const g=$('viewport');g.setAttribute('transform','translate('+mapX+' '+mapY+') scale('+mapScale+')');$('zoomText').textContent=Math.round(mapScale*100)+'%'}
function zoom(delta){mapScale=clamp(mapScale+delta,.75,1.65);applyMap()}
function initMapPan(){
 const svg=$('world');
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?-.08:.08)},{passive:false});
 svg.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.city,.army'))return;drag=true;sx=e.clientX-mapX;sy=e.clientY-mapY;svg.setPointerCapture(e.pointerId)});
 svg.addEventListener('pointermove',e=>{if(!drag)return;mapX=e.clientX-sx;mapY=e.clientY-sy;applyMap()});
 svg.addEventListener('pointerup',()=>drag=false);
}
function rankModal(){
 const rows=Object.keys(FACTIONS).map(f=>{const z=factionTotals(f);return{f,p:factionPower(f),...z}}).sort((a,b)=>b.p-a.p);
 modal('<h3>天下勢力</h3><p>勢力值綜合城池、兵力、糧草與金錢，用來觀察天下大勢，不直接等於戰鬥力。</p><table class="table"><tr><th>#</th><th>勢力</th><th>君主</th><th>城</th><th>總兵力</th><th>勢力值</th></tr>'+
 rows.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+FACTIONS[r.f].name+'</td><td>'+FACTIONS[r.f].ruler+'</td><td>'+r.cities+'</td><td>'+fmt(r.troops)+'</td><td>'+fmt(r.p)+'</td></tr>').join('')+
 '<div class="modal-row"><button class="btn primary" onclick="closeModal()">關閉</button></div>');
}
function showHelp(){
 modal('<h3>玩法核心</h3><p>每旬有 3 點軍令。先靠內政與徵兵建立後方，再從城池編成軍團。軍團沿道路行軍兩旬抵達目標；戰鬥結果取決於主將統率、士氣、步弩騎組成、守城強度與地形。</p><div class="stat-grid"><div class="stat"><span>第一目標</span><b>奪取三秦</b><small>向關中推進</small></div><div class="stat"><span>第二目標</span><b>控制洛陽</b><small>打開東進通道</small></div><div class="stat"><span>最終目標</span><b>攻取彭城</b><small>擊破西楚核心</small></div><div class="stat"><span>風險</span><b>補給與兵力</b><small>不要抽空後方城防</small></div></div><div class="modal-row"><button class="btn primary" onclick="closeModal()">開始操作</button></div>');
}
function openStart(){
 $('startScreen').classList.remove('hidden');
 const has=!!localStorage.getItem('noirxu_chuhan_v02');$('continueBtn').classList.toggle('hidden',!has);
}
function closeStart(){$('startScreen').classList.add('hidden')}
function initUI(){
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{
   state.active=b.dataset.nav;
   if(state.active==='city' && !world.cities[state.selected]) state.selected=null;
   if(state.active!=='army' && state.selected && !world.cities[state.selected]) state.selected=null;
   render();
 });
 document.querySelectorAll('[data-intel]').forEach(b=>b.onclick=()=>{state.intelTab=b.dataset.intel;renderIntel();});
 $('endBtn').onclick=endTurn;$('rankBtn').onclick=rankModal;$('helpBtn').onclick=showHelp;$('saveBtn').onclick=save;
 $('zoomIn').onclick=()=>zoom(.1);$('zoomOut').onclick=()=>zoom(-.1);$('zoomReset').onclick=()=>{mapScale=1;mapX=0;mapY=0;applyMap()};
 document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{state.selected=b.dataset.quick;state.active='city';render()});
 $('modalBg').onclick=e=>{if(e.target===$('modalBg'))closeModal()};
 document.querySelectorAll('[data-fchoice]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-fchoice]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('startGame').dataset.f=b.dataset.fchoice});
 $('startGame').onclick=()=>newGame($('startGame').dataset.f||'han');
 $('continueBtn').onclick=()=>{closeStart();load()};
 $('newBtn').onclick=()=>{closeModal();openStart()};
 initMapPan();
}
document.addEventListener('DOMContentLoaded',()=>{initUI();render();openStart()});
