const url=import.meta.env.VITE_SUPABASE_URL as string;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string;
export type Session={access_token:string;refresh_token:string;expires_at:number;user:{id:string;email?:string}};
const SESSION_KEY='cadastre-auth-v1';
export function getSession():Session|null{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function saveSession(s:Session|null){if(s)localStorage.setItem(SESSION_KEY,JSON.stringify(s));else localStorage.removeItem(SESSION_KEY)}
async function request(path:string,options:RequestInit={},token?:string){
 const resp=await fetch(url+path,{...options,headers:{'apikey':key,'Authorization':'Bearer '+(token||key),'Content-Type':'application/json',...options.headers}});
 if(!resp.ok){let e:any;try{e=await resp.json()}catch{}throw Error(e?.msg||e?.message||e?.error_description||('HTTP '+resp.status))}
 const text=await resp.text();return text?JSON.parse(text):null;
}
export async function login(email:string,password:string,signup=false){
 const endpoint=signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
 const r=await request(endpoint,{method:'POST',body:JSON.stringify({email,password})});
 if(!r.access_token){if(signup)throw Error('Compte créé. Confirme ton adresse email avant de te connecter.');throw Error('Session absente')}
 const session:Session={access_token:r.access_token,refresh_token:r.refresh_token,expires_at:Date.now()+r.expires_in*1000,user:r.user};
 saveSession(session);return session;
}
export function logout(){saveSession(null)}
export async function validSession():Promise<Session|null>{
 const s=getSession();if(!s)return null;
 if(Date.now()<s.expires_at-60000)return s;
 try{const r=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:s.refresh_token})});const updated:Session={access_token:r.access_token,refresh_token:r.refresh_token,expires_at:Date.now()+r.expires_in*1000,user:r.user};saveSession(updated);return updated}catch{saveSession(null);return null}
}
export async function getProjects(token:string){return await request('/rest/v1/land_projects?select=id,name,description&order=created_at.asc',{},token) as Array<{id:string;name:string}>}
export type ParcelRow={cadastre_id:string;geometry:GeoJSON.Polygon|GeoJSON.MultiPolygon;commune:string;section:string;number:string;tags:string[];fill_color:string;fill_opacity:number;outline_color:string;outline_width:number;visible:boolean};
export async function getProjectParcels(token:string,id:string){return await request('/rest/v1/rpc/get_my_project_parcels',{method:'POST',body:JSON.stringify({p_project_id:id})},token) as ParcelRow[]}
export async function saveProjects(token:string,userId:string,projects:Array<{id:string;name:string;parcelIds:string[];styles?:Record<string,{tags:string[];fill:string;opacity:number;outline:string;outlineWidth:number;visible:boolean}>}>,validCadastreIds:Set<string>){
 for(const p of projects){
  await request('/rest/v1/land_projects?on_conflict=id',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates'},body:JSON.stringify([{id:p.id,name:p.name,owner_id:userId}])},token);
  const ids=p.parcelIds.filter(x=>validCadastreIds.has(x));
  const old=await request('/rest/v1/land_project_parcels?select=parcel_id&project_id=eq.'+encodeURIComponent(p.id),{},token) as Array<{parcel_id:string}>;
  const absent=old.filter(r=>!ids.includes(r.parcel_id)).map(r=>r.parcel_id);
  for(const id of absent) await request('/rest/v1/land_project_parcels?project_id=eq.'+encodeURIComponent(p.id)+'&parcel_id=eq.'+encodeURIComponent(id),{method:'DELETE'},token);
  if(ids.length)await request('/rest/v1/land_project_parcels?on_conflict=project_id,parcel_id',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates'},body:JSON.stringify(ids.map(id=>({project_id:p.id,parcel_id:id,tags:p.styles?.[id]?.tags||[],fill_color:p.styles?.[id]?.fill||'#32a66d',fill_opacity:p.styles?.[id]?.opacity??0.4,outline_color:p.styles?.[id]?.outline||'#075539',outline_width:p.styles?.[id]?.outlineWidth??2,visible:p.styles?.[id]?.visible??true})))},token);
 }
}
export async function deleteProject(token:string,id:string){await request('/rest/v1/land_projects?id=eq.'+encodeURIComponent(id),{method:'DELETE'},token)}

export type SavedQuery={id:string;project_id:string;name:string;tags:string[];match_mode:'any'|'all'};
export async function getSavedQueries(token:string,projectId:string):Promise<SavedQuery[]>{
 return await request('/rest/v1/land_saved_queries?select=id,project_id,name,tags,match_mode&project_id=eq.'+encodeURIComponent(projectId)+'&order=name.asc',{},token);
}
export async function saveQuery(token:string,query:{project_id:string;name:string;tags:string[];match_mode:'any'|'all'}){
 return await request('/rest/v1/land_saved_queries',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(query)},token);
}
export async function deleteQuery(token:string,id:string){
 await request('/rest/v1/land_saved_queries?id=eq.'+encodeURIComponent(id),{method:'DELETE'},token);
}
