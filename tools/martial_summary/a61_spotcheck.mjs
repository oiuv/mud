// 6.1 data-semantics spot checks against real originals (not synthetic tests).
// Each check prints CHECK <name> PASS/FAIL and the exact evidence path it read.
// Run from repo root. Exit non-zero on any failure.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { cost_outcome } from './cost_outcome.mjs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const json = p => JSON.parse(readFileSync(p, 'utf8'));
let fail = 0;
const check = (name, ok, path) => {
    console.log(`CHECK ${name} ${ok ? 'PASS' : 'FAIL'}  <- ${path}`);
    if (!ok) fail++;
};

// 1. weapon layer: parent source valid_enable + xsword 形制/战斗/演奏三分
for (const sk of ['huashan-jian', 'taiji-jian']) {
    const src = readFileSync(`kungfu/skill/${sk}.c`, 'utf8');
    const m = /valid_enable\s*\([^)]*\)\s*\{([\s\S]*?)\}/.exec(src);
    check(`weapon ${sk} valid_enable sword`, !!m && m[1].includes('"sword"'), `kungfu/skill/${sk}.c`);
}
{
    const src = readFileSync('inherit/weapon/xsword.c', 'utf8');
    check('xsword init_xsword sets combat skill_type sword', /set\("skill_type", "sword"\)/.test(src), 'inherit/weapon/xsword.c');
    check('xsword has play_xiao playing entry', /add_action\("play_xiao", "play"\)/.test(src), 'inherit/weapon/xsword.c');
}

// 2. school layer: gbout-f1 condition + slot files
{
    const cov = json(`${E}/gbout-f1/coverage.json`);
    const c = cov.conditions.find(x => x.id === 'school-gumu-bout-suxin-jian-l400-jiali0');
    check('school gbout-f1 suxin counts', !!c && c.planned === 20 && c.recorded === 10 && c.counts.observed === 10 && (c.missing ?? []).length === 10,
        'E/gbout-f1/coverage.json');
    const files = readdirSync(`${E}/gbout-f1/samples`).filter(f => f.startsWith('school-gumu-bout-suxin-jian-l400-jiali0.'));
    check('school gbout-f1 suxin slot files', files.length === 10, 'E/gbout-f1/samples/…-l400-jiali0.{0..9}.json');
}

// 3. all-martial layer: deterministic probe slots + ledger evidence link
{
    const files = readdirSync(`${E}/perform-probe-formal-20261103-v4/samples`).filter(f => f.startsWith('probe-exert-bahuang-gong-powerup-0.'));
    check('probe bahuang powerup-0 slots', files.length === 2, 'E/perform-probe-formal-20261103-v4/samples/probe-exert-bahuang-gong-powerup-0.{0,1}.json');
    const led = json(`${E}/acceptance-51-53-20261115-final/coverage-ledger.json`);
    const e = led.entries.find(x => x.evidence_link.includes('b21-bagua-biao-xian'));
    const part = e.evidence_link.split(';')[0].trim().split(':')[1];
    const [series, cond] = part.split('/');
    const slots = readdirSync(`${E}/${series}/samples`).filter(f => f.startsWith(cond + '.'));
    check('ledger evidence_link resolves to originals', !!e && slots.length === 100, `E/${series}/samples/${cond}.*.json (${slots.length} slots)`);
}

// 4. mechanism spot checks (§1.3/§四 representative claims)
{
    const g5 = `${E}/perform-probe-formal-20261115-gapfill5/samples`;
    const atk = f => (json(`${g5}/${f}`).raw ?? json(`${g5}/${f}`)).attacks?.length;
    check('combo gun-she 18 attacks', atk('probe-perform-gun-she-3.0.json') === 18, `${g5}/probe-perform-gun-she-3.0.json`);
    check('combo daojian-xue 9 attacks', atk('probe-perform-daojian-guizhen-xue-20.0.json') === 9, `${g5}/probe-perform-daojian-guizhen-xue-20.0.json`);
    check('combo duanjia-jue 5 attacks', atk('probe-perform-duanjia-sword-jue-28.0.json') === 5, `${g5}/probe-perform-duanjia-sword-jue-28.0.json`);
    const fr = json(`${g5}/probe-perform-furong-jinzhen-xian-2.0.json`);
    const w = JSON.stringify(fr.raw ?? fr).match(/"weight":(\d+)/g) ?? [];
    check('ammo furong weight 500->490', w.length >= 2 && w[0] === '"weight":500' && w[w.length - 1] === '"weight":490', `${g5}/probe-perform-furong-jinzhen-xian-2.0.json`);
}
{
    const dir = `${E}/perform-probe-formal-20261115-gapfill7/samples`;
    const dests = {};
    for (const f of readdirSync(dir)) {
        const s = json(`${dir}/${f}`);
        const a = (s.raw ?? s).after?.[0] ?? {};
        const loc = a.room ?? a.environment ?? a.location ?? null;
        if (loc) dests[loc] = (dests[loc] ?? 0) + 1;
    }
    const ok = dests['/d/city/wumiao'] === 38 && dests['/u/mudren/workroom'] === 32 && dests['/d/city/kedian'] === 30;
    check('rouyun three endpoints 38/32/30', ok, `${dir} (100 files) ${JSON.stringify(dests)}`);
}
{
    const dir = `${E}/perform-probe-formal-20261114-chousui/samples`;
    let lo = Infinity, hi = -Infinity, n = 0;
    for (const f of readdirSync(dir)) {
        const s = json(`${dir}/${f}`);
        const m1 = (s.raw ?? s).metrics?.[1] ?? {};
        if (m1.qi_cost !== undefined) { lo = Math.min(lo, m1.qi_cost); hi = Math.max(hi, m1.qi_cost); n++; }
    }
    check('chousui dan qi_cost 403..953', lo === 403 && hi === 953, `${dir} (hits with qi_cost: ${n})`);
}
{
    const dir = `${E}/perform-probe-formal-20261103-v4/samples`;
    const f = readdirSync(dir).find(x => x.startsWith('probe-perform-shedao-qigong-chang2-387.'));
    const s = json(`${dir}/${f}`);
    const d = s.raw ?? s;
    const delta = (d.after?.[0]?.neili ?? 0) - (d.before?.[0]?.neili ?? 0);
    check('shedao chang2 neili +100', delta === 100, `${dir}/${f}`);
}

