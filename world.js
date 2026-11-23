// Original procedural scenery. Metres throughout; no additional asset downloads.
export function createServiceStation({THREE,scene,groundHeight,statics,x,z,index}){
 const g=new THREE.Group(),m=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...extra});
 const white=m('#e7ece1'),navy=m('#173b48'),cyan=m('#38c9cc'),metal=m('#63777b'),glass=m('#315765',{metalness:.25,roughness:.2}),yellow=m('#e9db81');
 function cube(w,h,d,material,px,py,pz,solid=false){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(px,py,pz);o.castShadow=o.receiveShadow=true;g.add(o);if(solid)statics.push({x:x+px,z:z+pz,hx:w/2,hz:d/2});return o}
 const base=groundHeight(x,z);g.position.set(x,base,z);scene.add(g);
 // A level forecourt, off the live street. Columns leave a 6 m clear drive-through bay.
 cube(11,4.4,9,navy,-12,2.4,-5,true);cube(10.8,.45,9.6,white,-12,4.8,-5);
 cube(7,2.2,.12,glass,-12,2.8,-.43);cube(1.6,2.8,.14,cyan,-8.2,1.7,-.34);
 cube(18,.55,13,white,1,6.2,0);cube(18.1,.3,13.1,cyan,1,5.85,0);
 for(const px of [-6,8])for(const pz of [-5,5])cube(.4,5.6,.4,navy,px,3,pz,true);
 // Service dispensers sit on an island beside, not in, the stop bay.
 cube(2,.25,6.4,white,-3,.4,0);
 for(const pz of [-1.9,1.9]){cube(.85,1.8,.7,white,-3,1.4,pz,true);cube(.7,.5,.74,navy,-3,1.8,pz);cube(.25,.5,.18,cyan,-2.54,1.4,pz);const hose=new THREE.Mesh(new THREE.TorusGeometry(.35,.045,5,14,Math.PI*1.6),navy);hose.position.set(-2.47,1.15,pz);hose.rotation.y=Math.PI/2;g.add(hose)}
 // Crisp painted parking rectangle, flush with forecourt.
 for(const px of [-1,5])cube(.13,.035,8,yellow,px,.39,0);for(const pz of [-4,4])cube(6,.035,.13,yellow,2,.39,pz);
 const ring=new THREE.Group();g.add(ring);
 // Legible real-world sign, not a giant floating emoji.
 const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const ctx=cv.getContext('2d');ctx.fillStyle='#173b48';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#38c9cc';ctx.fillRect(0,226,1024,30);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 94px Arial';ctx.fillText('SHIFT / SERVICE',512,110);ctx.font='42px Arial';ctx.fillStyle='#daeeb6';ctx.fillText('RARE RIDES   /   '+String(index+1).padStart(2,'0'),512,185);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(12,3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide}));sign.position.set(1,6.7,6.62);g.add(sign);const back=sign.clone();back.rotation.y=Math.PI;back.position.z-=.03;g.add(back);
 for(const px of [-17,-8])cube(.22,1.1,.22,yellow,px,.7,1,true);
 return{ring,sign,root:g};
}
export function buildWorldDetails({THREE,scene,mat,box,tree,groundHeight,statics,blocks,serviceLots,coords,rnd}){
 const timber=mat('#a07b50'),metal=mat('#38515b'),cream=mat('#ede2bb'),teal=mat('#388b8d'),terracotta=mat('#b87960');
 function label(text,x,z,y=3,angle=0,w=8,color='#214b55',small='MERIDIAN CITY'){
  const cv=document.createElement('canvas');cv.width=1024;cv.height=320;const c=cv.getContext('2d');c.fillStyle=color;c.fillRect(0,0,1024,320);c.strokeStyle='#d8e9cf';c.lineWidth=14;c.strokeRect(18,18,988,284);c.fillStyle='#f4f0d6';c.textAlign='center';c.font='bold 82px Arial';c.fillText(text,512,160);c.font='32px Arial';c.fillText(small,512,235);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.3125),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide}));m.position.set(x,groundHeight(x,z)+y,z);m.rotation.y=angle;scene.add(m);return m;
 }
 function bench(x,z,a=0){const g=new THREE.Group();function part(w,h,d,m,xx,yy,zz){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(xx,yy,zz);q.castShadow=true;g.add(q)}for(const z1 of [-.34,0,.34])part(3,.12,.26,timber,0,.9,z1);part(3,.65,.12,timber,0,1.35,.47);for(const x1 of [-1.1,1.1])part(.13,.9,.8,metal,x1,.45,0);g.position.set(x,groundHeight(x,z)+.4,z);g.rotation.y=a;scene.add(g);statics.push({x,z,hx:1.5,hz:.6})}
 // Urban street furniture belongs to sidewalks, never the car lanes.
 for(const v of [-300,-100,100,300])for(const z of [-235,-35,165]){
  box(.18,2.9,.18,metal,v+12.7,1.45,z);
  label(v<0?'GARDEN AVE':'MERIDIAN AVE',v+12.7,z,3.1,Math.PI/2,4,'#255d59','CITY ROUTE '+(v+400)/100);
  const bin=new THREE.Mesh(new THREE.CylinderGeometry(.35,.32,.9,8),metal);bin.position.set(v+14.5,groundHeight(v+14.5,z+5)+.85,z+5);bin.castShadow=true;scene.add(bin);
 }
 // Cafes have tables, chairs, shade, and room to walk between them.
 for(const b of blocks.filter(v=>v.park)){
  const x=b.x-17,z=b.z-16;
  for(let i=0;i<3;i++){const px=x+(i%2)*9,pz=z+Math.floor(i/2)*10;box(.16,3.8,.16,metal,px,2.2,pz);const top=new THREE.Mesh(new THREE.ConeGeometry(3,1,8),i%2?teal:cream);top.position.set(px,groundHeight(px,pz)+4.3,pz);top.castShadow=true;scene.add(top);const table=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.12,16),timber);table.position.set(px,groundHeight(px,pz)+1.2,pz);scene.add(table);for(const a of [-1,1]){box(.9,.12,.9,timber,px+a*2,.8,pz);for(const xx of [-.3,.3])box(.1,.7,.1,metal,px+a*2+xx,.4,pz)}statics.push({x:px,z:pz,hx:1.3,hz:1.3})}
  bench(b.x+10,b.z+19);bench(b.x+22,b.z+19);label('GARDEN COMMON',b.x,b.z-32,2.4,0,9,'#315c4d','WALK / REST / REPEAT');
 }
 label('GOLDEN HILL',-13,-391,4,0,9,'#7d6d42','SCENIC ROUTE   /   40 KM/H');
 for(const [x,z,a] of [[14,-394,0],[81,-493,-.4],[-77,-616,.5]]){
  box(.15,3,.15,metal,x,1.5,z);label('SLOW / BENDS',x,z,3.1,a,4,'#a27c39','KEEP RIGHT');
 }
 label('THE ROW',313,113,3.2,Math.PI,8,'#655548','WAREHOUSE / RESIDENTIAL');
 // Coastal edge: small planters, benches facing the sea and regular railing gaps.
 for(let x=-325;x<=325;x+=26){bench(x,365,Math.PI);if(Math.abs(x)%52<27)tree(x+7,365)}
 for(let x=-340;x<340;x+=12){box(10,.12,.15,metal,x,1.7,372);for(const dx of [-4.7,4.7])box(.12,1.7,.12,metal,x+dx,.85,372)}
 // Terrace stone walls follow the hill. Vertical foundations meet the actual terrain.
 for(const [x,z] of [[-20,-430],[93,-473],[-74,-581]]){box(15,1.1,.45,cream,x,.55,z);for(let dx=-6;dx<=6;dx+=6)box(.8,1.4,.8,cream,x+dx,.7,z)}
 // Parking bays on each lot are sized for 5 m cars, not decoration over live traffic.
 for(const [x,z] of serviceLots)for(let dz=-12;dz<=12;dz+=6){box(7,.035,.12,cream,x-18,.46,z+dz)}
}

