import {useEffect,useState} from 'react';
import * as cloud from './cloud';

const names:Record<string,string>={'89':'Yonne','75':'Paris','21':"Côte-d'Or",'58':'Nièvre','45':'Loiret','18':'Cher'};
const stamp=(v:string|null)=>v?new Date(v).toLocaleString('fr-FR'):'—';
export default function Departments({session,onLogin}:{session:cloud.Session|null;onLogin:()=>void}){
 const [loaded,setLoaded]=useState<cloud.LoadedDepartment[]>([]);
 const [requests,setRequests]=useState<cloud.DepartmentRequest[]>([]);
 const [department,setDepartment]=useState('89');
 const [vintage,setVintage]=useState('2026-09-01');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 async function refresh(){
  setError('');
  try{
   const list=await cloud.getLoadedDepartments();setLoaded(list);
   if(session){const fresh=await cloud.validSession();if(fresh)setRequests(await cloud.getMyDepartmentRequests(fresh.access_token));else setRequests([])}
   else setRequests([]);
  }catch(e){setError(e instanceof Error?e.message:'Lecture impossible')}
 }
 useEffect(()=>{void refresh()},[session?.user.id]);
 async function submit(){
  if(!session){onLogin();return}
  if(!/^(0[1-9]|[1-8][0-9]|9[0-5]|2A|2B|97[1-6])$/.test(department)){setError('Département incorrect');return}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(vintage)){setError('Date de millésime invalide');return}
  if(loaded.some(x=>x.department===department&&x.vintage===vintage)){setError('Ce département est déjà chargé pour ce millésime.');return}
  setBusy(true);setError('');setMessage('');
  try{
   const fresh=await cloud.validSession();if(!fresh)throw Error('Session expirée : reconnecte-toi');
   await cloud.requestDepartmentImport(fresh.access_token,fresh.user.id,department,vintage);
   setMessage('Demande enregistrée. Elle doit être prise en charge par un administrateur avant lancement du chargement.');
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:'Demande impossible')}finally{setBusy(false)}
 }
 return <article className="about departments"><h1>Départements cadastraux</h1><p>Départements présents dans PostGIS, d'après les imports terminés.</p>
 <button onClick={()=>void refresh()}>Actualiser</button>
 <div className="departments-table"><table><thead><tr><th>Département</th><th>Millésime</th><th>Parcelles importées</th><th>Date de chargement</th></tr></thead><tbody>{loaded.length?loaded.map(d=><tr key={d.department}><td>{d.department} — {names[d.department]||'Département '+d.department}</td><td>{d.vintage}</td><td>{Number(d.processed).toLocaleString('fr-FR')}</td><td>{stamp(d.loaded_at)}</td></tr>):<tr><td colSpan={4}>Aucun département chargé</td></tr>}</tbody></table></div>
 <section className="import-request"><h2>Demander le chargement d’un département</h2>{session?<><p>La demande est enregistrée pour validation. Elle ne déclenche pas immédiatement l'import de données.</p><label>Code département<input value={department} maxLength={3} onChange={e=>setDepartment(e.target.value.toUpperCase().trim())} placeholder="Ex. 58"/></label><label>Millésime des données<input type="date" value={vintage} onChange={e=>setVintage(e.target.value)}/></label><button className="primary" disabled={busy} onClick={submit}>{busy?'Enregistrement…':'Envoyer la demande'}</button></>:<><p>Connecte-toi pour demander un nouveau département.</p><button onClick={onLogin}>Se connecter</button></>}</section>
 {session&&<section><h2>Mes demandes</h2><div className="departments-table"><table><thead><tr><th>Département</th><th>Millésime</th><th>Date</th><th>Statut</th></tr></thead><tbody>{requests.length?requests.map(r=><tr key={r.id}><td>{r.department}</td><td>{r.vintage}</td><td>{stamp(r.requested_at)}</td><td>{r.status}</td></tr>):<tr><td colSpan={4}>Aucune demande</td></tr>}</tbody></table></div></section>}
 {error&&<p className="error" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
 </article>;
}
