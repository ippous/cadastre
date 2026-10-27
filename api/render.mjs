import sharp from 'sharp';
import {PDFDocument} from 'pdf-lib';

const base=process.env.VITE_SUPABASE_URL;
const publishable=process.env.VITE_SUPABASE_ANON_KEY;
const json=(res,status,body)=>{res.status(status).setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(body))};
const escapeXml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const palette=/^#[0-9A-Fa-f]{6}$/;
function rings(geometry){
 const groups=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
 return groups.flatMap(poly=>poly.map(r=>r.filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&Number.isFinite(p[1])))).filter(r=>r.length>2);
}
function buildSvg(rows,width,height,labels){
 const ringSets=rows.map(r=>rings(r.geom_json));
 const points=ringSets.flat(2);
 if(!points.length)throw Error('Géométries absentes');
 const lngs=points.map(x=>x[0]),lats=points.map(x=>x[1]);
 const minX=Math.min(...lngs),maxX=Math.max(...lngs),minY=Math.min(...lats),maxY=Math.max(...lats);
 const meanLat=(minY+maxY)/2*Math.PI/180,ratio=Math.max(0.25,Math.cos(meanLat));
 const spanX=Math.max((maxX-minX)*ratio,0.000002),spanY=Math.max(maxY-minY,0.000002);
 const scale=Math.min((width-100)/spanX,(height-100)/spanY);
 const ox=(width-spanX*scale)/2,oy=(height-spanY*scale)/2;
 const xy=p=>[ox+(p[0]-minX)*ratio*scale,height-(oy+(p[1]-minY)*scale)];
 let body='<rect width="100%" height="100%" fill="#f8faf8"/>';
 rows.forEach((row,index)=>{
  const rs=ringSets[index],path=rs.map(r=>r.map((p,i)=>{const [x,y]=xy(p);return(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)}).join(' ')+' Z').join(' ');
  const fill=palette.test(row.fill_color)?row.fill_color:'#32a66d',outline=palette.test(row.outline_color)?row.outline_color:'#075539';
  body+='<path d="'+path+'" fill="'+fill+'" fill-opacity="'+Math.max(0,Math.min(1,Number(row.fill_opacity)||0.4))+'" stroke="'+outline+'" stroke-width="'+Math.max(1,Math.min(8,Number(row.outline_width)||2))+'" fill-rule="evenodd"/>';
  if(labels){const polygon=rs[0]||[],mean=polygon.reduce((a,p)=>[a[0]+p[0]/polygon.length,a[1]+p[1]/polygon.length],[0,0]);const [x,y]=xy(mean);body+='<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="14" font-family="Arial,sans-serif" paint-order="stroke" stroke="white" stroke-width="3" fill="#10261b">'+escapeXml(row.cadastre_id.slice(-4))+'</text>'}
 });
 body+='<text x="15" y="'+(height-14)+'" font-family="Arial,sans-serif" font-size="12" fill="#60766a">Cadastre Etalab · schéma indicatif sans fond aérien</text>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'">'+body+'</svg>';
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='POST')return json(res,405,{error:'Use POST'});
 if(!base||!publishable)return json(res,503,{error:'Configuration Supabase manquante'});
 const match=/^Bearer (\S+)$/i.exec(req.headers.authorization||'');
 if(!match)return json(res,401,{error:'Bearer access token requis'});
 try{
 const userResp=await fetch(base+'/auth/v1/user',{headers:{apikey:publishable,Authorization:'Bearer '+match[1]}});
 if(!userResp.ok)return json(res,401,{error:'Session invalide ou expirée'});
 const input=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
 const ids=input.parcelIds,projectId=input.projectId;
 if((Array.isArray(ids)?1:0)+(typeof projectId==='string'?1:0)!==1)return json(res,400,{error:'Fournir parcelIds OU projectId'});
 if(ids!==undefined&&(!Array.isArray(ids)||ids.length<1||ids.length>50||!ids.every(v=>typeof v==='string'&&/^[A-Za-z0-9:-]{5,40}$/.test(v))))return json(res,400,{error:'1 à 50 identifiants de parcelles valides requis'});
 if(projectId!==undefined&&!/^[0-9a-fA-F-]{36}$/.test(projectId))return json(res,400,{error:'projectId invalide'});
 const width=Number(input.width??1000),height=Number(input.height??750);
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<300||height<250||width>2000||height>2000||width*height>3000000)return json(res,400,{error:'Dimensions invalides (300-2000 px, 3 Mpx maximum)'});
 const format=String(input.format||'png').toLowerCase();
 if(!['png','pdf','svg'].includes(format))return json(res,400,{error:'Formats pris en charge : png, pdf, svg'});
 const response=await fetch(base+'/rest/v1/rpc/render_parcels_for_user',{method:'POST',headers:{apikey:publishable,Authorization:'Bearer '+match[1],'Content-Type':'application/json'},body:JSON.stringify({p_ids:ids??null,p_project_id:projectId??null})});
 if(!response.ok){const error=await response.text();return json(res,response.status===403?403:400,{error:'Requête cadastrale refusée',details:error.slice(0,220)})}
 const rows=await response.json();
 if(!rows.length)return json(res,404,{error:'Aucune parcelle trouvée'});
 if(rows.length>50)return json(res,413,{error:'Projet trop volumineux : 50 parcelles maximum pour ce rendu'});
 const svg=buildSvg(rows,width,height,input.labels!==false);
 let content,contentType;
 if(format==='svg'){content=Buffer.from(svg);contentType='image/svg+xml'}
 else {const png=await sharp(Buffer.from(svg)).png().toBuffer();
 if(format==='png'){content=png;contentType='image/png'}else{
 const pdf=await PDFDocument.create();const page=pdf.addPage([width*.75,height*.75]);const image=await pdf.embedPng(png);page.drawImage(image,{x:0,y:0,width:width*.75,height:height*.75});content=Buffer.from(await pdf.save());contentType='application/pdf';
 }}
 res.status(200).setHeader('Content-Type',contentType).setHeader('Content-Disposition','inline; filename="cadastre.'+format+'"').end(content);
 }catch(error){return json(res,500,{error:'Erreur de génération',details:String(error?.message||error).slice(0,180)})}
}
