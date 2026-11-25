// ROUND 13: landscape mobile layout, drag-to-orbit camera, adaptive render quality.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function createOrbit(canvas,isBlocked){
  const o={yaw:0,pitch:0,zoom:1,dragging:false,idle:99,active:false};
  const pts=new Map();let pinch=0;
  canvas.style.cursor='grab';
  canvas.addEventListener('pointerdown',e=>{
    if(isBlocked())return;
    if(e.pointerType==='mouse'&&e.button!==0&&e.button!==2)return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    try{canvas.setPointerCapture(e.pointerId)}catch(_){}
    o.dragging=true;o.idle=0;canvas.style.cursor='grabbing';
    if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}
  });
  canvas.addEventListener('pointermove',e=>{
    const p=pts.get(e.pointerId);if(!p||isBlocked())return;
    const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pts.size>=2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)o.zoom=clamp(o.zoom*(pinch/Math.max(20,d)),.55,2.2);pinch=d;return}
    const k=e.pointerType==='touch'?.0072:.0058;
    o.yaw=clamp(o.yaw-dx*k,-Math.PI,Math.PI);
    o.pitch=clamp(o.pitch+dy*k*.8,-.12,1.15);
    o.idle=0;o.active=true;
  });
  const end=e=>{pts.delete(e.pointerId);if(!pts.size){o.dragging=false;pinch=0;canvas.style.cursor='grab'}else if(pts.size<2)pinch=0};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('wheel',e=>{if(isBlocked())return;e.preventDefault();o.zoom=clamp(o.zoom*(1+Math.sign(e.deltaY)*.08),.55,2.2);o.idle=0},{passive:false});
  // Called every frame with real dt. Eases back behind the car a moment after release.
  o.update=dt=>{
    if(isBlocked()){o.yaw*=Math.exp(-dt*6);o.pitch*=Math.exp(-dt*6);return}
    if(!o.dragging){o.idle+=dt;if(o.idle>2.2){const k=1-Math.exp(-dt*2.4);o.yaw-=o.yaw*k;o.pitch-=o.pitch*k;if(Math.abs(o.yaw)<.002&&Math.abs(o.pitch)<.002){o.yaw=o.pitch=0;o.active=false}}}
  };
  return o;
}

export function setupLayout({getStarted,isTouch}){
  const body=document.body;
  const refresh=()=>{
    const touch=body.classList.contains('touch')||isTouch;
    const land=touch&&innerWidth>innerHeight&&innerHeight<=600;
    const portrait=touch&&innerHeight>innerWidth&&innerWidth<900;
    body.classList.toggle('land',land);body.classList.toggle('portrait',portrait);
    if(portrait&&getStarted())window.dispatchEvent(new Event('blur'));
  };
  window.addEventListener('resize',refresh);window.addEventListener('orientationchange',()=>setTimeout(refresh,250));
  setTimeout(refresh,0);setTimeout(refresh,600);
  // Fullscreen + landscape lock (Android Chrome). iPhone Safari has no fullscreen API: use Add to Home Screen.
  const canFS=document.fullscreenEnabled||document.webkitFullscreenEnabled;
  const goFS=()=>{
    const el=document.documentElement,req=el.requestFullscreen||el.webkitRequestFullscreen;
    if(!req)return;
    if(document.fullscreenElement||document.webkitFullscreenElement)return;
    try{const r=req.call(el,{navigationUI:'hide'});(r&&r.then?r:Promise.resolve()).then(()=>screen.orientation?.lock?.('landscape')).catch(()=>{})}catch(_){}
  };
  if(canFS){
    const b=document.createElement('button');b.id='fsBtn';b.textContent='⛶';b.title='Fullscreen';b.onclick=()=>{if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else goFS()};
    document.getElementById('top')?.append(b);
  }
  document.getElementById('play')?.addEventListener('click',()=>{if(isTouch||body.classList.contains('touch'))goFS()});
}

// Lowers or raises the render resolution to hold a smooth frame rate.
export function createPerf(renderer,setSize){
  const maxRatio=Math.min(window.devicePixelRatio||1,2),touch='ontouchstart' in window;
  let ratio=touch?Math.min(maxRatio,1.5):maxRatio,acc=0,n=0,cool=3,low=0,high=0;
  const steps=[.7,.85,1,1.25,1.5,2];
  renderer.setPixelRatio(ratio);
  return{
    ratio:()=>ratio,
    tick(dt){
      if(dt<=0||dt>.5)return;acc+=dt;n++;cool-=dt;
      if(acc<1.6)return;
      const fps=n/acc;acc=0;n=0;
      if(cool>0)return;
      let i=steps.reduce((b,s,k)=>Math.abs(s-ratio)<Math.abs(steps[b]-ratio)?k:b,0);
      if(fps<32){low++;high=0}else if(fps>57){high++;low=0}else{low=high=0}
      if(low>=2&&i>0){ratio=steps[i-1];low=0;cool=4;renderer.setPixelRatio(ratio);setSize()}
      else if(high>=5&&i<steps.length-1&&steps[i+1]<=maxRatio+.01){ratio=steps[i+1];high=0;cool=6;renderer.setPixelRatio(ratio);setSize()}
    }
  };
}
