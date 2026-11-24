// Road graph shared by the map route and the next-turn display.
export function createNavigation({THREE,scene,groundHeight,coords,hillRoute}){
 const lines=[-350,...coords,350],nodes=[],index=new Map(),edges=[];
 function node(x,z){const k=x+','+z;if(index.has(k))return index.get(k);const i=nodes.length;nodes.push({x,z});edges.push([]);index.set(k,i);return i}
 function link(a,b){if(a===b)return;const pa=nodes[a],pb=nodes[b],d=Math.hypot(pa.x-pb.x,pa.z-pb.z);edges[a].push({to:b,cost:d});edges[b].push({to:a,cost:d})}
 for(const x of lines)for(const z of lines)node(x,z);
 for(let i=0;i<lines.length;i++)for(let j=0;j<lines.length;j++){if(i)link(node(lines[i],lines[j]),node(lines[i-1],lines[j]));if(j)link(node(lines[i],lines[j]),node(lines[i],lines[j-1]))}
 let prev=node(0,-350);for(const p of hillRoute){const next=node(p.x,p.z);link(prev,next);prev=next}
 {const IX=[600,720,840],IZ=[-120,0,120];for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(i)link(node(IX[i],IZ[j]),node(IX[i-1],IZ[j]));if(j)link(node(IX[i],IZ[j]),node(IX[i],IZ[j-1]))}link(node(350,0),node(600,0))}
 function nearest(p){let best=0,score=Infinity;nodes.forEach((n,i)=>{const d=Math.hypot(n.x-p.x,n.z-p.z);if(d<score){score=d;best=i}});return best}
 function attachment(p){let best=null,score=Infinity;for(let a=0;a<nodes.length;a++)for(const e of edges[a]){if(e.to<a)continue;const u=nodes[a],v=nodes[e.to],dx=v.x-u.x,dz=v.z-u.z,l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((p.x-u.x)*dx+(p.z-u.z)*dz)/l));const q={x:u.x+dx*t,z:u.z+dz*t},off=Math.hypot(p.x-q.x,p.z-q.z);if(off<score){score=off;best={a,b:e.to,q,off,t,len:Math.sqrt(l)}}}return best}
 function solve(from,to){const A=attachment(from),B=attachment(to);if(!A||!B)return[from,to];if(A.a===B.a&&A.b===B.b)return[from,A.q,B.q,to];
 const d=nodes.map(()=>Infinity),parent=nodes.map(()=>-1),open=new Set(nodes.map((_,i)=>i));d[A.a]=A.t*A.len;d[A.b]=(1-A.t)*A.len;
 while(open.size){let u=-1,v=Infinity;for(const i of open)if(d[i]<v){v=d[i];u=i}if(u<0)break;open.delete(u);for(const e of edges[u])if(d[u]+e.cost<d[e.to]){d[e.to]=d[u]+e.cost;parent[e.to]=u}}
 const b=d[B.a]+B.t*B.len<d[B.b]+(1-B.t)*B.len?B.a:B.b,out=[];let cur=b;while(cur>=0){out.unshift(nodes[cur]);cur=parent[cur]}
 const route=[{x:from.x,z:from.z},A.q,...out,B.q,{x:to.x,z:to.z}];return route.filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.z-a[i-1].z)>3)
 }
 const hud=document.createElement('div');hud.id='navigation';hud.innerHTML='<span id="navArrow">↑</span><div><b id="navDistance">FREE DRIVE</b><small id="navInstruction">Pick a job or map destination</small></div>';document.body.append(hud);
 let targetKey='',route=[],tick=0,total=0;const next=new THREE.Vector3();
 return{solve,getRoute(){return route},update(c,dest,dt){if(!c)return;tick-=dt;if(!dest){route=[];targetKey='';hud.classList.remove('active');document.getElementById('navDistance').textContent='FREE DRIVE';document.getElementById('navInstruction').textContent='J / Jobs     M / Map';return}hud.classList.add('active');const k=Math.round(dest.x/5)+','+Math.round(dest.z/5);if(k!==targetKey||tick<=0){route=solve(c,dest);targetKey=k;tick=.8;total=route.reduce((n,p,i)=>i?n+Math.hypot(p.x-route[i-1].x,p.z-route[i-1].z):n,0)}
 let aim=route.find(p=>Math.hypot(p.x-c.x,p.z-c.z)>17)||dest;const bearing=Math.atan2(aim.x-c.x,aim.z-c.z)-c.a,ang=Math.atan2(Math.sin(bearing),Math.cos(bearing));document.getElementById('navArrow').style.transform='rotate('+(-ang*180/Math.PI)+'deg)';document.getElementById('navDistance').textContent=total>=1000?(total/1000).toFixed(1)+' KM':Math.round(total)+' M';document.getElementById('navInstruction').textContent=Math.abs(ang)>2.4?'Turn around when safe':ang>.5?'Take the next left':ang<-.5?'Take the next right':'Continue along this road'
 }}
}
