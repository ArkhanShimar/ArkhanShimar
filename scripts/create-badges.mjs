import fs from 'node:fs';
const root='github-profile/assets/';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
function svg(w,h,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>text{font-family:Consolas,monospace}</style>${body}</svg>`;}
for(const [name,label] of [['portfolio','PORTFOLIO ↗'],['linkedin','LINKEDIN ↗'],['email','EMAIL ↗'],['resume','RÉSUMÉ ↗']])fs.writeFileSync(root+`link-${name}.svg`,svg(132,32,`<rect x=".5" y=".5" width="131" height="31" rx="5" fill="#0b100d" stroke="#214d31"/><circle cx="16" cy="16" r="3" fill="#22c55e"/><text x="29" y="20" font-size="11" fill="#86efac">${label}</text>`));
const rows=[['FRONTEND',['React','Next.js','TypeScript','JavaScript','HTML / CSS','React Native']],['BACKEND',['Node.js','Express','FastAPI','PHP','C# / .NET']],['DATABASES',['MongoDB','MySQL','PostgreSQL','Supabase','Firebase']],['LANGUAGES',['Python','Java','C++','R']],['WORKFLOW',['Git','Docker','Postman','Figma','VS Code','Android Studio']]];
let body='<rect x=".5" y=".5" width="899" height="279" rx="10" fill="#0b100d" stroke="#1b3023"/>';
rows.forEach(([label,tags],i)=>{const y=24+i*51;body+=`<text x="22" y="${y+19}" fill="#7c9986" font-size="10">${label}</text>`;let x=133;for(const tag of tags){const width=tag.length*7+25;body+=`<rect x="${x}" y="${y}" width="${width}" height="30" rx="5" fill="#102519" stroke="#20462d"/><text x="${x+width/2}" y="${y+19}" text-anchor="middle" fill="#86efac" font-size="11">${esc(tag)}</text>`;x+=width+9;}});
fs.writeFileSync(root+'tech-stack.svg',svg(900,280,body));
