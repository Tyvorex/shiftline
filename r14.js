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

// ---------- 2. Stats for the audit harness ----------
window.__r14={rowBuildings:pi};
}
})();
