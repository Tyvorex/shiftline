// SHIFTLINE round 14: city polish. Loads after game.js and hooks window.__game.
(function(){
const ready=()=>window.__game&&window.__game.player&&window.__game.player()&&window.__game.THREE;
const wait=setInterval(()=>{if(!ready())return;clearInterval(wait);try{boot(window.__game)}catch(e){console.warn('r14 boot failed',e)}},300);

function boot(g){
const T=g.THREE,scene=g.scene,statics=g.statics,gh=g.groundHeight;
let seed=1414;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;

// ---------- 1. Row buildings that fill the empty edge strips (north and south of the grid) ----------
function facadeTex(base,trim,warm){
  const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');
  c.fillStyle=base;c.fillRect(0,0,128,128);
  c.fillStyle='rgba(0,0,0,.07)';for(let y=0;y<128;y+=8)c.fillRect(0,y,128,1);
  c.fillStyle=trim;c.fillRect(0,118,128,10);c.fillRect(0,0,128,4);
  // window
  c.fillStyle='#1c2c38';c.fillRect(34,22,60,70);c.fillStyle='#4f7384';c.fillRect(38,26,52,30);c.fillStyle='#3b5766';c.fillRect(38,58,52,30);
  c.fillStyle=trim;c.fillRect(30,92,68,8);c.fillRect(62,22,4,70);
  const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;
  const e=document.createElement('canvas');e.width=e.height=128;const d=e.getContext('2d');d.fillStyle='#000';d.fillRect(0,0,128,128);
  d.fillStyle=warm;d.fillRect(38,26,52,30);d.fillRect(38,58,52,30);
  const et=new T.CanvasTexture(e);et.wrapS=et.wrapT=T.RepeatWrapping;et.colorSpace=T.SRGBColorSpace;
  return {map:t,emap:et};
}
const palettes=[['#9a5a45','#cdbba0','#ffcf7a'],['#c9b99a','#6d5f4c','#ffd89b'],['#7d8d97','#d6dde0','#ffe3a8'],['#b08a6a','#e9ddc6','#ffc46b'],['#8c6a5a','#c9b79c','#ffd28a'],['#a7a08f','#5e6a6e','#ffdca0']];
const facMats=palettes.map(p=>{const {map,emap}=facadeTex(...p);const m=new T.MeshStandardMaterial({map,emissiveMap:emap,emissive:new T.Color('#ffffff'),emissiveIntensity:.05,roughness:.85});m.userData.r14=1;(window.__winMats=window.__winMats||[]).push(m);return m});
const roofMat=new T.MeshStandardMaterial({color:'#4a4d4f',roughness:.95});
const doorMat=new T.MeshStandardMaterial({color:'#2b2118',roughness:.7});
const awnMats=['#b5433a','#2f6b6a','#d4a437','#3d5a80'].map(c=>new T.MeshStandardMaterial({color:c,roughness:.8}));
const slab=new T.MeshStandardMaterial({color:'#b7b4a5',roughness:1});
function rowBuilding(x,z,w,d,h,face,pi){
  const ground=Math.max(gh(x-w/2,z-d/2),gh(x+w/2,z+d/2),gh(x-w/2,z+d/2),gh(x+w/2,z-d/2))+.28;
  const grp=new T.Group();grp.position.set(x,ground,z);
  const m=facMats[pi%facMats.length],sideGeo=new T.BoxGeometry(w,h,d);
  const uv=sideGeo.attributes.uv,n=sideGeo.attributes.normal;
  for(let i=0;i<uv.count;i++){const ny=Math.abs(n.getY(i)),nx=Math.abs(n.getX(i));const span=nx>.5?d:w;if(ny>.5){continue}uv.setXY(i,uv.getX(i)*Math.max(1,Math.round(span/4.2)),uv.getY(i)*Math.max(1,Math.round(h/3.6)))}
  const body=new T.Mesh(sideGeo,[m,m,roofMat,roofMat,m,m]);body.position.y=h/2;body.castShadow=body.receiveShadow=true;grp.add(body);
  const par=new T.Mesh(new T.BoxGeometry(w+.5,.7,d+.5),roofMat);par.position.y=h+.35;par.castShadow=true;grp.add(par);
  for(let k=0;k<2;k++){const ac=new T.Mesh(new T.BoxGeometry(2+rnd()*2,1.2,2),new T.MeshStandardMaterial({color:'#8a9296',roughness:.7}));ac.position.set((rnd()-.5)*w*.6,h+1.2,(rnd()-.5)*d*.5);grp.add(ac)}
  const door=new T.Mesh(new T.BoxGeometry(2.4,3,.3),doorMat);door.position.set(0,1.5,face*(d/2+.1));grp.add(door);
  const awn=new T.Mesh(new T.BoxGeometry(Math.min(w-3,9),.35,1.7),awnMats[pi%awnMats.length]);awn.position.set(0,3.4,face*(d/2+.85));awn.rotation.x=face*.16;awn.castShadow=true;grp.add(awn);
  const base=new T.Mesh(new T.BoxGeometry(w+.6,.8,d+.6),slab);base.position.y=-.35;grp.add(base);
  scene.add(grp);statics.push({x,z,hx:w/2,hz:d/2});return grp;
}
const signXs=[-260,-130,0,130,260];
let pi=0;
for(const side of [-1,1]){
  for(let col=-250;col<=250;col+=100){
    for(const off of [-22,22]){
      let x=col+off,w=30+Math.floor(rnd()*3)*2;
      if(signXs.some(s=>Math.abs(s-x)<w/2+3))x+=(x<col?-1:1)*9;
      const d=18,z=side*327,h=13+Math.floor(rnd()*5)*3.6;
      // the street is at |z|=300, so the facade faces it
      rowBuilding(x,z,w,d,h,-side,pi++);
    }
  }
}

// ---------- 2. Parked cars in the alleys between the row buildings ----------
try{
  const okName=/sedan|hatch|suv|taxi|van|coupe|wagon|compact|sport|pickup/i;
  const src=g.cars.filter(c=>c.root&&!c.pursuit&&okName.test(g.carTypes[c.type][0])&&!/police|ambulance|fire/i.test(g.carTypes[c.type][0]));
  const pool=src.length?src:g.cars.filter(c=>c.root).slice(0,6);let k=0;
  for(const side of [-1,1])for(let col=-250;col<=250;col+=100){
    if(signXs.some(s=>Math.abs(s-col)<8))continue;
    for(const dx of [-3.2,3.2]){
      if(rnd()<.3)continue;
      const c=pool[(k++)%pool.length],o=c.root.clone(true);
      o.position.set(col+dx,gh(col+dx,side*326)+.28,side*(322+rnd()*6));o.rotation.set(0,side>0?Math.PI:0,0);
      o.traverse(m=>{if(m.isMesh)m.castShadow=true});
      scene.add(o);statics.push({x:col+dx,z:o.position.z,hx:1.1,hz:2.4});
    }
  }
}catch(e){console.warn('r14 parked cars',e)}

// ---------- 3. Coin pickups along the avenues ----------
const coinList=[];
try{
  const coords=[-300,-200,-100,0,100,200,300];
  const geo=new T.CylinderGeometry(.85,.85,.16,16);geo.rotateX(Math.PI/2);
  const cm=new T.MeshStandardMaterial({color:'#ffcf3a',emissive:'#ff9d00',emissiveIntensity:.55,metalness:.6,roughness:.3});
  const inst=new T.InstancedMesh(geo,cm,160);inst.frustumCulled=false;scene.add(inst);
  const add=(x,z)=>coinList.push({x,z,y:gh(x,z)+1.7,t:0,on:true});
  for(const c of coords){
    for(let z=-290;z<=290;z+=30){if(coords.some(q=>Math.abs(z-q)<24))continue;if(rnd()<.55)continue;add(c+(rnd()<.5?-4.5:4.5),z)}
    for(let x=-290;x<=290;x+=30){if(coords.some(q=>Math.abs(x-q)<24))continue;if(rnd()<.55)continue;add(x,c+(rnd()<.5?-4.5:4.5))}
  }
  coinList.length=Math.min(coinList.length,160);
  const mtx=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),sc=new T.Vector3(),pv=new T.Vector3();
  let ac=null;const beep=()=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),gn=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(880,ac.currentTime);o.frequency.exponentialRampToValueAtTime(1500,ac.currentTime+.09);gn.gain.setValueAtTime(.06,ac.currentTime);gn.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.16);o.connect(gn);gn.connect(ac.destination);o.start();o.stop(ac.currentTime+.18)}catch(_){}};
  const pop=(txt)=>{const box=document.getElementById('popups');if(!box)return;while(box.children.length>2)box.firstChild.remove();const d=document.createElement('div');d.className='popup';const s=document.createElement('span');s.textContent=txt;d.appendChild(s);box.appendChild(d);setTimeout(()=>d.remove(),1600)};
  let chain=0,chainT=0,last=performance.now();
  window.__r14coins={list:coinList,collected:0};
  function tickCoins(){
    const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;const p=g.player();
    chainT-=dt;if(chainT<=0)chain=0;
    for(let i=0;i<coinList.length;i++){
      const c=coinList[i];
      if(!c.on){c.t-=dt;if(c.t<=0)c.on=true}
      if(c.on&&p&&!g.state().paused){const dx=p.x-c.x,dz=p.z-c.z;if(dx*dx+dz*dz<12&&Math.abs((p.root?p.root.position.y:c.y)-c.y)<4){c.on=false;c.t=50;chain++;chainT=4;const v=Math.min(10,2+chain);if(window.R4&&R4.addCoins)R4.addCoins(v,'coin');window.__r14coins.collected++;if(chain>2){const t=document.getElementById('toast');if(t){t.textContent='COIN CHAIN x'+chain;t.style.opacity=1}}beep()}}
      e.set(0,now*.0025+i,0);q.setFromEuler(e);const s=c.on?1:0;sc.set(s,s,s);pv.set(c.x,c.y+Math.sin(now*.003+i)*.15,c.z);mtx.compose(pv,q,sc);inst.setMatrixAt(i,mtx);
    }
    inst.count=coinList.length;inst.instanceMatrix.needsUpdate=true;
    requestAnimationFrame(tickCoins);
  }
  requestAnimationFrame(tickCoins);
}catch(e){console.warn('r14 coins',e)}

