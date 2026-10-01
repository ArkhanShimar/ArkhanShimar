import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const user='ArkhanShimar';
const out=path.join(root,'assets');
await fs.mkdir(out,{recursive:true});
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const headers={'User-Agent':'ArkhanShimar-profile','Accept':'application/vnd.github+json'};
if(process.env.GITHUB_TOKEN) headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
async function api(url){const r=await fetch(`https://api.github.com${url}`,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`GitHub ${r.status} for ${url}`);return r.json();}
const [profile,repos]=await Promise.all([api(`/users/${user}`),(async()=>{const all=[];for(let page=1;page<=20;page++){const batch=await api(`/users/${user}/repos?per_page=100&type=owner&page=${page}`);all.push(...batch);if(batch.length<100)return all;}throw Error('Repository pagination limit exceeded');})()]);
const owned=repos.filter(r=>!r.fork);
const languages={};
for(const repo of owned){const data=await api(`/repos/${user}/${encodeURIComponent(repo.name)}/languages`);for(const [name,bytes] of Object.entries(data))languages[name]=(languages[name]||0)+bytes;}
const response=await fetch(`https://github.com/users/${user}/contributions`,{headers:{'User-Agent':'ArkhanShimar-profile'},signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error(`Calendar fetch failed: ${response.status}`);
const html=await response.text();
const tips=new Map([...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map(m=>[m[1].match(/\bfor="([^"]+)"/)?.[1],m[2].replace(/<[^>]+>/g,'').trim()]));
const days=[...html.matchAll(/<td\b([^>]*\bdata-date="[^"]+"[^>]*)>/g)].map(m=>{const attr=m[1];const date=attr.match(/data-date="([^"]+)"/)[1];const id=attr.match(/\bid="([^"]+)"/)?.[1];const tooltip=tips.get(id)||'';const number=tooltip.match(/([\d,]+) contributions?/);if(!number&&!/^No contributions/.test(tooltip))throw Error(`Unrecognized contribution count for ${date}`);return {date,level:Number(attr.match(/data-level="(\d+)"/)[1]),count:number?Number(number[1].replaceAll(',','')):0};}).sort((a,b)=>a.date.localeCompare(b.date));
if(days.length<300)throw Error('Calendar markup changed; retaining last good assets.');
const utc=new Date().toISOString().slice(0,10);
const total=days.reduce((sum,d)=>sum+d.count,0);
const stars=owned.reduce((sum,r)=>sum+r.stargazers_count,0);
let longest=0,run=0;for(const d of days){run=d.count?run+1:0;longest=Math.max(longest,run);}
let recent=days.filter(d=>d.date<=utc);if(recent.at(-1)?.date===utc&&!recent.at(-1).count)recent=recent.slice(0,-1);
let current=0;for(let i=recent.length-1;i>=0&&recent[i].count>0;i--)current++;
const activeDays=days.filter(d=>d.count>0).length;
const text=(x,y,t,size=13,fill='#c9d1d9',extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" ${extra}>${escape(t)}</text>`;
const rect=(x,y,w,h,fill='#0b100d',stroke='#1b3023',r=10)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const svg=(w,h,title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(title)}"><style>text{font-family:ui-monospace,Consolas,monospace} .sans{font-family:Arial,sans-serif}</style>${body}</svg>`;
const write=(name,w,h,title,body)=>fs.writeFile(path.join(out,name),svg(w,h,title,body));
await write('overview.svg',900,118,'GitHub account overview',[[profile.public_repos,'PUBLIC REPOSITORIES'],[stars,'STARS · OWNED REPOS'],[profile.followers,'FOLLOWERS'],[profile.created_at.slice(0,4),'ON GITHUB SINCE']].map(([value,label],i)=>rect(i*228,0,216,116)+text(i*228+108,52,value,32,'#f0fff5','text-anchor="middle"')+text(i*228+108,82,label,10,'#7c9986','text-anchor="middle"')).join(''));
let heat=rect(0,0,900,208)+text(24,30,'CONTRIBUTION ACTIVITY',12,'#22c55e')+text(876,30,`${total.toLocaleString()} contributions` ,12,'#c9d1d9','text-anchor="end"');
const start=new Date(days[0].date+'T00:00:00Z');const palette=['#14241b','#0e4429','#006d32','#26a641','#39d353'];let lastMonth='';
for(const d of days){const date=new Date(d.date+'T00:00:00Z');const offset=Math.round((date-start)/86400000)+start.getUTCDay();const col=Math.floor(offset/7),row=date.getUTCDay();if(row===0){const month=date.toLocaleString('en-US',{month:'short',timeZone:'UTC'});if(month!==lastMonth && col>1){heat+=text(44+col*15,56,month,9,'#7c9986');lastMonth=month;}}heat+=`<rect x="${44+col*15}" y="${67+row*15}" width="11" height="11" rx="2" fill="${palette[d.level]}"><title>${d.date}: ${d.count} contributions</title></rect>`;}
heat+=text(14,93,'M',8,'#7c9986')+text(14,123,'W',8,'#7c9986')+text(14,153,'F',8,'#7c9986')+text(24,191,`${days[0].date} — ${days.at(-1).date}`,9,'#7c9986')+text(730,191,'Less',9,'#7c9986')+palette.map((c,i)=>rect(764+i*16,181,11,11,c,'none',2)).join('')+text(851,191,'More',9,'#7c9986');
await write('contributions.svg',900,208,'GitHub contribution calendar',heat);
const languageEntries=Object.entries(languages).sort((a,b)=>b[1]-a[1]);const top=languageEntries.slice(0,5);const other=languageEntries.slice(5).reduce((sum,e)=>sum+e[1],0);if(other)top.push(['Other',other]);const bytes=top.reduce((sum,e)=>sum+e[1],0);const colors=['#22c55e','#86efac','#14b8a6','#a3e635','#3b8261','#506658'];
let langs=rect(0,0,440,280)+text(22,30,'LANGUAGE DISTRIBUTION',12,'#22c55e');let offset=0;
for(let i=0;i<top.length;i++){const [name,value]=top[i];const percent=bytes?value/bytes*100:0;langs+=`<circle cx="108" cy="133" r="65" fill="none" stroke="${colors[i]}" stroke-width="20" stroke-dasharray="${percent / 100 * 2 * Math.PI * 65} ${ (100-percent) / 100 * 2 * Math.PI * 65}" stroke-dashoffset="${-offset / 100 * 2 * Math.PI * 65}" transform="rotate(-90 108 133)"/>`;offset+=percent;langs+=rect(208,66+i*26,8,8,colors[i],'none',2)+text(226,74+i*26,name,11)+text(417,74+i*26,`${percent.toFixed(1)}%`,10,'#7c9986','text-anchor="end"');}
langs+=text(108,132,languageEntries.length,24,'#effff4','text-anchor="middle"')+text(108,152,'languages',9,'#7c9986','text-anchor="middle"')+text(22,241,'By code bytes · public non-fork repositories',9,'#7c9986')+text(22,260,'Language usage is not a proficiency score.',9,'#7c9986');await write('languages.svg',440,280,'Languages by code bytes in public original repositories',langs);
const weekCounts=[];for(let i=Math.max(0,days.length-84);i<days.length;i+=7)weekCounts.push(days.slice(i,i+7).reduce((s,d)=>s+d.count,0));const max=Math.max(1,...weekCounts);let chart=rect(0,0,440,280)+text(22,30,'RECENT CONTRIBUTIONS',12,'#22c55e')+text(22,52,'12 weekly buckets · public calendar',9,'#7c9986');
for(let i=0;i<4;i++){const y=82+i*44;chart+=`<path d="M35 ${y}H416" stroke="#1b3023" stroke-dasharray="3 4"/>`;}
chart+=weekCounts.map((n,i)=>rect(38+i*31,218-n/max*128,18,Math.max(1,n/max*128),'#22c55e','none',3)+text(47+i*31,236,i+1,8,'#7c9986','text-anchor="middle"')).join('')+text(22,260,'Weeks, oldest → newest · contributions, not commits',9,'#7c9986');await write('activity.svg',440,280,'Recent weekly contribution chart',chart);
await write('streak.svg',900,130,'Contribution streaks within the displayed calendar',rect(0,0,900,129)+[[total,'CONTRIBUTIONS'],[current,'CURRENT STREAK · DAYS'],[longest,'LONGEST STREAK · DAYS'],[activeDays,'ACTIVE DAYS']].map(([value,label],i)=>text(112+i*225,53,value,29,'#22c55e','text-anchor="middle"')+text(112+i*225,78,label,9,'#a6b8ad','text-anchor="middle"')).join('')+text(450,111,`Streaks within the displayed calendar · synced ${utc}`,9,'#7c9986','text-anchor="middle"'));
await fs.writeFile(path.join(out,'github-data.json'),JSON.stringify({synced:utc,user,publicRepos:profile.public_repos,stars,followers:profile.followers,created:profile.created_at,contributions:total,currentStreak:current,longestStreak:longest,activeDays,languages,days},null,2));
console.log(`Generated cards: ${profile.public_repos} repos, ${stars} stars, ${total} contributions; ${utc}`);

