import { existsSync, readdirSync } from 'node:fs';
const migrated = new Set(['stats','probe_truth','weapon_dedup','costs','fingerprints','cond_series','selfaudit','doc_check','spotcheck']
    .flatMap(n => ['mjs','json'].map(ext=>`temp/a61_${n}.${ext}`)));
const history = new Set(['temp/a61_stats2.mjs','temp/a61_school_map.mjs']);
const descriptions = new Set(['temp/a61_*.{mjs,json}','temp/a61_*.json/mjs','temp/a61_*']);
export function migrated_reference(ref, exists = existsSync) {
    if (history.has(ref)) return { status:'HISTORICAL_ONLY', target:ref };
    if (descriptions.has(ref)) return { status:'HISTORICAL_PATTERN', target:ref };
    if (!migrated.has(ref)) return null;
    const target=ref.replace('temp/','tools/martial_summary/');
    return { status:exists(target)?'MIGRATED':'MISSING', target };
}
function segment_regex(segment) {
    const parts=segment.split(/(\*|\{[^}]+\})/);
    return new RegExp('^'+parts.map(p=>{
        if(p==='*')return '.*';
        if(p.startsWith('{')) {
            let choices=p.slice(1,-1).split(',');
            const range=/^(\d+)\.\.(\d+)$/.exec(choices[0]);
            if(range) {
                const a=Number(range[1]), b=Number(range[2]);
                if(b<a||b-a>1000)throw Error('Unsupported range');
                choices=Array.from({length:b-a+1},(_,i)=>String(a+i));
            }
            return '(?:'+choices.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')';
        }
        return p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    }).join('')+'$');
}
export function evidence_exists(path) {
    const p=path.replaceAll('\\','/');
    const i=p.search(/[*{]/);
    if(i<0)return existsSync(p);
    const slash=p.lastIndexOf('/',i);
    let candidates=[p.slice(0,slash)];
    for(const part of p.slice(slash+1).split('/')) {
        const re=segment_regex(part);
        candidates=candidates.flatMap(dir=>{
            try{return readdirSync(dir).filter(n=>re.test(n)).map(n=>dir+'/'+n);}catch{return [];}
        });
    }
    return candidates.some(existsSync);
}