// ---------- 4. Traffic yields at junctions without lights ----------
try{
  const sig=g.signals,orig=sig.desiredSpeed.bind(sig),C=[-300,-200,-100,0,100,200,300];
  const lit=(x,z)=>[-200,0,200].includes(x)&&[-200,0,200].includes(z);
  sig.desiredSpeed=function(c,desired){
    desired=orig(c,desired);
    if(c.race||c.chaser||c.target||c._hold||c.pursuit)return desired;
    const fx=Math.sin(c.a),fz=Math.cos(c.a);
    for(const jx of C)for(const jz of C){
      if(lit(jx,jz))continue;
      const ax=jx-c.x,az=jz-c.z,ahead=ax*fx+az*fz,lat=Math.abs(ax*fz-az*fx);
      if(ahead<11||ahead>34||lat>7)continue;
      const mine=Math.hypot(ax,az);let yieldNow=false;
      for(const o of g.cars){
        if(o===c||o.retired)continue;
        const ox=jx-o.x,oz=jz-o.z,od=Math.hypot(ox,oz);if(od>26||od<1)continue;
        const ofx=Math.sin(o.a),ofz=Math.cos(o.a);if((ox*ofx+oz*ofz)<-3)continue; // already past the junction
        if(Math.abs(fx*ofx+fz*ofz)>.6)continue; // same axis, not crossing
        if(od<mine-2||(Math.abs(od-mine)<=2&&o.x+o.z*1.7>c.x+c.z*1.7)){yieldNow=true;break}
      }
      if(yieldNow){
        c._yw=(c._yw||0);
        if((c.speed||0)<.8){c._yw+=1/30}
        if(c._yw<3.5){desired=Math.min(desired,Math.sqrt(Math.max(0,(ahead-14)*4)))}
      }else if(ahead<9){c._yw=0}
    }
    return desired;
  };
}catch(e){console.warn('r14 yield',e)}