export function createDrivingEffects({THREE,scene,groundHeight}){
 const capacity=180,positions=new Float32Array(capacity*18),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const material=new THREE.MeshBasicMaterial({color:'#263033',transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(geo,material);mesh.frustumCulled=false;scene.add(mesh);let cursor=0,last=null,timer=0;
 const dust=[];const dustMat=new THREE.MeshBasicMaterial({color:'#c1b5a0',transparent:true,opacity:.25,depthWrite:false});for(let i=0;i<16;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,0),dustMat.clone());m.visible=false;scene.add(m);dust.push({m,age:2})}let di=0;
 const hud=document.createElement('div');hud.id='drivingFeel';document.body.append(hud);let shown=0;
 function wheelPoint(c,side){const fx=Math.sin(c.a),fz=Math.cos(c.a);return{x:c.x-fx*c.length*.28+fz*c.width*.38*side,z:c.z-fz*c.length*.28-fx*c.width*.38*side}}
 return{update(c,keys,dt,time){if(!c)return;timer+=dt;const sliding=!!keys[' ']&&c.speed>7&&Math.abs(c.steer)>.07;if(dt>0&&sliding&&timer>.045){timer=0;const now=[wheelPoint(c,-1),wheelPoint(c,1)];if(last&&last.car===c&&Math.hypot(last.p[0].x-now[0].x,last.p[0].z-now[0].z)<7){for(let k=0;k<2;k++){const a=last.p[k],b=now[k],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,ox=dz/l*.12,oz=-dx/l*.12;const pts=[[a.x-ox,a.z-oz],[a.x+ox,a.z+oz],[b.x+ox,b.z+oz],[a.x-ox,a.z-oz],[b.x+ox,b.z+oz],[b.x-ox,b.z-oz]];for(let j=0;j<6;j++){positions[cursor*18+j*3]=pts[j][0];positions[cursor*18+j*3+1]=groundHeight(...pts[j])+.27;positions[cursor*18+j*3+2]=pts[j][1]}cursor=(cursor+1)%capacity}geo.attributes.position.needsUpdate=true}
 last={car:c,p:now};const d=dust[di++%dust.length];d.age=0;d.m.position.set(now[di%2].x,groundHeight(c.x,c.z)+.6,now[di%2].z);d.m.visible=true;
 shown=Math.min(1,shown+dt*3)
 }else if(!sliding){last=null;shown=Math.max(0,shown-dt*2)}
 for(const d of dust){d.age+=dt;d.m.visible=d.age<.8;if(d.m.visible){d.m.position.y+=dt*.8;d.m.scale.setScalar(1+d.age*5);d.m.material.opacity=(1-d.age/.8)*.25}}
 hud.textContent=sliding?'HANDBRAKE / SLIDE':'';hud.style.opacity=shown;
 }}
}
