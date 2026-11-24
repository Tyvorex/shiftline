// ROUND 12: Harbor Industrial Island. A second island east of the city, linked by a cable-stayed bridge.
// Everything is procedural (no downloads). Geometry is merged per material to keep draw calls low.
export const ISL={H:25.3,x0:574,x1:866,z0:-150,z1:150,XL:[600,720,840],ZL:[-120,0,120],bridgeX0:361,bridgeX1:574};

export function buildIsland({THREE,scene,groundHeight,statics,rnd,flickers,mergeGeometries}){
 const H=ISL.H,G=H+.2,R=H+.32,XL=ISL.XL,ZL=ISL.ZL;
 const buckets=new Map(),extras=[],anim={smoke:[],trolley:null,flame:null};
 // ---------- textures ----------
 function tex(size,draw){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
 const speck=(g,s,n,light)=>{for(let i=0;i<n;i++){const v=Math.floor(light?150+rnd()*90:20+rnd()*60);g.fillStyle='rgba('+v+','+v+','+v+','+(.05+rnd()*.12)+')';g.fillRect(rnd()*s,rnd()*s,1+rnd()*2,1+rnd()*2)}};
 const asphaltTex=tex(256,(g,s)=>{g.fillStyle='#5a6065';g.fillRect(0,0,s,s);speck(g,s,2600,true);speck(g,s,1800,false);g.strokeStyle='rgba(20,22,24,.5)';g.lineWidth=1;for(let i=0;i<6;i++){g.beginPath();let x=rnd()*s,y=rnd()*s;g.moveTo(x,y);for(let k=0;k<5;k++){x+=(rnd()-.5)*50;y+=(rnd()-.5)*50;g.lineTo(x,y)}g.stroke()}});
 const concreteTex=tex(256,(g,s)=>{g.fillStyle='#b4b5b0';g.fillRect(0,0,s,s);speck(g,s,3000,true);speck(g,s,1500,false);g.strokeStyle='rgba(60,62,60,.55)';g.lineWidth=2;g.strokeRect(0,0,s,s);for(let i=0;i<4;i++){g.fillStyle='rgba(60,50,40,.12)';g.beginPath();g.ellipse(rnd()*s,rnd()*s,8+rnd()*26,5+rnd()*14,rnd()*3,0,7);g.fill()}});
 const ribTex=tex(256,(g,s)=>{for(let i=0;i<16;i++){g.fillStyle=i%2?'#cfcfcf':'#ffffff';g.fillRect(i*s/16,0,s/16,s)}g.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<500;i++)g.fillRect(rnd()*s,rnd()*s,1,1+rnd()*5)});
 const hazardTex=tex(128,(g,s)=>{g.fillStyle='#f0c020';g.fillRect(0,0,s,s);g.fillStyle='#1b1b1b';for(let i=-2;i<4;i++){g.beginPath();g.moveTo(i*s/2,s);g.lineTo(i*s/2+s/4,s);g.lineTo(i*s/2+s/4+s,0);g.lineTo(i*s/2+s,0);g.fill()}});
 const M=(c,r=.8,m=0,x={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,...x});
 const MT=(map,tile,c='#ffffff',r=.85,m=0,x={})=>{const q=M(c,r,m,{map,...x});q.userData.tile=tile;return q};
 const asphalt=MT(asphaltTex,6,'#ffffff',.95),concrete=MT(concreteTex,8,'#d6d7d2',.9),darkConc=MT(concreteTex,8,'#8d8f8e',.95);
 const cladBlue=MT(ribTex,3,'#6f8a99',.7,.25),cladGrey=MT(ribTex,3,'#9aa3a6',.7,.25),cladWhite=MT(ribTex,3,'#e1e1dc',.7,.2),cladRust=MT(ribTex,3,'#a45a40',.8,.2),cladGreen=MT(ribTex,3,'#56796a',.7,.2),cladSand=MT(ribTex,3,'#c9b98e',.8,.15);
 const hazard=MT(hazardTex,4,'#ffffff',.7),contMat=MT(ribTex,1.4,'#ffffff',.6,.25,{vertexColors:true});
 const rock=M('#5f6b6b',1),rockDark=M('#4a5555',1),brick=M('#8d5a47',.9),steel=M('#6b777c',.55,.6),steelDark=M('#3d474c',.6,.6),yellow=M('#e8c437',.7),white=M('#ecebe6',.7),red=M('#c0392b',.7),glass=M('#27424f',.12,.7),roof=M('#8a9397',.8,.3),rustM=M('#8a4b32',.9,.2),pipeRed=M('#b9382c',.5,.4),pipeBlue=M('#2f5f8f',.5,.4),pipeGrey=M('#9aa2a5',.5,.5),pipeYellow=M('#d9aa2c',.5,.4),pylonM=M('#7d878c',.6,.5);
 const lampHead=M('#fff1c2',.4,0,{emissive:'#ffe9a8',emissiveIntensity:1.1}),doorM=M('#2c3236',.8,.3),tankA=M('#e6e4dc',.55,.3),tankB=M('#d6d0bd',.55,.3),tankC=M('#a9b8bc',.55,.3),tankD=M('#c9cfcd',.55,.3);
 const tower=M('#c4c2ba',.95,0,{side:THREE.DoubleSide});
 // ---------- merge helpers ----------
 function tileUV(geo,tile){const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let u,v;if(ay>=ax&&ay>=az){u=p.getX(i);v=p.getZ(i)}else if(ax>=az){u=p.getZ(i);v=p.getY(i)}else{u=p.getX(i);v=p.getY(i)}uv.setXY(i,u/tile,v/tile)}}
 const _e=new THREE.Euler(),_m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
 function add(mat,geo,x,y,z,o={}){
  if(mat.map&&mat.userData.tile)tileUV(geo,mat.userData.tile);
  if(mat.vertexColors){const c=new THREE.Color(o.color||'#888888'),a=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b}geo.setAttribute('color',new THREE.BufferAttribute(a,3))}
  if(o.rx||o.ry||o.rz){_e.set(o.rx||0,o.ry||0,o.rz||0,'YXZ');geo.applyMatrix4(_m.makeRotationFromEuler(_e))}
  geo.translate(x,y,z);
  const key=mat.uuid+(geo.index?'i':'n');let b=buckets.get(key);if(!b){b={mat,list:[]};buckets.set(key,b)}b.list.push(geo)}
 const bb=(mat,w,h,d,x,z,y0=G,o)=>add(mat,new THREE.BoxGeometry(w,h,d),x,y0+h/2,z,o);
 const cy=(mat,rt,rb,h,x,z,y0=G,seg=16,o)=>add(mat,new THREE.CylinderGeometry(rt,rb,h,seg),x,y0+h/2,z,o);
 function rod(mat,x1,y1,z1,x2,y2,z2,r=.08){const dx=x2-x1,dy=y2-y1,dz=z2-z1,l=Math.hypot(dx,dy,dz),g=new THREE.CylinderGeometry(r,r,l,5);_q.setFromUnitVectors(_up,_v.set(dx,dy,dz).normalize());g.applyQuaternion(_q);g.translate((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);const key=mat.uuid+'i';let b=buckets.get(key);if(!b){b={mat,list:[]};buckets.set(key,b)}b.list.push(g)}
 const st=(x,z,hx,hz)=>statics.push({x,z,hx,hz});
 function label(text,sub,x,y,z,ry,w,bg='#27424f'){const cv=document.createElement('canvas');cv.width=1024;cv.height=320;const c=cv.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,1024,320);c.strokeStyle='#f0c020';c.lineWidth=16;c.strokeRect(14,14,996,292);c.fillStyle='#f6f2dc';c.textAlign='center';c.font='bold 64px Arial';c.fillText(text,512,160);c.font='38px Arial';c.fillText(sub,512,240);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.3125),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;extras.push(m);if(y-G<8)for(const q of [-1,1])cy(steelDark,.13,.13,y-G-w*.15,x+q*w*.46*Math.cos(ry),z,G,6)}
 const contCols=['#b0352b','#2f66a3','#d9a02a','#3f8052','#8b8e94','#cfc9b8','#a5471f','#1f7079','#6b4c8e','#e0e0dc'];
 const pickC=()=>contCols[Math.floor(rnd()*contCols.length)];

 // ---------- island body ----------
 add(rock,new THREE.BoxGeometry(310,H+9,310),720,(H-9)/2,0);
 add(concrete,new THREE.BoxGeometry(304,.4,304),720,H-.0,0);
 // rocky shore ring
 for(let t=-148;t<=148;t+=24){for(const [x,z] of [[568,t],[872,t],[720+t,-152],[720+t,152]]){if(x<600&&Math.abs(z)<30)continue;if(z===152&&x>660&&x<830)continue;const h=H+7+rnd()*5;add(rnd()<.5?rock:rockDark,new THREE.CylinderGeometry(9+rnd()*4,14+rnd()*5,h,5),x,h/2-9,z,{ry:rnd()*3})}}
 // ground
 // ---------- roads ----------
 const lanesY=R+.04;
 function roadBox(x,z,w,d){bb(asphalt,w,.3,d,x,z,H+.02)}
 for(const xc of XL){const zs=[-131,...ZL,131];for(let i=0;i<zs.length-1;i++){const a=zs[i]+(i?11:0),b=zs[i+1]-(i<zs.length-2?11:0);if(b-a>1)roadBox(xc,(a+b)/2,22,b-a)}}
 for(const zc of ZL){const xs=[zc===0?574:589,...XL,851];for(let i=0;i<xs.length-1;i++){const a=xs[i]+(i?11:0),b=xs[i+1]-(i<xs.length-2?11:0);if(b-a>1)roadBox((a+b)/2,zc,b-a,22)}}
 for(const xc of XL)for(const zc of ZL)roadBox(xc,zc,22,22);
 // markings
 for(const xc of XL)for(let z=-150;z<150;z+=9){if(Math.abs(z)>128)continue;if(ZL.some(c=>Math.abs(z+2-c)<13))continue;bb(yellow,.3,.04,4,xc-.45,z+2,R);bb(yellow,.3,.04,4,xc+.45,z+2,R);bb(white,.22,.04,150*0+9,xc-10.4,z+4.5,R);bb(white,.22,.04,9,xc+10.4,z+4.5,R)}
 for(const zc of ZL)for(let x=576;x<866;x+=9){if(x>847||(x<587&&zc!==0))continue;if(XL.some(c=>Math.abs(x+2-c)<13))continue;bb(yellow,4,.04,.3,x+2,zc-.45,R);bb(yellow,4,.04,.3,x+2,zc+.45,R);bb(white,9,.04,.22,x+4.5,zc-10.4,R);bb(white,9,.04,.22,x+4.5,zc+10.4,R)}
 for(const xc of XL)for(const zc of ZL){for(let q=-8;q<=8;q+=3.2){if(Math.abs(zc+14.5)<=131)bb(white,1.6,.04,5,xc+q,zc+14.5,R);if(Math.abs(zc-14.5)<=131)bb(white,1.6,.04,5,xc+q,zc-14.5,R);if(xc+14.5<=849)bb(white,5,.04,1.6,xc+14.5,zc+q,R);if(xc-14.5>=587||zc===0)bb(white,5,.04,1.6,xc-14.5,zc+q,R)}}
 // lamps
 function lamp(x,z,ry){cy(steelDark,.12,.16,9,x,z,G,6);bb(steelDark,2.6,.14,.14,x+Math.cos(ry)*1.2,z-Math.sin(ry)*1.2,G+9,{ry});bb(lampHead,.9,.18,.4,x+Math.cos(ry)*2.4,z-Math.sin(ry)*2.4,G+8.9,{ry})}
 for(const xc of XL)for(let z=-140;z<=140;z+=40){if(ZL.some(c=>Math.abs(z-c)<16))continue;lamp(xc-12.5,z,0);lamp(xc+12.5,z+20,Math.PI)}
 for(const zc of ZL)for(let x=590;x<=860;x+=40){if(XL.some(c=>Math.abs(x-c)<16))continue;lamp(x,zc-12.5,-Math.PI/2);lamp(x+20,zc+12.5,Math.PI/2)}
 // edge barriers with hazard stripes
 function barrierLine(x0,z0,x1,z1){const l=Math.hypot(x1-x0,z1-z0),n=Math.ceil(l/6),ang=Math.atan2(x1-x0,z1-z0);for(let i=0;i<n;i++){const t=(i+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;bb(hazard,1,1.3,l/n,x,z,G,{ry:ang})}}
 barrierLine(868,-150,868,150);barrierLine(572,-150,572,-13);barrierLine(572,13,572,150);barrierLine(572,-150,868,-150);barrierLine(572,150,868,150);
 st(868,0,1,150);st(572,-81.5,1,68.5);st(572,81.5,1,68.5);st(720,-150,148,1);st(720,150,148,1);

 // ---------- CELL A: factory (NW) ----------
 bb(darkConc,96,.2,96,660,-60,G);
 bb(cladBlue,64,13,42,652,-72,G);
 for(let i=0;i<8;i++){const x=652-32+i*8+4;add(roof,new THREE.BoxGeometry(8.2,.35,42.4),x,G+13+1.4,-72,{rz:-.32});bb(glass,.2,3,42,x+3.9,-72,G+13)}
 for(let i=0;i<5;i++)bb(doorM,6,6.2,.3,628+i*12,-50.8);
 for(let i=0;i<7;i++){bb(glass,3,1.6,.2,628+i*8,-93.1,G+7);}
 st(652,-72,32,21);
 bb(brick,26,10,16,692,-30);bb(glass,22,2,.2,692,-21.9,G+3);bb(glass,22,2,.2,692,-21.9,G+6.6);bb(roof,26.6,.4,16.6,692,-30,G+10);st(692,-30,13,8);
 bb(cladGrey,16,7,18,692,-52);st(692,-52,8,9);
 for(const [x,z] of [[626,-102],[640,-104]]){for(let k=0;k<10;k++){const r1=3.2-k*.1,r2=3.2-(k+1)*.1;cy(k%2?white:red,r2,r1,6,x,z,G+k*6,14)}cy(steelDark,2.5,2.5,.6,x,z,G+60,14);st(x,z,3.2,3.2)}
 for(const x of [622,634]){cy(tankC,4,4,10,x,-24,G,14);add(tankC,new THREE.ConeGeometry(4,1.4,14),x,G+10.7,-24);st(x,-24,4,4)}
 for(let i=0;i<24;i++){cy(i%3?rustM:pipeBlue,.5,.5,1.1,664+(i%8)*1.3,-104+Math.floor(i/8)*1.3,G,8)}
 for(let i=0;i<8;i++)cy(yellow,.15,.15,1.1,625+i*5,-49,G,6);
 // ---------- CELL B: tank farm (NE) ----------
 bb(darkConc,96,.2,96,780,-60,G);
 const tanks=[[752,-92,11,16,tankA],[781,-94,10,20,tankB],[810,-92,11,14,tankC],[754,-60,9,22,tankD],[784,-62,12,12,tankA],[812,-60,10,18,tankB],[760,-30,8,10,tankC],[790,-28,8,12,tankA]];
 for(const [x,z,r,h,m] of tanks){cy(m,r,r,h,x,z,G,22);add(m,new THREE.ConeGeometry(r,2.2,22),x,G+h+1.1,z);cy(darkConc,r+.5,r+.5,.6,x,z,G,22);cy(steelDark,r+.06,r+.06,.5,x,z,G+h*.4,22);cy(steelDark,r+.06,r+.06,.5,x,z,G+h*.8,22);bb(steelDark,.4,h,.8,x+r*.92,z,G,{});cy(steelDark,.5,.5,2.4,x,z,G+h+2,8);st(x,z,r*.92,r*.92)}
 bb(darkConc,96,1,.8,780,-107,G);
 bb(darkConc,.8,1,96,732,-60,G);bb(darkConc,.8,1,96,828,-60,G);
 for(const [m,z] of [[pipeRed,-78],[pipeBlue,-77],[pipeGrey,-76]]){add(m,new THREE.CylinderGeometry(.45,.45,92,8),780,G+6+(z+78)*.8,z,{rz:Math.PI/2})}
 for(let x=738;x<=824;x+=12){bb(steelDark,.5,6.6,3,x,-77,G)}
 for(let z=-106;z<=-14;z+=12)add(pipeYellow,new THREE.CylinderGeometry(.35,.35,12,8),770,G+3,z,{rx:Math.PI/2});
 cy(steel,.5,.9,46,823,-18,G,8);bb(steelDark,2,.4,2,823,-18,G+46);st(823,-18,1,1);
 // ---------- CELL C: container yard (SW) ----------
 bb(asphalt,96,.14,96,660,60,G+.02);
 for(let r=0;r<5;r++)for(let c=0;c<4;c++){const x=624+c*14.2,z=22+r*8.6,n=1+Math.floor(rnd()*3.9);if(r===2&&c===1)continue;for(let k=0;k<n;k++){add(contMat,new THREE.BoxGeometry(12.2,2.6,2.45),x,G+.2+1.3+k*2.62,z,{color:pickC()})}st(x,z,6.1,1.3)}
 for(let i=0;i<4;i++){add(contMat,new THREE.BoxGeometry(12.2,2.6,2.45),626+i*14,G+.2+1.3,102,{color:pickC()});st(626+i*14,102,6.1,1.3)}
 // gantry crane (rubber tyred)
 {const cx=690,cz=62;for(const sx of [-9,9])for(const sz of [-4,4]){bb(yellow,1,14,1,cx+sx,cz+sz,G);cy(doorM,.9,.9,.9,cx+sx,cz+sz,G,8,{rz:Math.PI/2})}bb(yellow,20,1.4,10.4,cx,cz,G+14);bb(white,20,.8,1,cx,cz-5,G+15.4);bb(white,20,.8,1,cx,cz+5,G+15.4);bb(steelDark,3,2.6,2.6,cx+2,cz,G+12);bb(cladWhite,3,3,2.6,cx-8,cz+5,G+15);for(const sx of [-9,9])for(const sz of [-4,4])st(cx+sx,cz+sz,1,1)}
 // trucks parked
 const cab=M('#2c3b4e');for(let i=0;i<3;i++){bb(cladWhite,2.5,3,12,676+i*6,92,G+.5);bb(cab,2.5,2.6,2.8,676+i*6,84.6,G+.5);st(676+i*6,88,1.4,7)}
 // ---------- CELL D: power station (SE) ----------
 bb(darkConc,96,.2,96,780,60,G);
 for(const [x,z] of [[763,48],[800,89]]){const pts=[];for(let i=0;i<=24;i++){const t=i/24,rb=17,rt=10.5,rtop=11.6;const r=t<.7?rt+(rb-rt)*Math.pow((.7-t)/.7,2):rt+(rtop-rt)*Math.pow((t-.7)/.3,2);pts.push(new THREE.Vector2(r,t*54))}add(tower,new THREE.LatheGeometry(pts,28),x,G,z);st(x,z,15,15);anim.smoke.push({x,z,y0:G+54,r:9,n:9,big:true})}
 bb(cladGrey,30,26,20,814,34);bb(glass,26,2,.2,814,23.9,G+6);bb(glass,26,2,.2,814,23.9,G+13);bb(roof,30.6,.4,20.6,814,34,G+26);st(814,34,15,10);
 for(const x of [805,814,823])cy(steel,1.6,1.6,30,x,34,G+26,10);
 bb(cladSand,12,8,22,739,22);st(739,22,6,11);
 // substation
 for(let i=0;i<4;i++){const x=744+i*8,z=98;bb(M('#6c7a62',.6,.5),5,5,4,x,z);for(let k=-1;k<=1;k++)cy(white,.35,.35,2.4,x+k*1.5,z,G+5,8);for(let k=-1;k<=1;k++)bb(steelDark,.3,3,.3,x+k*1.5,z-4,G);st(x,z,2.8,2.4)}
 for(let i=0;i<8;i++){cy(steel,.12,.12,5,740+i*4.5,104,G,6);bb(steel,.12,.12,3,740+i*4.5,104,G+5)}
 function pylon(x,z){for(const [sx,sz] of [[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]])rod(pylonM,x+sx,G,z+sz,x+sx*.35,G+24,z+sz*.35,.18);for(const h of [6,12,18]){rod(pylonM,x-2.2+h*.06,G+h,z-2.2+h*.06,x+2.2-h*.06,G+h,z+2.2-h*.06,.08);rod(pylonM,x-2.2+h*.06,G+h,z+2.2-h*.06,x+2.2-h*.06,G+h,z-2.2+h*.06,.08)}bb(pylonM,14,.3,.3,x,z,G+24);bb(pylonM,10,.3,.3,x,z,G+19);st(x,z,2.4,2.4)}
 pylon(828,102);pylon(828,64);
 for(const dy of [24,19])for(const dx of [-6,0,6]){rod(steelDark,828+(dy===24?dx:dx*.7),G+dy,64,828+(dy===24?dx:dx*.7),G+dy,102,.05)}
 // ---------- Strips ----------
 for(const [x,m] of [[612,cladGrey],[652,cladSand],[692,cladBlue],[732,cladWhite],[772,cladGreen],[812,cladRust]]){bb(m,36,10,14,x,-139);bb(roof,36.6,.5,14.6,x,-139,G+10);for(let i=0;i<3;i++)bb(doorM,5,6,.3,x-10+i*10,-131.8);st(x,-139,18,7)}
 // customs house & quay
 bb(brick,26,10,12,610,140);bb(roof,26.6,.4,12.6,610,140,G+10);bb(glass,22,2,.2,610,133.9,G+4);st(610,140,13,6);
 for(let i=0;i<4;i++){add(contMat,new THREE.BoxGeometry(12.2,2.6,2.45),664+i*0,G+1.5+i*2.62,141,{color:pickC()})}st(664,141,6.1,1.3);
 // grain silos + trailers (east strip)
 for(let i=0;i<4;i++){const z=-100+i*13.5;cy(cladWhite,5.8,5.8,30,859,z,G,16);add(tankA,new THREE.ConeGeometry(5.8,3,16),859,G+31.5,z);st(859,z,5.4,5.4)}
 bb(steel,1.2,1.2,56,859,-80,G+34);bb(steel,1.4,1.4,28,859,-30,G+22,{rx:.0});
 for(let i=0;i<3;i++){bb(cladWhite,2.6,3.2,13,858,40+i*17,G+.6);st(858,40+i*17,1.4,6.6)}
 for(let i=0;i<10;i++){cy(rustM,.5,.5,1.1,858+(i%2)*1.4,-20+i*1.1,G,8)}
 // ---------- gate ----------
 for(const z of [-13.5,13.5]){bb(steel,1.4,19,1.4,584,z)}
 bb(steelDark,1.4,1.4,29,584,0,G+10);
 bb(brick,6,3.6,6,582,-18);bb(glass,.2,1.4,4,579,-18,G+1.4);st(582,-18,3,3);
 // ---------- ship + quay crane ----------
 const ship=new THREE.Group();
 {const hs=new THREE.Shape();hs.moveTo(-64,-12);hs.lineTo(46,-12);hs.quadraticCurveTo(66,-12,72,0);hs.quadraticCurveTo(66,12,46,12);hs.lineTo(-64,12);hs.lineTo(-64,-12);
 const hull=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:17,bevelEnabled:false}),M('#7a2b25',.7,.2));hull.rotation.x=-Math.PI/2;hull.position.y=-9;ship.add(hull);
 const low=new THREE.Mesh(new THREE.ExtrudeGeometry(hs,{depth:4,bevelEnabled:false}),M('#1c1f24',.8));low.rotation.x=-Math.PI/2;low.position.y=-9;low.scale.set(.995,.995,1);ship.add(low);
 const deck=new THREE.Mesh(new THREE.BoxGeometry(124,.6,22),M('#566266',.9));deck.position.set(-1,8.3,0);ship.add(deck);
 const house=new THREE.Mesh(new THREE.BoxGeometry(16,20,20),M('#efeee9',.6));house.position.set(-52,18,0);ship.add(house);
 const win=new THREE.Mesh(new THREE.BoxGeometry(16.4,2,20.4),M('#22343d',.2,.6));win.position.set(-52,25,0);ship.add(win);
 const fun=new THREE.Mesh(new THREE.CylinderGeometry(2.4,3,7,10),M('#a8322a',.6));fun.position.set(-56,31,0);ship.add(fun);
 for(let c=0;c<7;c++)for(let r=0;r<5;r++){const n=1+((c*3+r*5)%4);for(let k=0;k<n;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(12.2,2.6,2.45),new THREE.MeshStandardMaterial({color:pickC(),roughness:.6,metalness:.2}));m.position.set(-38+c*12.6,10+k*2.62+.3,(r-2)*2.6);ship.add(m)}}}
 ship.position.set(742,1,170);ship.rotation.y=0;extras.push(ship);
 {const cx=742,orange=M('#c9772b',.6,.4);for(const sx of [-9,9])for(const sz of [141,149]){bb(orange,1.5,40,1.5,cx+sx,sz,G);st(cx+sx,sz,1.2,1.2)}
 bb(orange,22,2,12,cx,145,G+40);bb(orange,2.4,2.4,74,cx,167,G+41.2);for(let z=140;z<=200;z+=6)rod(steelDark,cx,G+43.6,z,cx,G+41.2+1.2,z+3,.1);bb(orange,2.4,2.4,22,cx,134,G+41.2);bb(cladWhite,4,4,5,cx+4,148,G+42.4);bb(steelDark,16,.5,1,cx,150,G+15)}
 {const g=new THREE.Group(),m=M('#2f66a3',.6,.3);const cont=new THREE.Mesh(new THREE.BoxGeometry(2.45,2.6,12.2),new THREE.MeshStandardMaterial({color:'#b0352b',roughness:.6}));cont.position.y=-12;g.add(cont);const rope=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,10,4),new THREE.MeshStandardMaterial({color:'#222'}));rope.position.y=-5.5;g.add(rope);const tr=new THREE.Mesh(new THREE.BoxGeometry(3,1.4,4),new THREE.MeshStandardMaterial({color:'#2d3236'}));g.add(tr);g.position.set(742,G+39.8,170);extras.push(g);anim.trolley=g}
 // bridge landing sign + labels
 label('HARBOR INDUSTRIAL ISLAND','PORT AUTHORITY / HEAVY VEHICLES WELCOME',583,G+14.5,0,-Math.PI/2,24,'#1f3a4a');
 label('FACTORY 7','STEEL & CASTING',652,G+9,-50.6,0,16,'#46535c');
 label('TANK FARM B','NO OPEN FLAME',780,G+3.6,-109.4,0,10,'#7a4a1c');
 label('CONTAINER YARD','BLOCK C',660,G+4.4,10.4,0,12,'#27424f');
 label('POWER STATION 2','HIGH VOLTAGE',780,G+3.6,10.4,0,12,'#8a2b24');
 label('QUAY 1','CARGO / BULK',720,G+4.4,148.6,Math.PI,10,'#27424f');

 // ---------- bridge ----------
 {const x0=ISL.bridgeX0,x1=574,len=x1-x0,n=Math.ceil(len/4);
 const deck=new THREE.BoxGeometry(len,.8,22,n,1,1);tileUV(deck,6);const dp=deck.attributes.position;for(let i=0;i<dp.count;i++)dp.setY(i,dp.getY(i)+groundHeight(x0+len/2+dp.getX(i),0));deck.computeVertexNormals();
 const dm=new THREE.Mesh(deck,asphalt);dm.position.set(x0+len/2,.0+H*0+(.0)-.1,0);dm.position.y=-.1;dm.receiveShadow=true;dm.castShadow=true;extras.push(dm);
 const under=new THREE.BoxGeometry(len,2.4,18,n,1,1);const up=under.attributes.position;for(let i=0;i<up.count;i++)up.setY(i,up.getY(i)+groundHeight(x0+len/2+up.getX(i),0));under.computeVertexNormals();const um=new THREE.Mesh(under,concrete);um.position.set(x0+len/2,-1.5,0);um.castShadow=true;extras.push(um);
 for(let x=x0+4;x<x1-4;x+=9){const y=groundHeight(x,0)+.28;bb(yellow,4,.04,.3,x,-.45,y);bb(yellow,4,.04,.3,x,.45,y)}
 for(let x=x0+2;x<x1;x+=6){const y=groundHeight(x,0);for(const z of [-11,11]){add(hazard,new THREE.BoxGeometry(6,1.2,.8),x,y+.9,z)}bb(white,6,.04,.22,x,-10.2,y+.28);bb(white,6,.04,.22,x,10.2,y+.28)}
 st((x0+x1)/2,-11.4,(x1-x0)/2,.6);st((x0+x1)/2,11.4,(x1-x0)/2,.6);
 for(let x=x0+36;x<x1-12;x+=34){const y=groundHeight(x,0);for(const z of [-7,7]){cy(concrete,1.8,2.3,y+9,x,z,-9,12);}bb(concrete,4,1.6,18,x,0,y-2.6)}
 // towers and stays
 for(const tx of [440,508]){const y=groundHeight(tx,0),top=y+46;for(const z of [-14,14]){bb(concrete,2.4,top-y+10,2.4,tx,z,y-10);}bb(concrete,2.2,2.2,30.4,tx,0,y+34);bb(concrete,2,2,30.4,tx,0,top-2);
  for(const z of [-14,14])for(const d of [-1,1])for(let k=1;k<=7;k++){const ox=tx+d*k*9,oy=groundHeight(ox,0)+1.2;const sz=z>0?11.5:-11.5;rod(steel,tx,top-1.2-(k*.7),z,ox,oy,sz,.1)}}}
 // ---------- merge ----------
 const merged=[];
 for(const {mat,list} of buckets.values()){const geo=mergeGeometries(list,false);if(!geo){console.warn('island merge failed',mat.color?.getHexString());continue}const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;scene.add(m);merged.push(m)}
 for(const e of extras)scene.add(e);
 // smoke + flicker lights
 const puffGeo=new THREE.SphereGeometry(1,8,6);
 const smokeSrc=[{x:626,z:-102,y0:G+61,r:3.6,n:7,big:false},{x:640,z:-104,y0:G+61,r:3.6,n:7,big:false},...anim.smoke];anim.smoke=[];
 for(const s of smokeSrc){for(let i=0;i<s.n;i++){const mt=new THREE.MeshBasicMaterial({color:s.big?'#f2f2f2':'#7b7d80',transparent:true,opacity:.4,depthWrite:false,fog:true});const m=new THREE.Mesh(puffGeo,mt);m.frustumCulled=false;scene.add(m);anim.smoke.push({m,s,ph:i/s.n,big:s.big})}}
 for(const [x,z,y] of [[626,-102,G+60.8],[640,-104,G+60.8],[823,-18,G+46.6],[830,-24,G+27]]){const mt=new THREE.MeshStandardMaterial({color:'#ff2a1a',emissive:'#ff1a0a',emissiveIntensity:1.6});const m=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),mt);m.position.set(x,y,z);scene.add(m)}
 {const mt=new THREE.MeshStandardMaterial({color:'#ffb54a',emissive:'#ff7a1a',emissiveIntensity:2.4,transparent:true,opacity:.92});const f=new THREE.Mesh(new THREE.ConeGeometry(1.5,5,8),mt);f.position.set(823,G+49.2,-18);scene.add(f);flickers.push({m:mt,b:2.4});anim.flame=f}
 return{update(dt,t){
  for(const p of anim.smoke){const k=(t*(p.big?.045:.07)+p.ph)%1,s=p.s;p.m.position.set(s.x+k*(p.big?9:14)+Math.sin(p.ph*9+t*.2)*(p.big?1.5:.7),s.y0+k*(p.big?42:34),s.z+k*(p.big?3:6));const sc=(p.big?7:2.6)*(.5+k*1.9);p.m.scale.setScalar(sc);p.m.material.opacity=.42*(1-k)*(k<.08?k/.08:1)}
  if(anim.trolley)anim.trolley.position.z=170+Math.sin(t*.22)*22;
  if(anim.flame){anim.flame.scale.set(1+Math.sin(t*14)*.12,1+Math.sin(t*9+1)*.18,1+Math.cos(t*13)*.12)}
 }}
}