// ---------- 5. Rain (key Y or the Rain button) ----------
try{
  const N=1400,pos=new Float32Array(N*6),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));
  const mat=new T.LineBasicMaterial({color:'#bcd2e0',transparent:true,opacity:.45,depthWrite:false});
  const rain=new T.LineSegments(geo,mat);rain.frustumCulled=false;rain.visible=false;scene.add(rain);
  const drops=Array.from({length:N},()=>({x:(Math.random()-.5)*70,y:Math.random()*40,z:(Math.random()-.5)*70,v:30+Math.random()*14}));
  const veil=document.createElement('div');veil.id='rainVeil';document.body.appendChild(veil);
  let on=false,amt=0,last=performance.now();
  const btn=document.createElement('button');btn.id='rainBtn';btn.textContent='Rain';const top=document.getElementById('top');if(top)top.insertBefore(btn,top.querySelector('#menuBtn'));
  const toggle=()=>{on=!on;rain.visible=on||amt>0;btn.classList.toggle('on',on);btn.textContent=on?'Rain: On':'Rain'};
  btn.addEventListener('click',toggle);
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='y'&&!e.repeat&&!/INPUT|SELECT/.test(e.target.tagName))toggle()});
  window.__rain=toggle;
  function tick(){
    const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
    amt+=((on?1:0)-amt)*Math.min(1,dt*1.5);veil.style.opacity=(amt*.22).toFixed(3);mat.opacity=.45*amt;rain.visible=amt>.02;
    if(rain.visible){const cam=g.camera.position;let k=0;for(const d of drops){d.y-=d.v*dt;if(d.y<-2){d.y=38;d.x=(Math.random()-.5)*70;d.z=(Math.random()-.5)*70}
      const x=cam.x+d.x,y=cam.y-8+d.y,z=cam.z+d.z;pos[k++]=x;pos[k++]=y;pos[k++]=z;pos[k++]=x-.15;pos[k++]=y+1.3;pos[k++]=z-.1}
      geo.attributes.position.needsUpdate=true}
    requestAnimationFrame(tick)}
  requestAnimationFrame(tick);
}catch(e){console.warn('r14 rain',e)}

