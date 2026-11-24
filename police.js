// ROUND 7: 5-star wanted system, escalating police pursuit, fleeing NPCs.
// Hitting a police unit raises the wanted level (1-5 stars). More stars mean
// more and faster units. The chase targets a CAR, not the driver: shift out
// and the abandoned car realizes it is hunted and flees while units box it in.
export function createPursuitSystem({groundHeight,nearestRoad,navigation,toast,addCoins,getPlayer,getCars,carTypes,spawnPolice,rejoinTraffic}){
 const ui=document.createElement('div');ui.id='wanted';
 for(let i=0;i<5;i++){const s=document.createElement('i');s.textContent='★';ui.append(s)}
 const label=document.createElement('b');label.textContent='WANTED';ui.append(label);document.body.append(ui);
 const P={stars:0,maxStars:0,target:null,chasers:[],hitCd:0,cool:0,esc:0,arrestT:0,planT:0,timers:[]};
 const WANT=[0,2,3,4,5,6];
 const isCop=c=>{const m=carTypes[c.type][0];return m==='police'||m==='tractor-police'}
 const starsEls=[...ui.querySelectorAll('i')];
 function setStars(n){P.stars=n;P.maxStars=Math.max(P.maxStars,n);starsEls.forEach((s,i)=>s.classList.toggle('on',i<n));ui.classList.toggle('active',n>0)}
 function chaseSpeed(c){return(23+P.stars*4.6)*1.14*(c.type===19?.72:1)}
 function retire(c){c.retired=true;const arr=getCars(),i=arr.indexOf(c);if(i>=0)arr.splice(i,1);c.root.parent?.remove(c.root);c.marker?.parent?.remove(c.marker)}
 function endChase(){P.grace=0;
  for(const c of P.chasers){c.pursuit=null;c.chaser=false;c.cruise=17;
   if(c._spawnedCop&&getCars().length>56)retire(c);else if(!c._hold)rejoinTraffic(c)}
  P.chasers=[];
  if(P.target){P.target.fleeing=false;P.target.chaser=false}
  P.target=null;setStars(0);P.cool=0;P.esc=0;P.arrestT=0;P.maxStars=0;
 }
 function busted(msg){toast(msg);endChase()}
 function planFlee(t){
  let threat=null,td=Infinity;
  for(const c of P.chasers){if(c.retired)continue;const d=Math.hypot(c.x-t.x,c.z-t.z);if(d<td){td=d;threat=c}}
  const base=threat?Math.atan2(t.x-threat.x,t.z-threat.z):Math.random()*6.283;
  for(let k=0;k<6;k++){
   const ang=base+(Math.random()-.5)*1.3,r=170+Math.random()*130;
   const q=nearestRoad(t.x+Math.sin(ang)*r,t.z+Math.cos(ang)*r);
   if(Math.abs(q.x)<358&&Math.abs(q.z)<358){
    try{const route=navigation()?.solve({x:t.x,z:t.z},q);if(route&&route.length>1){t.route=route;t.wp=0;return}}catch(e){}
   }
  }
  const q=nearestRoad(t.x+Math.sin(base)*200,t.z+Math.cos(base)*200);t.route=[{x:t.x,z:t.z},q];t.wp=1;
 }
 function maintain(){
  const t=P.target;if(!t)return;
  for(const c of P.chasers.slice()){
   if(c.retired){P.chasers.splice(P.chasers.indexOf(c),1);continue}
   if((c.health??100)<=0){ // unit wrecked: it radios for a replacement
    c.pursuit=null;c.chaser=false;c._hold=true;P.chasers.splice(P.chasers.indexOf(c),1);
    P.timers.push({t:22,fn:()=>{c._hold=false;if(!c.retired)rejoinTraffic(c)}});
   }
  }
  let active=P.chasers.filter(c=>!c.retired&&c.pursuit);
  if(active.length<WANT[P.stars]){
   for(const c of getCars()){
    if(active.length>=WANT[P.stars])break;
    if(c.ai&&!c.pursuit&&!c.race&&!c.chaser&&!c.retired&&!c._hold&&isCop(c)&&Math.hypot(c.x-t.x,c.z-t.z)<260){
     c.pursuit={target:t,speed:chaseSpeed(c)};c.chaser=true;c.route=null;c.fleeing=false;P.chasers.push(c);active.push(c)}
   }
  }
  while(active.length<WANT[P.stars]&&getCars().length<72){
   const type=P.stars>=4?6:(Math.random()<.85?6:19);
   let placed=null;
   for(let k=0;k<8;k++){const ang=Math.random()*6.283,r=90+Math.random()*80;const q=nearestRoad(t.x+Math.sin(ang)*r,t.z+Math.cos(ang)*r);if(Math.hypot(q.x-t.x,q.z-t.z)>45&&Math.abs(q.x)<358&&Math.abs(q.z)<358){placed=q;break}}
   if(!placed)break;
   const c=spawnPolice(type,placed.x,placed.z,Math.atan2(t.x-placed.x,t.z-placed.z));
   c._spawnedCop=true;c.pursuit={target:t,speed:chaseSpeed(c)};c.chaser=true;c.cruise=24;c.vx=Math.sin(c.a)*9;c.vz=Math.cos(c.a)*9;
   P.chasers.push(c);active.push(c);
  }
  for(const c of P.chasers)if(c.pursuit)c.pursuit.speed=chaseSpeed(c);
 }
 return{
  reportHit(playerCar,cop,strength){
   if(strength<2.5||P.hitCd>0)return;P.hitCd=.8;
   if(!P.target||P.target!==playerCar||P.stars===0){
    if(P.target&&P.target!==playerCar)P.target.fleeing=false;
    P.target=playerCar;P.maxStars=0;P.esc=0;P.cool=0;P.arrestT=0;P.planT=0;
    setStars(1);P.grace=4.5;toast('WANTED ★ • YOU RAMMED A POLICE UNIT');
   }else if(P.stars<5){setStars(P.stars+1);P.cool=0;toast('WANTED LEVEL '+P.stars+' ★')}
   // ROUND 8: every police car in the area reacts to the hit, not just the one struck
   for(const o of getCars()){if(isCop(o)&&!o.retired&&!o.pursuit&&Math.hypot(o.x-playerCar.x,o.z-playerCar.z)<260){o.pursuit={target:playerCar,speed:chaseSpeed(o)};o.chaser=true;o.route=null;o.fleeing=false;if(!P.chasers.includes(o))P.chasers.push(o)}}
  },
  update(dt){
   P.hitCd=Math.max(0,P.hitCd-dt);
   if(P.stars>0){
    const t=P.target;
    if(!t||t.retired)endChase();
    else{
     if(t.ai){if(!t.fleeing){t.fleeing=true;t.chaser=true;toast('YOUR OLD CAR IS MAKING A RUN FOR IT')}}else t.fleeing=false;
     if((t.health??100)<=0)busted(t.ai?'SUSPECT CAR DESTROYED • HEAT OFF':'BUSTED • YOUR CAR IS TOTALED');
     else{
      P.grace=Math.max(0,(P.grace||0)-dt);let near=0;if(P.grace<=0)for(const c of P.chasers)if(!c.retired&&Math.hypot(c.x-t.x,c.z-t.z)<7)near++;
      if(near>0&&t.speed<2.5)P.arrestT+=dt;else P.arrestT=Math.max(0,P.arrestT-dt*2);
      if(P.arrestT>2.5)busted(t.ai?'THEY CAUGHT YOUR OLD RIDE • HEAT OFF':'BUSTED • PULLED OVER');
      else{
       P.esc+=dt;if(P.esc>45&&P.stars<5){P.esc=0;setStars(P.stars+1);toast('WANTED LEVEL '+P.stars+' ★ • BACKUP INCOMING')}
       maintain();
       let minD=Infinity;for(const c of P.chasers)if(!c.retired)minD=Math.min(minD,Math.hypot(c.x-t.x,c.z-t.z));
       if(minD>70)P.cool+=dt;else P.cool=0;
       if(P.cool>9){P.cool=0;if(P.stars<=1){const bonus=20*P.maxStars;if(bonus)addCoins(bonus,'Escaped a '+P.maxStars+'-star pursuit');toast('YOU LOST THEM'+(bonus?' • +'+bonus+' COINS':''));endChase()}else{setStars(P.stars-1);toast('LOSING THEM… ★'+P.stars)}}
       if(t.fleeing&&t.ai){P.planT-=dt;const last=t.route&&t.route[t.route.length-1];if(P.planT<=0||!last||Math.hypot(last.x-t.x,last.z-t.z)<28){P.planT=4;planFlee(t)}}
      }
     }
    }
   }
   for(const q of P.timers.slice()){q.t-=dt;if(q.t<=0){P.timers.splice(P.timers.indexOf(q),1);q.fn()}}
  },
  state:()=>({stars:P.stars,chasers:P.chasers.filter(c=>!c.retired).length,target:!!P.target,targetAi:P.target?P.target.ai:null,fleeing:!!(P.target&&P.target.fleeing),maxStars:P.maxStars,arrestT:+P.arrestT.toFixed(2),cool:+P.cool.toFixed(1)}),
  debug:{force(n){const p=getPlayer();if(!p)return;if(P.target&&P.target!==p){P.target.fleeing=false;P.target.chaser=false}P.target=p;setStars(n);P.maxStars=n;P.grace=4.5;P.esc=0;P.cool=0}}
 };
}
