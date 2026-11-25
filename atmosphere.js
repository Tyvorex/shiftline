// ROUND 13: living sky. Time of day cycle (dawn, noon, golden hour, dusk, night) with stars, moon,
// sun glow, fog/light colour grading, street-lamp glow and player headlights.
import * as THREE from 'three';

const C=h=>new THREE.Color(h);
// hour, skyTop, skyHorizon, fog, sunColour, sunIntensity, hemiSky, hemiGround, hemiIntensity, exposure, night
const KEYS=[
 [0,   '#050b1f','#16264a','#101b33','#8fb0ff',.55,'#2a3f73','#161d30',1.15,1.05,1],
 [5,   '#0a1736','#34426f','#1a2542','#9db8ff',.5, '#2c437a','#1b2133',1.1,1.05,.95],
 [6.1, '#34609b','#f0a07c','#d6a38c','#ffa968',1.7,'#8aa6cf','#a38a76',1.45,1.08,.25],
 [7.2, '#3f7bb8','#f4cfa6','#e2c8ae','#ffd0a0',2.9,'#a8c7e6','#b89a7c',1.9,1.1,0],
 [9,   '#4a8ec7','#f0dabb','#e0d3bd','#ffe3b8',3.5,'#bfdcf2','#c2a184',2.3,1.12,0],
 [12,  '#3d85c8','#cfe3ee','#d6e0e2','#fff4e0',3.9,'#c4e0f5','#bba68c',2.5,1.1,0],
 [15.5,'#4388c5','#ecdcc0','#e2d4bc','#ffe0b0',3.8,'#bfdcf2','#c2a184',2.4,1.12,0],
 [17.2,'#3a64a0','#ffb577','#e6b48a','#ffa05a',3.1,'#a9bddb','#b99877',1.9,1.12,.05],
 [18,  '#27407a','#ff8a58','#d79877','#ff7d4a',1.5,'#8f9fc7','#9a7a66',1.45,1.1,.2],
 [18.8,'#162656','#b05a7d','#7a6188','#ff6a58',.7, '#5b6ea6','#5a4a5e',1.3,1.08,.6],
 [20,  '#070f28','#1d2c52','#121e3a','#8fb0ff',.55,'#2a3f73','#161d30',1.15,1.05,1],
 [24,  '#050b1f','#16264a','#101b33','#8fb0ff',.55,'#2a3f73','#161d30',1.15,1.05,1]
].map(k=>({h:k[0],top:C(k[1]),hor:C(k[2]),fog:C(k[3]),sun:C(k[4]),si:k[5],hs:C(k[6]),hg:C(k[7]),hi:k[8],ex:k[9],night:k[10]}));

const MODES=[{name:'Auto'},{name:'Day',h:12.3},{name:'Sunset',h:17.9},{name:'Night',h:22.5}];

function radial(size,stops){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),r=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);for(const [o,col] of stops)r.addColorStop(o,col);g.fillStyle=r;g.fillRect(0,0,size,size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}