// ---------- 6. Smooth ribbon over the hill road entrance (the box segments leave ragged shards at the corner) ----------
try{
  let pts=[[0,-340],[0,-385],[0,-398],[40,-428],[72,-462]];
  for(let it=0;it<3;it++){const o=[pts[0]];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];o.push([a[0]*.9+b[0]*.1,a[1]*.9+b[1]*.1],[a[0]*.1+b[0]*.9,a[1]*.1+b[1]*.9])}o.push(pts[pts.length-1]);pts=o}
  const ribbon=(off,w,color,raise)=>{
    const v=[],idx=[];
    pts.forEach((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;const nx=tz,nz=-tx;
      for(const sd of [-1,1]){const d=off+sd*w/2,x=p[0]+nx*d,z=p[1]+nz*d;v.push(x,gh(x,z)+raise,z)}
      if(i){const j=i*2;idx.push(j-2,j,j-1,j-1,j,j+1)}});
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();
    const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.95,side:T.DoubleSide}));m.receiveShadow=true;scene.add(m);return m};
  ribbon(0,23,'#4a5256',.62);ribbon(10.6,.35,'#e8e7ce',.66);ribbon(-10.6,.35,'#e8e7ce',.66);
}catch(e){console.warn('r14 hill road',e)}

// ---------- 7. Softer player headlights at night (the spot light was too hot on the road) ----------
try{
  scene.traverse(o=>{if(o.isSpotLight&&o.distance===70&&!o.__r14){o.__r14=1;let v=o.intensity;Object.defineProperty(o,'intensity',{get(){return v*.62},set(x){v=x},configurable:true})}});
}catch(e){console.warn('r14 headlights',e)}

