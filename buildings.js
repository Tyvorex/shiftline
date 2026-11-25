// Realistic CC0 buildings from tevy.dev, loaded at runtime. Falls back to the old blocks if loading fails.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
const U='https://tevy.dev/models/';
export const DOWNTOWN=[['office-tower','v2'],['korean-apartment-tower','v1'],['hospital-building','v2'],['office-tower','v2']];
export const MIDRISE=[['apartment-block','v2'],['corner-shop-block','v2'],['apartment-block','v2'],['corner-shop-block','v2'],['pencil-building','v1']];
// Convert a (possibly quantized) mesh into plain Float32 geometry in world space.
export function bake(root){
  root.updateMatrixWorld(true);const out=[];
  root.traverse(m=>{
    if(!m.isMesh||!m.geometry.attributes.position)return;
    const g=m.geometry,n=g.attributes.position.count,pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2),v=new THREE.Vector3();
    const nm=new THREE.Matrix3().getNormalMatrix(m.matrixWorld);
    for(let i=0;i<n;i++){v.fromBufferAttribute(g.attributes.position,i).applyMatrix4(m.matrixWorld);pos.set([v.x,v.y,v.z],i*3);
      if(g.attributes.normal){v.fromBufferAttribute(g.attributes.normal,i).applyMatrix3(nm).normalize();nor.set([v.x,v.y,v.z],i*3)}else nor.set([0,1,0],i*3);
      if(g.attributes.uv){uv[i*2]=g.attributes.uv.getX(i);uv[i*2+1]=g.attributes.uv.getY(i)}}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.BufferAttribute(nor,3));bg.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    if(g.index){bg.setIndex(new THREE.BufferAttribute(Uint32Array.from(g.index.array),1))}else{const idx=new Uint32Array(n);for(let i=0;i<n;i++)idx[i]=i;bg.setIndex(new THREE.BufferAttribute(idx,1))}
    out.push({geo:bg,mat:m.material});
  });
  return out;
}
// Load a template: parts baked at origin, base at y=0, centred on x/z. Front faces +z.
export async function loadTemplate(loader,name,ver){
  const g=await loader.loadAsync(U+name+'/'+ver+'/lod2.glb');
  const parts=bake(g.scene),box=new THREE.Box3();
  for(const p of parts){p.geo.computeBoundingBox();box.union(p.geo.boundingBox)}
  const c=box.getCenter(new THREE.Vector3()),s=box.getSize(new THREE.Vector3());
  for(const p of parts)p.geo.translate(-c.x,-box.min.y,-c.z);
  for(const p of parts){const m=p.mat;if(m){m.envMapIntensity=.3}}
  return {name,parts,w:s.x,d:s.z,h:s.y};
}
export async function loadAll(renderer){
  const ktx=new KTX2Loader().setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/basis/').detectSupport(renderer);
  const loader=new GLTFLoader().setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder);
  const want=[...new Set([...DOWNTOWN,...MIDRISE].map(a=>a.join('|')))].map(k=>k.split('|'));
  const res={};
  await Promise.all(want.map(async([n,v])=>{try{res[n]=await loadTemplate(loader,n,v)}catch(e){console.warn('tevy model failed',n,e)}}));
  return res;
}
