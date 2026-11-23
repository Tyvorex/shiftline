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
 for(const px of [-1,5])cube(.13,.035,8,yellow,px,.255,0);for(const pz of [-4,4])cube(6,.035,.13,yellow,2,.255,pz);
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
 // Traffic signal standards: one pole on each corner, readable from the road.
 const red=mat('#6b312b'),amber=mat('#bd7b2d'),green=mat('#65c4a8');
 for(const x of [-200,0,200])for(const z of [-200,0,200])for(const side of [-1,1]){
  const px=x+side*13,pz=z+side*13;box(.2,5.2,.2,metal,px,2.6,pz);box(1,.0+2,.55,metal,px,4.4,pz);
  for(let k=0;k<3;k++){const lamp=new THREE.Mesh(new THREE.CircleGeometry(.22,10),[red,amber,green][k]);lamp.position.set(px,groundHeight(px,pz)+5-k*.6,pz-side*.29);lamp.rotation.y=side===1?Math.PI:0;scene.add(lamp)}
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
export function createDrivingEffects(){return null}