// ---------- 8. Dares (chase and time trial), stunt kickers and map markers ----------
try{
  const JC=[-300,-200,-100,0,100,200,300];
  const hud=document.createElement('div');hud.id='r14hud';hud.style.display='none';document.body.appendChild(hud);
  const chip=document.createElement('button');chip.id='r14chip';chip.textContent='Dares';document.body.appendChild(chip);
  const menu=document.createElement('div');menu.id='r14menu';menu.style.display='none';
  menu.innerHTML='<b>DARES</b><button data-d="chase">Chase: catch the runner</button><button data-d="trial">Time trial: 6 gates</button><button data-d="stop">Stop dare</button>';
  document.body.appendChild(menu);
  const mk3=(geo,col,op)=>new T.Mesh(geo,new T.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,blending:T.AdditiveBlending}));
  // 3D marker over the chase target
  const arrow=new T.Mesh(new T.ConeGeometry(2.2,4.6,4),new T.MeshBasicMaterial({color:'#ff3b2f',depthTest:false,transparent:true,opacity:.95}));arrow.renderOrder=999;arrow.rotation.x=Math.PI;arrow.visible=false;arrow.frustumCulled=false;scene.add(arrow);
  // gates
  const ringGeo=new T.TorusGeometry(7,.55,8,28),beamGeo=new T.CylinderGeometry(6.6,6.6,60,20,1,true);
  const gateMeshes=[];
  for(let i=0;i<2;i++){const grp=new T.Group();const r=mk3(ringGeo,i?'#58d6ff':'#e9fb72',i?.45:.95);r.rotation.x=Math.PI/2;r.position.y=1;const b=mk3(beamGeo,i?'#58d6ff':'#e9fb72',i?.08:.16);b.position.y=30;grp.add(r,b);grp.visible=false;grp.frustumCulled=false;scene.add(grp);gateMeshes.push(grp)}
  // the target runs faster than traffic and ignores yields
  const sig=g.signals,prevDesired=sig.desiredSpeed.bind(sig);
  sig.desiredSpeed=function(c,d){if(c===D.target&&D.kind==='chase')return Math.max(d,16.5);return prevDesired(c,d)};
  const D={kind:null,t:0,target:null,hold:0,gates:[],gi:0,limit:0,last:performance.now(),done:0};
  const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  const coins=(n,why)=>{if(window.R4&&R4.addCoins)R4.addCoins(n,why)};
  const bad=/police|ambulance|fire|swat|tractor|bus|truck|tank/i;
  function startChase(){
    const p=g.player();let best=null;const cand=g.cars.filter(c=>c!==p&&!c.retired&&c.ai!==false&&!c.pursuit&&!c.race&&!c.target&&Math.abs(c.x)<310&&Math.abs(c.z)<310&&!bad.test(String((g.carTypes[c.type]||[])[0]||c.type)));
    cand.sort((a,b)=>Math.abs(Math.hypot(a.x-p.x,a.z-p.z)-150)-Math.abs(Math.hypot(b.x-p.x,b.z-p.z)-150));best=cand[0];
    if(!best){toast('No runner found');return}
    Object.assign(D,{kind:'chase',t:100,target:best,hold:0,limit:100,done:0});best._dare=1;
  }
  function startTrial(){
    const p=g.player();let jx=JC.reduce((a,b)=>Math.abs(b-p.x)<Math.abs(a-p.x)?b:a),jz=JC.reduce((a,b)=>Math.abs(b-p.z)<Math.abs(a-p.z)?b:a);
    const gates=[],used=new Set([jx+','+jz]);
    for(let i=0;i<6;i++){let opts=[];for(const a of JC)for(const b of JC){if(used.has(a+','+b))continue;const d=Math.hypot(a-jx,b-jz);if(d>=95&&d<=230)opts.push([a,b])}
      if(!opts.length)break;const o=opts[Math.floor(rnd()*opts.length)];used.add(o[0]+','+o[1]);jx=o[0];jz=o[1];gates.push({x:jx,z:jz})}
    Object.assign(D,{kind:'trial',gates,gi:0,t:28,limit:28,done:0,target:null});
  }
  function stop(msg){D.kind=null;D.target=null;arrow.visible=false;gateMeshes.forEach(m=>m.visible=false);hud.style.display='none';if(msg)toast(msg)}
  const toast=m=>{const t=document.getElementById('toast');if(t){t.textContent=m;t.style.opacity=1;clearTimeout(toast._t);toast._t=setTimeout(()=>{t.style.opacity=0},2800)}};
  chip.addEventListener('click',()=>{menu.style.display=menu.style.display==='none'?'flex':'none'});
  menu.addEventListener('click',e=>{const d=e.target.dataset&&e.target.dataset.d;if(!d)return;menu.style.display='none';if(d==='chase'){stop();startChase()}else if(d==='trial'){stop();startTrial()}else stop('Dare stopped')});
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='b'&&!e.repeat&&!/INPUT|SELECT/.test(e.target.tagName))menu.style.display=menu.style.display==='none'?'flex':'none'});
  // overlay canvases so the markers sit on both maps
  const ov={};
  const ovFor=id=>{let c=ov[id];const base=document.getElementById(id);if(!base)return null;if(!c){c=document.createElement('canvas');c.style.cssText='position:absolute;pointer-events:none;z-index:3';base.parentNode.appendChild(c);ov[id]=c}
    c.width=base.width;c.height=base.height;c.style.left=base.offsetLeft+'px';c.style.top=base.offsetTop+'px';c.style.width=base.clientWidth+'px';c.style.height=base.clientHeight+'px';return c};
  function drawMaps(){
    for(const id of ['map','bigCanvas']){
      const base=document.getElementById(id);if(!base)continue;
      if(id==='bigCanvas'&&document.getElementById('bigMap').classList.contains('hidden')){if(ov[id])ov[id].style.display='none';continue}
      const c=ovFor(id);if(!c)continue;c.style.display='block';const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
      if(!D.kind)continue;const p=g.player(),big=id==='bigCanvas',span=big?1480:1120,mx0=big?-560:(p.x>400?-90:-560),s=c.width/span,tx=v=>(v-mx0)*s,tz=v=>(v+720)*s;
      const dot=(px,pz,col,r)=>{x.fillStyle=col;x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(tx(px),tz(pz),r,0,7);x.fill();x.stroke()};
      if(D.kind==='chase'&&D.target)dot(D.target.x,D.target.z,'#ff4d3d',big?7:5);
      if(D.kind==='trial')D.gates.forEach((q,i)=>{if(i<D.gi)return;dot(q.x,q.z,i===D.gi?'#e9fb72':'#58d6ff',i===D.gi?(big?8:5.5):(big?4:3))});
    }
  }
  function tick(){
    const now=performance.now(),dt=Math.min(.1,(now-D.last)/1000);D.last=now;const p=g.player();
    if(p&&D.kind&&!g.state().paused){
      D.t-=dt;hud.style.display='block';
      if(D.kind==='chase'){
        const c=D.target;
        if(!c||c.retired){stop('The runner vanished')}
        else{
          const dx=c.x-p.x,dz=c.z-p.z,dist=Math.hypot(dx,dz);
          if(dist<15&&p!==c){D.hold+=dt}else D.hold=Math.max(0,D.hold-dt*.5);
          // keep the runner moving if it gets boxed in
          if((c.speed||0)<1.2){D.stuck=(D.stuck||0)+dt;if(D.stuck>5){D.stuck=0;c.x+=Math.sin(c.a)*10;c.z+=Math.cos(c.a)*10}}else D.stuck=0;
          arrow.visible=true;arrow.position.set(c.x,(c.root?c.root.position.y:gh(c.x,c.z))+5.2+Math.sin(now*.006)*.4,c.z);arrow.rotation.y=now*.004;
          hud.innerHTML='<b>CHASE</b> '+fmt(D.t)+' &bull; '+Math.round(dist)+' m &bull; hold '+Math.min(3,D.hold).toFixed(1)+'/3 s';
          if(D.hold>=3){const n=90+Math.round(D.t)*2;coins(n,'caught the runner');c._dare=0;stop();D.done++}
          else if(D.t<=0){stop('The runner got away');}
        }
      }else if(D.kind==='trial'){
        const q=D.gates[D.gi];
        if(q){
          const dx=p.x-q.x,dz=p.z-q.z,dist=Math.hypot(dx,dz);
          gateMeshes[0].visible=true;gateMeshes[0].position.set(q.x,gh(q.x,q.z)+3,q.z);
          const nx=D.gates[D.gi+1];gateMeshes[1].visible=!!nx;if(nx)gateMeshes[1].position.set(nx.x,gh(nx.x,nx.z)+3,nx.z);
          hud.innerHTML='<b>TIME TRIAL</b> '+fmt(D.t)+' &bull; gate '+(D.gi+1)+'/'+D.gates.length+' &bull; '+Math.round(dist)+' m';
          if(dist<13){D.gi++;D.t+=11;coins(10,'gate '+D.gi);}
          if(D.gi>=D.gates.length){const n=100+Math.round(D.t)*3;coins(n,'time trial clear');stop();D.done++}
          else if(D.t<=0)stop('Time is up');
        }
      }
    }
    drawMaps();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  window.__r14dare={D,startChase,startTrial,stop};

  // stunt kickers: a low ramp in the outer lane that launches a fast car, with the game's own jump reward
  const kick=[];const rm=new T.MeshStandardMaterial({color:'#d9d3b8',roughness:.8}),stripe=new T.MeshStandardMaterial({color:'#e8a32b',emissive:'#a86a00',emissiveIntensity:.35,roughness:.7});
  const spots=[[-250,0,-9,'x'],[150,-100,9,'x'],[-50,200,-9,'x'],[-250,100,9,'z'],[-150,300,-9,'x'],[250,100,9,'z'],[-150,-200,-9,'z'],[50,-300,9,'x']];
  // spots: [position along the road, road coordinate, lane offset, axis]
  for(const [along,road,off,axis] of spots){
    const L=9,W=6,H=1.1,x=axis==='x'?along:road+off,z=axis==='x'?road+off:along;
    const geo=new T.BufferGeometry(),hw=W/2,hl=L/2;
    const v=[-hw,0,-hl, hw,0,-hl, hw,H,-1, -hw,H,-1, -hw,H,1, hw,H,1, hw,0,hl, -hw,0,hl];
    const idx=[0,2,1,0,3,2, 3,4,5,3,5,2, 4,7,6,4,6,5, 0,7,4,0,4,3, 1,5,6,1,2,5, 0,1,6,0,6,7];
    geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();
    const m=new T.Mesh(geo,rm);m.position.set(x,gh(x,z)+.04,z);if(axis==='z')m.rotation.y=Math.PI/2;m.castShadow=m.receiveShadow=true;scene.add(m);
    const st=new T.Mesh(new T.BoxGeometry(W-.4,.06,.5),stripe);st.position.set(0,H+.04,0);m.add(st);
    kick.push({x,z,axis,L,W});
  }
  window.__r14kick=kick;
  function kickOnce(){
    const p=g.player();
    if(p&&!(p.airT>0)){
      for(const k of kick){
        const dx=p.x-k.x,dz=p.z-k.z,al=k.axis==='x'?dx:dz,lat=k.axis==='x'?dz:dx;
        if(Math.abs(lat)<k.W/2+.6&&Math.abs(al)<2.5){
          const v=k.axis==='x'?p.vx:p.vz;if(Math.abs(v)>15){p.airT=.001;p.vy=Math.min(9,3.5+Math.abs(v)*.14);p.airY=gh(p.x,p.z)+.28+.6;break}
        }
      }
    }
  }
  function kickTick(){kickOnce();requestAnimationFrame(kickTick)}
  window.__r14kickNow=kickOnce;
  requestAnimationFrame(kickTick);
}catch(e){console.warn('r14 dares',e)}

// ---------- 2. Stats for the audit harness ----------
window.__r14={rowBuildings:pi};
}
})();
