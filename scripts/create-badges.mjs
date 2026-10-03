import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets');
fs.mkdirSync(root,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const svg=(w,h,title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><style>text{font-family:Consolas,'Liberation Mono',monospace}</style>${body}</svg>`;
const groups=[
 ['languages','01','{ }','Programming languages',['JavaScript','TypeScript','Python','Java','C++','C#','PHP','R']],
 ['frontend','02','</>','Frontend & interfaces',['React','Next.js','React Native','HTML','CSS','Tailwind CSS']],
 ['backend','03','API','Backend & data',['Node.js','Express','FastAPI','.NET','MongoDB','MySQL','PostgreSQL']],
 ['platforms','04','[+]','Platforms & services',['Firebase','Supabase','Android','Vercel','Cloudinary']],
 ['tools','05','$_','Development tools',['Git','GitHub','Docker','Postman','Figma','VS Code','Android Studio']],
 ['skills','06','***','Engineering skills',['Full-stack development','REST APIs','Mobile development','Problem-solving','Team collaboration']]
];
const badgeNames=new Map();
const slug=s=>(s==='C++'?'cpp':s==='C#'?'csharp':s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const [id,index,icon,title,items] of groups){
 let body='<rect x=".5" y=".5" width="439" height="209" rx="12" fill="#0b100d" stroke="#214b30"/>';
 body+=`<rect x="20" y="20" width="42" height="38" rx="8" fill="#10331e"/><text x="41" y="44" text-anchor="middle" font-size="14" fill="#4ade80">${esc(icon)}</text><text x="76" y="33" font-size="9" fill="#82a58f">TOOLKIT / ${index}</text><text x="76" y="53" font-size="15" fill="#edfdf3">${esc(title)}</text><path d="M20 72H420" stroke="#1b3023"/>`;
 let x=20,y=88;
 for(const item of items){
  const width=item.length*6.5+23;
  if(x+width>420){x=20;y+=35;}
  if(y+27>194)throw Error('Card overflow: '+title);
  body+=`<rect x="${x}" y="${y}" width="${width}" height="27" rx="5" fill="#102519" stroke="#235137"/><text x="${x+11}" y="${y+18}" font-size="11" fill="#86efac">${esc(item)}</text>`;
  x+=width+8;
  badgeNames.set(item,slug(item));
 }
 fs.writeFileSync(path.join(root,`stack-${id}.svg`),svg(440,210,title,body));
}
// Individual labels also style the project stacks without remote badge services.
for(const item of ['Machine Learning',...badgeNames.keys()]){
 const id=slug(item); const width=item.length*6.5+22;
 fs.writeFileSync(path.join(root,`badge-${id}.svg`),svg(width,25,item,`<rect x=".5" y=".5" width="${width-1}" height="24" rx="5" fill="#102519" stroke="#235137"/><text x="11" y="17" font-size="11" fill="#86efac">${esc(item)}</text>`));
}
for(const [name,label] of [['portfolio','PORTFOLIO ↗'],['linkedin','LINKEDIN ↗'],['email','EMAIL ↗'],['resume','RÉSUMÉ ↗']])fs.writeFileSync(path.join(root,`link-${name}.svg`),svg(132,32,label,`<rect x=".5" y=".5" width="131" height="31" rx="5" fill="#0b100d" stroke="#214d31"/><circle cx="16" cy="16" r="3" fill="#22c55e"/><text x="29" y="20" font-size="11" fill="#86efac">${label}</text>`));
console.log('Created six toolkit cards and local project labels.');
