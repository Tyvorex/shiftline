// Collision damage is per vehicle and persists while it stays in this city session.
export function createDamageSystem({THREE,scene,groundHeight}){
 const overlay=document.createElement('div');overlay.id='damageFlash';document.body.append(overlay);
 const meter=document.createElement('div');meter.id='condition';meter.innerHTML='<div><span>BODY CONDITION</span><b id="healthNum">100%</b></div><div class="healthTrack"><i id="healthFill"></i></div><small id="healthHint">READY TO DRIVE</small>';document.getElementById('speed').append(meter);
 const particles=[];const smokeMat=new THREE.MeshBasicMaterial({color:'#454d4e',transparent:true,opacity:.2,depthWrite:false});
 for(let i=0;i<18;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.35,0),smokeMat.clone());m.visible=false;scene.add(m);particles.push({m,age:5,life:2})}
 const sparks=[];for(let i=0;i<16;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.035,.035,.35),new THREE.MeshBasicMaterial({color:'#ffe39b'}));m.visible=false;scene.add(m);sparks.push({m,age:2,v:new THREE.Vector3()})}
 let puff=0,pi=0,flash=0,impactAt=0;
 function prepare(c){if(c.damageReady)return;c.damageReady=true;c.health=100;c.damageCooldown=0;c.dents=[];c.damageMeshes=[];
 // ROUND 13: tevy.dev models use KHR_mesh_quantization (normalized int16 positions,
 // sometimes interleaved) with dequantize transforms on the nodes. Writing dents
 // straight into those buffers collapsed cars into giant shards. So each body mesh
 // is rebuilt once here: vertices are read de-normalized, baked into model space as
 // plain Float32, and the mesh is re-parented flat under c.model with an identity
 // transform. Wheels keep their steering/spin pivots.
 c.root.updateMatrixWorld(true);const invRoot=new THREE.Matrix4().copy(c.model.matrixWorld).invert(),rel=new THREE.Matrix4(),v=new THREE.Vector3(),meshes=[];
 c.model.traverse(o=>{if(!o.isMesh||o.name.includes('wheel')||o.parent?.name?.includes('wheel'))return;if(!o.geometry?.attributes.position)return;meshes.push(o)});
 for(const o of meshes){rel.copy(o.matrixWorld).premultiply(invRoot);const src=o.geometry,pa=src.attributes.position,f=new Float32Array(pa.count*3);for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(rel);f[i*3]=v.x;f[i*3+1]=v.y;f[i*3+2]=v.z}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(f,3));
 for(const name of Object.keys(src.attributes)){if(name==='position'||name==='normal')continue;const a=src.attributes[name],n=a.itemSize,out=new Float32Array(a.count*n);for(let i=0;i<a.count;i++){out[i*n]=a.getX(i);if(n>1)out[i*n+1]=a.getY(i);if(n>2)out[i*n+2]=a.getZ(i);if(n>3)out[i*n+3]=a.getW(i)}g.setAttribute(name,new THREE.BufferAttribute(out,n))}
 if(src.index)g.setIndex(src.index);o.geometry=g;c.model.add(o);o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.updateMatrix();o.userData.originalPositions=new Float32Array(f);g.computeBoundingBox();o.userData.damageBounds=g.boundingBox.clone();g.computeVertexNormals();c.damageMeshes.push(o)}
 const cb=new THREE.Box3();for(const o of c.damageMeshes)cb.union(o.userData.damageBounds);if(c.damageMeshes.length)c.damageBounds=cb;
 }
 function hit(c,strength,normal,controlled){prepare(c);if(strength<3.5||c.damageCooldown>0)return 0;c.damageCooldown=.28;const loss=Math.min(48,(strength-2.8)*1.65);c.health=Math.max(0,c.health-loss);
 const amount=1-c.health/100;
 if(normal){const fx=Math.sin(c.a),fz=Math.cos(c.a);const px=normal.px??(c.x+(normal.x||0)*c.length*.45),pz=normal.pz??(c.z+(normal.z||0)*c.length*.45);const ox=px-c.x,oz=pz-c.z;const lz=ox*fx+oz*fz,lx=ox*fz-oz*fx;const dxl=-(normal.x||0),dzl=-(normal.z||0);c.dents.push({lx,lz,dx:dxl*fz-dzl*fx,dz:dxl*fx+dzl*fz,s:Math.min(1,(strength-2.5)/16),sd:Math.random()*100,ex:.65+Math.random()*.9,ez:.65+Math.random()*.9,skew:(Math.random()-.5)*.9});if(c.dents.length>8)c.dents.shift()}
 const bounds=c.damageBounds||c.damageMeshes[0]?.userData.damageBounds||new THREE.Box3();for(const mesh of c.damageMeshes){const a=mesh.geometry.attributes.position,orig=mesh.userData.originalPositions;const min=bounds.min,max=bounds.max;const length=Math.max(.1,max.z-min.z),width=Math.max(.1,max.x-min.x),mid=(min.z+max.z)/2,midx=(min.x+max.x)/2;for(let i=0;i<a.count;i++){let x=orig[i*3],y=orig[i*3+1],z=orig[i*3+2];const edge=Math.pow(Math.abs(z-mid)/(length*.5),4);const ripple=Math.sin(x*12.31+z*7.11+y*4.2)*.012*amount;x=x*(1-.22*amount*edge)+ripple;y=y*(1-.16*amount*edge);z=mid+(z-mid)*(1-.34*amount*edge);for(const d of c.dents){const ddx=x-midx-d.lx,ddz=z-mid-d.lz;const fall=Math.exp(-(ddx*ddx*d.ex+ddz*ddz*d.ez+ddx*ddz*d.skew)/(width*.55))*(0.72+0.38*Math.sin(x*8.7+d.sd)*Math.cos(z*6.3+d.sd*1.7));if(fall<.02)continue;const depth=d.s*(.42+.3*Math.sin(d.sd*3.3))*fall;x+=d.dx*depth;z+=d.dz*depth;y-=depth*(.2+.3*Math.abs(Math.sin(d.sd)))}a.setXYZ(i,x,y,z)}a.needsUpdate=true;mesh.geometry.computeVertexNormals()}
 if(controlled){flash=Math.min(.5,.12+strength*.012);impactAt=performance.now();for(let i=0;i<sparks.length;i++){const q=sparks[i];q.age=0;q.m.position.set(c.x+(normal?.x||0)*1.4,groundHeight(c.x,c.z)+.8,c.z+(normal?.z||0)*1.4);q.v.set((Math.random()-.5)*6,2+Math.random()*4,(Math.random()-.5)*6);q.m.rotation.set(Math.random()*3,Math.random()*3,0);q.m.visible=true}}
 return loss;
 }
 function repair(c){prepare(c);c.health=100;c.damageCooldown=0;c.dents=[];for(const mesh of c.damageMeshes){mesh.geometry.attributes.position.array.set(mesh.userData.originalPositions);mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.computeVertexNormals()}}
 return{prepare,hit,repair,update(c,cars,dt,time){for(const a of cars){if(a.damageCooldown>0)a.damageCooldown=Math.max(0,a.damageCooldown-dt)}if(!c)return;prepare(c);flash=Math.max(0,flash-dt*.9);overlay.style.opacity=flash;const n=Math.round(c.health);document.getElementById('healthNum').textContent=n+'%';const fill=document.getElementById('healthFill');fill.style.width=n+'%';fill.style.background=n<25?'#ff695e':n<60?'#f2c05c':'#9ee3ba';document.getElementById('healthHint').textContent=n===0?'ENGINE DISABLED / SHIFT OR REPAIR':n<30?'HEAVY DAMAGE / SERVICE ADVISED':n<75?'BODY DAMAGED / VISIT SERVICE':'READY TO DRIVE';
 puff+=dt;if(c.health<45&&puff>.16){puff=0;const q=particles[pi++%particles.length];q.age=0;q.life=c.health<15?2.7:1.8;q.m.position.set(c.x+Math.sin(c.a)*c.length*.32,groundHeight(c.x,c.z)+1.3,c.z+Math.cos(c.a)*c.length*.32)}
 for(const q of particles){q.age+=dt;q.m.visible=q.age<q.life;if(q.m.visible){q.m.position.y+=dt*1.2;q.m.position.x+=dt*.35;q.m.scale.setScalar(.5+q.age*1.3);q.m.material.opacity=(1-q.age/q.life)*.4}}
 for(const q of sparks){q.age+=dt;q.m.visible=q.age<.45;if(q.m.visible){q.v.y-=dt*9;q.m.position.addScaledVector(q.v,dt)}}
 },shake(){return flash>0?Math.sin(performance.now()*.09)*flash*.12:0}}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   }