export function createAtmosphere({scene,camera,sky,solar,sun,hemi,getWater,getClouds,startHour=17.1,cycleSeconds=900}){
  const st={hour:startHour,mode:0,night:0,lamp:0,fogColor:new THREE.Color('#e0d3bd'),fogColorIsl:new THREE.Color('#aaa69b'),sunDir:new THREE.Vector3(),moonDir:new THREE.Vector3(),light:new THREE.Vector3(),dayK:1};
  const top=new THREE.Color(),hor=new THREE.Color(),sunC=new THREE.Color();
  // sky dome
  const uni={top:{value:top},hor:{value:hor},sunDir:{value:st.sunDir},sunCol:{value:sunC},moonDir:{value:st.moonDir},night:{value:0},glow:{value:1}};
  sky.material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:uni,
   vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`uniform vec3 top;uniform vec3 hor;uniform vec3 sunDir;uniform vec3 sunCol;uniform vec3 moonDir;uniform float night;uniform float glow;varying vec3 v;
   float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
   void main(){vec3 d=normalize(v);float h=max(d.y,0.);
    vec3 col=mix(hor,top,pow(h,.55));
    float s=max(dot(d,sunDir),0.);
    col+=sunCol*(pow(s,6.)*.22+pow(s,40.)*.45+pow(s,500.)*1.4)*glow;
    float below=1.-smoothstep(-.25,.02,d.y);col=mix(col,hor*.7,below);
    // horizon haze band
    col+=hor*.18*exp(-abs(d.y)*9.)*(1.-night*.7);
    // stars
    vec3 q=floor(d*260.);float r=hash(q);float star=step(.9972,r)*smoothstep(.04,.35,d.y);
    float tw=.65+.35*sin(r*900.+night*10.);col+=vec3(.9,.95,1.)*star*tw*night;
    // moon halo
    float m=max(dot(d,moonDir),0.);col+=vec3(.55,.65,.9)*(pow(m,120.)*.5+pow(m,12.)*.06)*night;
    gl_FragColor=vec4(col,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
  sky.renderOrder=-10;
  // sun disc + glow, moon
  solar.material.fog=false;solar.material.toneMapped=false;solar.scale.setScalar(2.1);
  const glowTex=radial(128,[[0,'rgba(255,255,255,.95)'],[.2,'rgba(255,255,255,.45)'],[1,'rgba(255,255,255,0)']]);
  const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffd9a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false}));sunGlow.scale.setScalar(760);scene.add(sunGlow);
  const moon=new THREE.Mesh(new THREE.SphereGeometry(20,24,16),new THREE.MeshBasicMaterial({color:'#e9efff',fog:false,toneMapped:false}));moon.scale.setScalar(1.6);scene.add(moon);
  const moonGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x8fa8ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false}));moonGlow.scale.setScalar(420);scene.add(moonGlow);
  // street lamp glow points
  const glowPts=[];let glowMesh=null;
  const glowUni={level:{value:0},scale:{value:300}};
  st.setGlows=(list)=>{
    if(glowMesh){scene.remove(glowMesh);glowMesh.geometry.dispose()}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(list.flatMap(p=>[p[0],p[1],p[2]]),3));g.setAttribute('col',new THREE.Float32BufferAttribute(list.flatMap(p=>[p[3]??1,p[4]??.78,p[5]??.45]),3));
    glowMesh=new THREE.Points(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:glowUni,
     vertexShader:'attribute vec3 col;varying vec3 vc;uniform float scale;void main(){vc=col;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(scale*1.6/(-mv.z),2.,70.);gl_Position=projectionMatrix*mv;}',
     fragmentShader:'uniform float level;varying vec3 vc;void main(){vec2 p=gl_PointCoord-.5;float d=length(p)*2.;float a=pow(max(1.-d,0.),2.2);gl_FragColor=vec4(vc*a*level*1.6,a*level);}'}));
    glowMesh.frustumCulled=false;scene.add(glowMesh);
  };
  // player headlights
  const spot=new THREE.SpotLight(0xfff0cf,0,70,.52,.65,1.4);spot.castShadow=false;scene.add(spot,spot.target);
  const waterBase=new THREE.Color();let waterInit=false;
  const kA={},tmp=new THREE.Color();
  const sample=h=>{let i=0;while(i<KEYS.length-2&&h>=KEYS[i+1].h)i++;const a=KEYS[i],b=KEYS[i+1],t=THREE.MathUtils.clamp((h-a.h)/(b.h-a.h),0,1),e=t*t*(3-2*t);return{a,b,t:e}};
  let envT=0;
  st.parts={solar,moon,sunGlow,moonGlow};
  st.setMode=m=>{st.mode=((m%MODES.length)+MODES.length)%MODES.length;if(MODES[st.mode].h!=null)st.hour=MODES[st.mode].h;return MODES[st.mode].name};
  st.cycleMode=()=>st.setMode(st.mode+1);
  st.modeName=()=>MODES[st.mode].name;
  st.nightish=()=>st.night>.3;
  st.update=(dt,px,py,pz,player,carsGroup)=>{
    if(st.mode===0)st.hour=(st.hour+dt*24/cycleSeconds)%24;
    else st.hour+=dt*0.0; // locked
    const h=st.hour,{a,b,t}=sample(h);
    top.copy(a.top).lerp(b.top,t);hor.copy(a.hor).lerp(b.hor,t);st.fogColor.copy(a.fog).lerp(b.fog,t);sunC.copy(a.sun).lerp(b.sun,t);
    const si=THREE.MathUtils.lerp(a.si,b.si,t),hi=THREE.MathUtils.lerp(a.hi,b.hi,t),ex=THREE.MathUtils.lerp(a.ex,b.ex,t);
    st.night=THREE.MathUtils.lerp(a.night,b.night,t);st.dayK=1-st.night;
    st.fogColorIsl.copy(st.fogColor).multiplyScalar(.82).lerp(tmp.set('#8a96a0'),.12*(1-st.night));
    hemi.color.copy(a.hs).lerp(b.hs,t);hemi.groundColor.copy(a.hg).lerp(b.hg,t);hemi.intensity=hi;
    sun.color.copy(sunC);sun.intensity=si;
    camera.userData.exposure=ex;
    // directions
    const ang=(h-6)/12*Math.PI;
    st.sunDir.set(Math.cos(ang)*-.95,Math.sin(ang)*.88+.02,-.5).normalize();
    st.moonDir.set(Math.cos(ang)*.9,-Math.sin(ang)*.85+.05,-.45).normalize();
    const useSun=st.sunDir.y>.015;
    st.light.copy(useSun?st.sunDir:st.moonDir);if(st.light.y<.12)st.light.y=.12,st.light.normalize();
    sun.position.set(px+st.light.x*150,py+st.light.y*150,pz+st.light.z*150);
    // horizon fade for the light
    const el=useSun?st.sunDir.y:st.moonDir.y;sun.intensity=si*THREE.MathUtils.clamp(el*6+.25,.3,1);
    uni.night.value=st.night;uni.glow.value=THREE.MathUtils.clamp(st.sunDir.y*8+1,0,1.2);
    const R=820;
    solar.position.copy(camera.position).addScaledVector(st.sunDir,R);solar.visible=st.sunDir.y>-.08;solar.material.color.copy(sunC).lerp(tmp.set('#fff6dc'),.5);
    sunGlow.position.copy(solar.position);sunGlow.visible=solar.visible;sunGlow.material.color.copy(sunC);sunGlow.material.opacity=THREE.MathUtils.clamp(st.sunDir.y*6+.5,0,1);
    moon.position.copy(camera.position).addScaledVector(st.moonDir,R);moon.visible=st.moonDir.y>-.05&&st.night>.05;moon.material.color.setScalar(.75+.25*st.night);
    moonGlow.position.copy(moon.position);moonGlow.visible=moon.visible;moonGlow.material.opacity=st.night*.8;
    // lamps
    st.lamp=THREE.MathUtils.clamp((st.night-.12)*2.2,0,1);glowUni.level.value=st.lamp;
    // headlights
    if(player){const fx=Math.sin(player.a),fz=Math.cos(player.a);spot.intensity=st.night>.2?95*st.night:0;spot.position.set(player.x+fx*1.6,py+.9,player.z+fz*1.6);spot.target.position.set(player.x+fx*26,py-.2,player.z+fz*26);spot.target.updateMatrixWorld()}
    // clouds and water
    const cl=getClouds();if(cl&&cl[0]){const m=cl[0].m.material;m.color.copy(hor).lerp(tmp.set('#ffffff'),.55*(1-st.night)).multiplyScalar(THREE.MathUtils.lerp(1,.28,st.night));}
    const w=getWater();if(w){if(!waterInit){waterBase.copy(w.color);w.roughness=.62;waterInit=true}w.color.copy(waterBase).multiplyScalar(THREE.MathUtils.lerp(1,.32,st.night)).lerp(hor,.08*st.dayK)}
    // car env map follows the light
    envT-=dt;if(envT<=0&&carsGroup){envT=.5;const f=THREE.MathUtils.lerp(1,.16,st.night);carsGroup.traverse(o=>{if(o.isMesh){const m=o.material;if(m&&m.envMap){if(m.userData.envBase==null)m.userData.envBase=m.envMapIntensity;m.envMapIntensity=m.userData.envBase*f}}})}
    return st;
  };
  return st;
}
