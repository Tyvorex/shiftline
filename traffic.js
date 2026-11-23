export function createTrafficSignals({THREE,scene,groundHeight}){
 const nodes=[],junctions=[];const poleMat=new THREE.MeshStandardMaterial({color:'#3d5159',roughness:.9}),caseMat=new THREE.MeshStandardMaterial({color:'#1f3038'});const colors=['#fc7864','#f4c86c','#8de0b5'];
 for(const x of [-200,0,200])for(const z of [-200,0,200]){junctions.push({x,z});for(const axis of ['x','z'])for(const side of [-1,1]){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);scene.add(g);const px=axis==='z'?side*12.5:-side*14,pz=axis==='z'?-side*14:side*12.5;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.17,5.1,7),poleMat);pole.position.set(px,2.55,pz);g.add(pole);
  const arm=new THREE.Group();arm.position.set(px,4.4,pz);arm.rotation.y=axis==='z'?(side===1?Math.PI:0):(side===1?-Math.PI/2:Math.PI/2);g.add(arm);const housing=new THREE.Mesh(new THREE.BoxGeometry(.8,1.9,.5),caseMat);arm.add(housing);const lamps=[];
  for(let i=0;i<3;i++){const mat=new THREE.MeshStandardMaterial({color:'#344047',emissive:colors[i],emissiveIntensity:0});const q=new THREE.Mesh(new THREE.CircleGeometry(.21,12),mat);q.position.set(0,.58-i*.58,.26);arm.add(q);lamps.push(mat)}nodes.push({axis,lamps})
 }}
 let clock=0;function phase(){const t=clock%22;return t<9?{axis:'z',color:2}:t<11?{axis:'z',color:1}:t<20?{axis:'x',color:2}:{axis:'x',color:1}}
 return{update(dt){clock+=dt;const p=phase();for(const n of nodes){const active=n.axis===p.axis?p.color:0;n.lamps.forEach((m,i)=>{m.color.set(i===active?colors[i]:'#26363b');m.emissiveIntensity=i===active?.7:0})}},desiredSpeed(c,desired){if(c.race||c.chaser||c.target||c._hold)return desired;const fx=Math.sin(c.a),fz=Math.cos(c.a),axis=Math.abs(fx)>.8?'x':Math.abs(fz)>.8?'z':null;if(!axis)return desired;const p=phase();if(axis===p.axis&&p.color===2)return desired;
 for(const j of junctions){const ax=j.x-c.x,az=j.z-c.z,ahead=ax*fx+az*fz,lateral=Math.abs(ax*fz-az*fx);if(ahead>11&&ahead<37&&lateral<7){const stopping=ahead-15;desired=Math.min(desired,Math.sqrt(Math.max(0,stopping*5)))} }return desired},state(){return{clock,...phase()}}}
}
