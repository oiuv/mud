// Mechanical rendering of the cost sections only. Reads small generated data;
// never reads or rewrites original evidence.
import { readFileSync, writeFileSync } from 'node:fs';
const path = 'docs/reviews/2026-11-15-6.1-three-layer-summary-final.md';
const c = JSON.parse(readFileSync('tools/martial_summary/a61_costs.json', 'utf8'));
let doc = readFileSync(path, 'utf8').replaceAll('cuff 腕', 'cuff 拳');
const fmt = n => n.toLocaleString('en-US');
const rng = v => {
    if (!v) return '—';
    const f = n => (v.min < 0 && n > 0 ? '+' : '') + fmt(n);
    return v.min === v.max ? f(v.min) : `${f(v.min)}..${f(v.max)}`;
};
const rows = [['strike','strike 徒手'],['sword','sword 剑'],['unarmed','unarmed 拳掌'],
    ['finger','finger 指'],['blade','blade 刀'],['whip','whip 鞭'],['cuff','cuff 拳'],
    ['throwing','throwing 暗器'],['hand','hand 拿'],['claw','claw 爪'],['staff','staff 杖'],
    ['club','club 棍'],['dagger','dagger 匕首'],['hammer','hammer 锤'],['axe','axe 斧'],
    ['spear','spear 枪'],['force','force 内功'],['dodge','dodge 身法']];
function replaceSection(heading, render) {
    const start = doc.indexOf(heading), end = doc.indexOf('\n#### ', start + heading.length);
    if (start < 0 || end < 0) throw Error('Missing section: ' + heading);
    const part = doc.slice(start, end);
    const next = part.replace(/^\| .+ \|$/gm, line => {
        const found = rows.find(([, label]) => line.startsWith('| ' + label + ' |'));
        return found ? render(...found) : line;
    });
    doc = doc.slice(0,start) + next + doc.slice(end);
}
replaceSection('#### 1.2.2 ', (u,label) => {
    const g = c.byUsage[u], b = g.normal_effect ?? {};
    return `| ${label} | ${fmt(g.entriesPerClass.normal_effect)} | ${fmt(b.samples ?? 0)} | `
        + ['neili','qi_self','busy','qi_cost','eff_qi_cost'].map(k=>rng(b[k])).join(' | ') + ' |';
});
replaceSection('#### 1.2.3 ', (u,label) => {
    const g = c.byUsage[u], b = g.refused ?? {};
    const effects = ['qi_self','neili','busy'].filter(k=>b[k] && (b[k].min !== 0 || b[k].max !== 0))
        .map(k=>k+' '+rng(b[k])).join('；') || '全 0';
    return `| ${label} | ${g.miss} | ${g.backlash} | ${g.backlash ? rng(g.miss_backlash?.qi_self) : '—'} | ${fmt(b.samples ?? 0)} | ${effects} |`;
});
for (const [key,label] of [['normal_effect','正常施放 normal_effect'],['miss_backlash','合法落空/反噬 miss_backlash']]) {
    const prefix='| '+label+' | ';
    doc=doc.split('\n').map(l=>{
        if (!l.startsWith(prefix)) return l;
        const cells=l.split('|'); cells[2]=' '+fmt(c.totals.byClass[key])+' ';
        return cells.join('|');
    }).join('\n');
}
doc=doc.replaceAll('7,038',fmt(c.totals.byClass.normal_effect)).replace(/\b326\b/g,fmt(c.totals.byClass.miss_backlash))
    .replaceAll('合法落空 26','合法落空 '+c.totals.miss).replaceAll('反噬自伤 300','反噬自伤 '+c.totals.backlash)
    .replaceAll('（qi_self<0 仅自伤）','（源码反噬分支与昏迷事件）')
    .replaceAll('（攻击段全无目标效果）','（攻击落空或源码保护无效分支）')
    .replaceAll('仅自伤无受效才归 1.2.3 反噬','自身掉血不单独作为反噬依据')
    .replaceAll('force 反噬 -100..-10 为 sanku-shengong roar（MA-144 缺陷复现条件的 actor 代价）',
        'force 组的 surge-force/roar 无目标伤害分支归合法无效，qi -10 是正常代价；taiji-shengong/dian 的 100 条治疗成功归正常施放（目标 eff_qi_recovery=1450，施放者 qi -100/neili -800），不是反噬；sanku-shengong/roar（MA-144）仍在 unverified/special 组')
    .replace('#### 1.2.3 合法落空/反噬与资格拒绝（非施放成本）', '#### 1.2.3 合法落空/保护无效、反噬与资格拒绝（与正常受效成本分列）');
writeFileSync(path,doc);
console.log('Rendered cost sections',c.totals);
