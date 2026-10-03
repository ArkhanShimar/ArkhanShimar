import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'assets/profile-original.png');
// Fixed head-and-shoulders crop for the supplied 3072 × 4096 portrait.
const crop={left:800,top:540,width:1570,height:1900};
const columns=120;
const rows=Math.round(columns*(crop.height/crop.width)*0.5);
const {data,info}=await sharp(source).rotate().extract(crop).resize(columns,rows,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const ramp=' .,:;irsXA253hMHGS#9B&@';
const lines=[];
for(let y=0;y<rows;y++){
 let line='';
 for(let x=0;x<columns;x++){
  const i=(y*columns+x)*info.channels;
  const alpha=data[i+3]/255;
  const luminance=(0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2])/255;
  const tone=Math.pow(luminance,0.62)*alpha;
  line+=alpha<0.1?' ':ramp[Math.min(ramp.length-1,Math.floor(tone*(ramp.length-1)))];
 }
 lines.push(line);
}
await fs.writeFile(path.join(root,'assets/portrait.txt'),lines.join('\n')+'\n');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const portrait=lines.map((line,i)=>`<text x="24" y="${94+i*9.6}" textLength="576" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${esc(line)}</text>`).join('\n');
const style='<style>.ascii{font:9.6px Consolas,"Liberation Mono",monospace;fill:#22c55e}.ui{font-family:Consolas,"Liberation Mono",monospace}.muted{fill:#81998a}.green{fill:#22c55e}.white{fill:#e5f5ea}</style>';
const frame=w=>`<rect x="1" y="1" width="${w-2}" height="858" rx="16" fill="#080b09" stroke="#214b30"/><path d="M1 54H${w-1}" stroke="#214b30"/><g fill="#22c55e"><circle cx="25" cy="28" r="5"/><circle cx="44" cy="28" r="5" opacity=".65"/><circle cx="63" cy="28" r="5" opacity=".35"/></g><text x="86" y="33" class="ui muted" font-size="12">arkhan@portfolio:~</text>`;
const wrap=(w,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="860" viewBox="0 0 ${w} 860" role="img" aria-labelledby="title desc"><title id="title">Arkhan Shimar — ASCII portrait</title><desc id="desc">Actual ASCII characters converted from Arkhan’s graduation photo, rendered in emerald green on black.</desc>${style}${frame(w)}${body}</svg>`;
await fs.writeFile(path.join(root,'assets/ascii-portrait.svg'),wrap(624,`<g class="ascii">${portrait}</g><text x="312" y="824" class="ui muted" text-anchor="middle" font-size="11">BUILD. LEARN. REPEAT.</text>`));
const infoRows=[['role','Software Engineer'],['location','Mawanella, Sri Lanka'],['education','Software Engineering'],['focus','Web / Mobile / AI'],['frontend','React, Next.js, TypeScript'],['backend','Node.js, Express, FastAPI'],['data','MongoDB, MySQL, Firebase'],['languages','Python, Java, C++'],['tools','Git, Docker, Postman'],['github','@ArkhanShimar']];
const details=infoRows.map(([key,value],i)=>`<text x="664" y="${264+i*39}" class="ui" font-size="13"><tspan class="green">${key}:</tspan><tspan x="774" class="white">${esc(value)}</tspan></text>`).join('');
await fs.writeFile(path.join(root,'assets/profile-terminal.svg'),wrap(1180,`<g class="ascii">${portrait}</g><path d="M632 104V779" stroke="#173722"/><text x="664" y="153" class="ui green" font-size="12">$ whoami</text><text x="662" y="205" class="ui white" font-size="35">Arkhan Shimar</text><path d="M664 228H1140" stroke="#214b30"/>${details}<text x="664" y="716" class="ui muted" font-size="13">Building smart, reliable software.</text><text x="664" y="748" class="ui green" font-size="13">Build. Learn. Repeat.</text><g>${['#052e16','#14532d','#15803d','#22c55e','#86efac','#dcfce7'].map((c,i)=>`<rect x="${664+i*45}" y="781" width="45" height="20" fill="${c}"/>`).join('')}</g>`));
console.log(`Created ${columns} × ${rows} character portrait, SVG portrait and terminal card.`);
