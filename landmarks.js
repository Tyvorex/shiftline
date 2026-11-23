// Coastal landmarks and roadside safety details, original low-poly geometry.
export function buildCoastAndHill({THREE,scene,groundHeight,box,mat,tree,statics,hillPath,rnd}){
 const wood=mat('#a58863'),rail=mat('#d3c9a4'),steel=mat('#49636b'),stone=mat('#89978d'),darkStone=mat('#657b79'),white=mat('#e9e8dc'),navy=mat('#355568'),ochre=mat('#c69c65'),leaf=mat('#56846c');
 const cube=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o};
 // A coastal retaining cliff, rather than grass ending abruptly over the sea.
 for(const side of [-1,1])for(let z=-345;z<=345;z+=27){const x=side*383,h=Math.max(8,groundHeight(x,z)+5);const rock=new THREE.Mesh(new THREE.CylinderGeometry(11,17,h,5),z%2?stone:darkStone);rock.position.set(x,h/2-5,z);rock.rotation.y=rnd()*3;rock.receiveShadow=true;scene.add(rock)}
 for(let x=-350;x<=350;x+=27){const z=382,h=Math.max(8,groundHeight(x,z)+5);const rock=new THREE.Mesh(new THREE.CylinderGeometry(12,18,h,5),stone);rock.position.set(x,h/2-5,z);rock.rotation.y=rnd()*3;scene.add(rock)}
 const pierX=-250;
 // Small boats moored below the coastal road, correctly sitting on sea level.
 for(let i=0;i<4;i++){const x=pierX+(i%2?16:-16),z=389+Math.floor(i/2)*18;const hull=new THREE.Mesh(new THREE.CylinderGeometry(3.4,1.8,1.4,4),i%2?navy:white);hull.scale.set(.68,1,1.9);hull.rotation.y=Math.PI/4;hull.position.set(x,-4.2,z);scene.add(hull);cube(2,.8,3,white,x,-3.2,z);cube(1.5,.5,1.4,navy,x,-2.6,z);cube(.12,4,.12,steel,x,-1.4,z)}
 // Bus shelters at the coast: seat, back panel and sensible roof height.
 for(const x of [-145,145]){const z=365,y=groundHeight(x,z);for(const dx of [-2.4,2.4])cube(.16,2.7,.16,steel,x+dx,y+1.65,z);cube(5.8,.18,2.4,navy,x,y+3,z);cube(5,1.8,.12,steel,x,y+1.6,z+.8);cube(4,.17,.7,wood,x,y+1,z+.2);for(const dx of [-1.6,1.6])cube(.15,.8,.6,steel,x+dx,y+.6,z+.2)}
 // Guardrails protect exposed bends. Gaps around villa driveways and at junctions remain open.
 function railing(a,b,side){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=dz/len*side,nz=-dx/len*side;for(let t=6;t<len-5;t+=5){const x=a[0]+dx*t/len+nx*9.3,z=a[1]+dz*t/len+nz*9.3;box(.18,1.2,.18,steel,x,.6,z);const ax=x-dx/len*2.5,az=z-dz/len*2.5,bx=x+dx/len*2.5,bz=z+dz/len*2.5;const va=new THREE.Vector3(ax,groundHeight(ax,az)+1.05,az),vb=new THREE.Vector3(bx,groundHeight(bx,bz)+1.05,bz),delta=vb.clone().sub(va);const r=new THREE.Mesh(new THREE.BoxGeometry(.18,.26,delta.length()),rail);r.position.copy(va).add(vb).multiplyScalar(.5);r.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.normalize());r.castShadow=true;scene.add(r)}}
 for(let i=2;i<hillPath.length;i++)if(![4,7].includes(i))railing(hillPath[i-1],hillPath[i],i%2?1:-1);
 // Summit viewpoint oriented toward the city, with a safe perimeter and telescope.
 const y=groundHeight(12,-650);for(let x=-3;x<=27;x+=5){box(.15,1.2,.15,steel,x,.6,-668);box(5.1,.18,.15,rail,x,1.1,-668)}
 const stand=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,1.4,8),steel);stand.position.set(12,y+.9,-663);scene.add(stand);const scope=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,.9,10),navy);scope.rotation.x=Math.PI*.43;scope.position.set(12,y+1.7,-663);scene.add(scope);
 // A billboard-free hillside forest fills unused terrain without blocking the climb.
 for(let i=0;i<90;i++){const x=(rnd()-.5)*370,z=-410-rnd()*300;if(Math.abs(x)<110)continue;const h=5+rnd()*5;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,h*.45,6),wood);trunk.position.set(x,groundHeight(x,z)+h*.225,z);scene.add(trunk);for(let k=0;k<2;k++){const crown=new THREE.Mesh(new THREE.ConeGeometry(h*.3*(1-k*.2),h*.7,7),leaf);crown.position.set(x,groundHeight(x,z)+h*(.6+k*.2),z);crown.castShadow=true;scene.add(crown)}}
}