// 5. cross-version snapshot consistency (3 differing skills absent from f569 series)
{
    const targets = ['canhe-zhi', 'shenghuo-ling/can', 'tanzhi-shentong'];
    const dirs = readdirSync(E, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(`${E}/${d.name}/series.json`));
    let hits = 0, checked = 0;
    for (const d of dirs) {
        const s = json(`${E}/${d.name}/series.json`);
        if (!/f569f0295278/.test(s.identity.source_fingerprint ?? '')) continue;
        checked++;
        let cov; try { cov = json(`${E}/${d.name}/coverage.json`); } catch { continue; }
        for (const c of cov.conditions ?? [])
            for (const t of targets) if ((c.entry_id ?? '').includes(t)) hits++;
    }
    check('f569 series cover none of 3 differing skills', checked === 72 && hits === 0, `${checked} f569 series coverage.json scan`);
}

// 6. cost split (outcome x verification): refused excluded from normal cost; envelope labeled
{
    const costs = json('tools/martial_summary/a61_costs.json');
    check('cost unarmed envelope neili upper +100', costs.byUsage.unarmed.env.neili.max === 100, 'tools/martial_summary/a61_costs.json');
    check('cost spear normal_effect 0 samples (all refused)', (costs.byUsage.spear.normal_effect?.samples ?? 0) === 0, 'tools/martial_summary/a61_costs.json');
    check('cost spear refused 300 samples', costs.byUsage.spear.refused.samples === 300, 'tools/martial_summary/a61_costs.json');
    const clsSum = Object.values(costs.totals.byClass).reduce((a, b) => a + b, 0);
    check('cost class sum = 61,070', clsSum === 61070, 'tools/martial_summary/a61_costs.json');
    check('cost refused = 48,306 verified refusals', costs.totals.byClass.refused === 48306, 'tools/martial_summary/a61_costs.json');
}

// 7. weapon dedup figures
{
    const wd = json('tools/martial_summary/a61_weapon_dedup.json');
    check('weapon dedup sword 93+8=101', wd.perCat.sword.single === 93 && wd.perCat.sword.mixed === 8, 'tools/martial_summary/a61_weapon_dedup.json');
    check('weapon dedup unique parents 722 = 232+8+481+1',
        wd.parents === 722 && Object.values(wd.perCat).reduce((a, v) => a + v.single, 0) === 232 && wd.mixedTotal === 8 && wd.nonWeapon === 481 && wd.none === 1,
        'tools/martial_summary/a61_weapon_dedup.json');
}

{
    const series='perform-probe-formal-20261115-gapfill5';
    const manifest=json(`${E}/${series}/series.json`);
    const condition=manifest.identity.conditions.find(c=>c.entry_id==='kungfu/skill/taiji-shengong/dian.c:5:exert');
    const rec=json(`${E}/${series}/samples/${condition.id}.0.json`);
    const data=rec.raw??rec;
    check('dian target curing is normal despite self-cost',
        data.metrics[1].eff_qi_recovery===1450 && cost_outcome(condition.entry_id,data)==='normal',
        `${E}/${series}/samples/${condition.id}.0.json`);
    const costs=json('tools/martial_summary/a61_costs.json');
    const entry=costs.entries.find(e=>e.id===condition.entry_id);
    check('dian all 100 treated observations are normal, zero backlash',
        entry.counts.normal_effect===100 && entry.backlash===0, 'a61_costs.json');
}
console.log(fail === 0 ? 'SPOT-CHECK PASS' : `SPOT-CHECK FAIL (${fail})`);
process.exit(fail ? 1 : 0);
