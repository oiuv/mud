import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mingjiaoPublicForceConditions as conditions, validateMingjiaoPublicForceRecord as validate,
    mingjiaoPublicForceSourcePaths as paths, mingjiaoPublicForceAbsentPaths as absent,
    mingjiaoPublicForceReviewedSourceHash as reviewed } from './school_mingjiao_public_force_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const copy = value => structuredClone(value);
const catalog = { skills: ['shenghuo-xinfa', 'shenghuo-shengong', 'xiaoyao-jian',
    ...['lifeheal', 'power', 'dispel', 'tianmo', 'roar', 'shot'].map(a => 'force/' + a)].map(id => {
    const path = `kungfu/skill/${id}.c`, text = read(path).toString();
    return { id, path, sha256: sha(read(path)), entries: id.startsWith('force/')
        ? [{ role: 'exert', id: `${path}:${text.split('\n').findIndex(l => /^int exert\(/.test(l)) + 1}:exert` }] : [] };
}) };
const all = conditions(catalog, read);
const pick = suffix => { const c = all.find(c => c.id === 'school-mingjiao-public-force-' + suffix); assert.ok(c, suffix); return c; };

// Synthetic contract rows only: no driver, socket, model or evidence-ledger writes.
function fixture(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => ({
        ...cfg.properties, object: '/tests/actor#' + (side + 1),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([id, n]) =>
            [id, Math.trunc(n / 2) + (cfg.skills[cfg.mappings[id]] ?? 0)])),
        learned: {}, userp: 1, playerp: 1, interactive: 1, wizardp: 0,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'], character: cfg.properties.character },
        weapon: 'none', temp: { apply: { armor: 100 } }, conditions: null,
        busy: cfg.busy ?? null, not_living: cfg.properties.not_living ?? null,
    }));
    const r = { kind: 'sample', condition_id: c.id, index: 0, method: 'exert', elapsed: 0.01,
        outcome: p.expected, reason: ['roar', 'shot'].includes(p.ability)
            ? '你所学的内功中没有这种功能。\n' : '原入口拒绝',
        before, immediate: copy(before), metrics: [{}, {}], command_accepted: Number(p.expected === 'observed'),
        launches: [], attacks: [], interfaces: [], callbacks: [], terminals: [] };
    const [b, bt] = before, [a, t] = r.immediate;
    if (r.command_accepted) {
        a.learned.force = 1; r.metrics[0].ability_launched = 1;
        r.launches = [{ actor: b.object, skill: 'force', argument: p.action.slice(6) }];
        let cost = 0;
        if (p.ability === 'lifeheal') {
            cost = 150; const effective = b.effective_skills.force;
            t.eff_qi = Math.min(bt.max_qi, bt.eff_qi + 10 + Math.trunc(effective / 2));
            r.metrics[1].qi_recovery = 10 + Math.trunc(effective / 3);
            r.metrics[1].qi_cost = Math.max(0, bt.qi + r.metrics[1].qi_recovery - t.eff_qi);
            t.qi = Math.min(t.eff_qi, bt.qi + r.metrics[1].qi_recovery);
            r.metrics[1].eff_qi_recovery = t.eff_qi - bt.eff_qi;
        } else if (p.ability === 'dispel') {
            if (p.effect_expected !== 'accepted_no_effect') {
                cost = p.other ? 250 : 100; a.busy = p.other ? 2 : 1;
                if (p.other) t.busy = 1;
            }
        } else if (p.ability === 'power') {
            cost = b.neili; a.temp.apply[p.power_selected] = Math.trunc(b.skills['martial-cognize'] / 5);
            a.temp.power = 1; a.busy = p.fighting ? 3 : null;
        } else if (p.ability === 'tianmo') {
            cost = b.neili; const base = b.skills.force + 215, count = Math.trunc(base / 4);
            // Respect original damage/wound clipping: gross D >= W in this synthetic endpoint.
            for (const [key, extra] of [['qi', 700], ['eff_qi', 200], ['jing', 600], ['eff_jing', 100]]) {
                a[key] -= base + extra; r.metrics[0][key + '_cost'] = base + extra;
            }
            Object.assign(a.temp.apply, { str: b.str, int: b.int, con: b.con, dex: b.dex,
                attack: count, damage: b.str * 3, unarmed_damage: b.str * 3 });
            for (const k of Object.keys(b.mappings)) a.temp.apply[k] = Math.trunc(count / 2);
            a.temp.tianmo = 1; a.busy = p.fighting ? 3 : null;
        }
        a.neili -= cost; r.metrics[0].neili_cost = cost;
    }
    for (const s of r.immediate) s.effective_skills = Object.fromEntries(Object.entries(s.skills).map(([k, n]) =>
        [k, Math.trunc(n / 2) + (s.skills[s.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
    r.after = copy(r.immediate); return r;
}
const bad = (c, mutate) => { const r = fixture(c); mutate(r); assert.throws(() => validate(r, c)); };

test('fixed 122 conditions, 1812 formal and 244 smoke; six immediate abilities only', () => {
    const smoke = conditions(catalog, read, { smoke: true });
    assert.equal(all.length, 122); assert.equal(all.reduce((n, c) => n + c.samples, 0), 1812);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 244);
    assert.equal(new Set(all.map(c => c.id)).size, 122);
    for (const [i, c] of all.entries()) {
        assert.deepEqual(c.parameters, smoke[i].parameters); assert.equal(c.status, 'prepared_not_sampled');
        validate(fixture(c), c);
    }
    assert.deepEqual([...new Set(all.map(c => c.parameters.ability))], ['lifeheal', 'power', 'dispel', 'tianmo', 'roar', 'shot']);
    assert.ok(!all.some(c => c.parameters.skill === 'jiuyang-shengong' || /shenghuo-ling/.test(JSON.stringify(c.parameters.actor))));
    for (const c of all.filter(c => c.id.endsWith('max-neili299'))) assert.equal(c.parameters.actor.properties.neili, 299);
});

test('45 source hashes and 24 absent native entries are exact and fail closed', () => {
    assert.equal(paths.length, 45); assert.equal(absent.length, 24);
    assert.equal(sha(JSON.stringify(paths.map(p => [p, sha(read(p))]))), reviewed);
    assert.throws(() => conditions(catalog, p => p === 'cmds/skill/exert.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
    assert.throws(() => conditions(catalog, p => p === absent[0] ? Buffer.from('new source') : read(p)));
    assert.throws(() => conditions(catalog, p => { if (p === absent[0]) { const e = new Error('unreadable'); e.code = 'EACCES'; throw e; } return read(p); }));
    const changed = copy(catalog); changed.skills[0].sha256 = '0'.repeat(64); assert.throws(() => conditions(changed, read));
    assert.throws(() => conditions(catalog, read, { samples: 0 }));
    const c = copy(all[0]); c.parameters.source_evidence['cmds/skill/exert.c'] = '0'.repeat(64);
    assert.throws(() => validate(fixture(c), c));
    const wrongEntry = copy(all[0]); wrongEntry.entry_id = 'kungfu/skill/force/lifeheal.c:6:exert';
    assert.throws(() => validate(fixture(wrongEntry), wrongEntry));
});

test('lifeheal keeps raw effective/current qi and separate add/clamp resource events', () => {
    for (const f of ['shenghuo-xinfa', 'shenghuo-shengong']) {
        for (const [l, qi, eff] of [[200, 5110, 5160], [400, 5210, 5310], [800, 5410, 5610]]) {
            const c = pick(`${f}-lifeheal-l${l}`), r = fixture(c); validate(r, c);
            assert.equal(r.after[1].qi, qi); assert.equal(r.after[1].eff_qi, eff);
        }
        const c = pick(`${f}-lifeheal-l200-small-wound`), r = fixture(c); validate(r, c);
        assert.equal(r.metrics[1].qi_recovery, 110); assert.equal(r.metrics[1].qi_cost, 109);
        assert.equal(r.after[1].qi - r.before[1].qi, 1);
        bad(c, x => { x.metrics[1].qi_recovery = 1; x.metrics[1].qi_cost = 0; });
        bad(c, x => { x.metrics[1].qi_recovery++; x.metrics[1].qi_cost++; });
        bad(c, x => { x.immediate[1].eff_qi--; x.after = copy(x.immediate); });
    }
});

test('public launch actor/argument/owner and only basic force proficiency must match', () => {
    const c = pick('shenghuo-xinfa-lifeheal-l200');
    bad(c, r => { r.launches[0].skill = 'shenghuo-xinfa'; });
    bad(c, r => { r.launches[0].actor = r.before[1].object; });
    bad(c, r => { r.launches[0].argument = 'recover'; });
    bad(c, r => { r.metrics[0].ability_launched = 0; });
    bad(c, r => { r.immediate[0].learned = { 'shenghuo-xinfa': 1 }; r.after = copy(r.immediate); });
    bad(c, r => { delete r.after[0].learned.force; });
});

test('dispel command acceptance is distinct from actual condition removal or charging', () => {
    for (const f of ['shenghuo-xinfa', 'shenghuo-shengong']) {
        for (const suffix of ['neili299', 'other-neili299', 'other-busy', 'other-fighting']) {
            const c = pick(`${f}-dispel-l200-${suffix}`), r = fixture(c); validate(r, c);
            assert.equal(r.command_accepted, 1); assert.equal(r.metrics[0].neili_cost, 0);
            bad(c, x => { x.metrics[0].neili_cost = 1; });
        }
        assert.equal(fixture(pick(`${f}-dispel-l200-minimum`)).metrics[0].neili_cost, 100);
        assert.equal(fixture(pick(`${f}-dispel-l200-other-minimum`)).metrics[0].neili_cost, 250);
    }
});

test('power chooses only highest mapped effective skill and consumes the whole current pool', () => {
    for (const suffix of ['sword-highest', 'sword-tie', 'sword-unmapped']) {
        const c = pick('shenghuo-shengong-power-l200-' + suffix), r = fixture(c); validate(r, c);
        assert.equal(c.parameters.power_selected, suffix === 'sword-highest' ? 'sword' : 'force');
        assert.equal(r.metrics[0].neili_cost, 6000);
        bad(c, x => { x.metrics[0].neili_cost = 100; });
    }
    bad(pick('shenghuo-xinfa-power-l200-fighting'), r => { r.immediate[0].busy = 1; r.after = copy(r.immediate); });
});

test('tianmo validates four independent losses, mapping bonuses and exact experiment attributes', () => {
    const c = pick('shenghuo-shengong-tianmo-l400-sword-map'), r = fixture(c); validate(r, c);
    assert.equal(r.after[0].temp.apply.force, 76); assert.equal(r.after[0].temp.apply.sword, 76);
    assert.equal(r.metrics[0].neili_cost, 8000);
    assert.equal(pick('shenghuo-xinfa-tianmo-l400-str30-con29').parameters.expected, 'observed');
    assert.equal(pick('shenghuo-xinfa-tianmo-l400-both-attributes29').parameters.expected, 'refused');
    bad(c, x => { x.metrics[0].eff_jing_cost = 0; });
    bad(c, x => { x.immediate[0].temp.apply.sword = 0; x.after = copy(x.immediate); });
});

test('roar and shot refuse the actual whitelist, not arbitrary failure or missing events', () => {
    for (const f of ['shenghuo-xinfa', 'shenghuo-shengong']) for (const ability of ['roar', 'shot']) {
        const c = pick(`${f}-${ability}-l800`); validate(fixture(c), c);
        bad(c, r => { r.reason = '你想攻击谁？'; });
        bad(c, r => { r.reason = ''; });
        bad(c, r => { r.command_accepted = 1; });
        bad(c, r => { r.launches.push({ actor: r.before[0].object, skill: 'force', argument: ability }); });
    }
});

test('missing observations, false USERs, unknown metrics, callbacks and heartbeats are rejected', () => {
    const c = pick('shenghuo-xinfa-lifeheal-l200');
    for (const key of ['metrics', 'launches', 'callbacks', 'terminals', 'index', 'kind']) bad(c, r => { delete r[key]; });
    bad(c, r => { delete r.before[0].userp; });
    bad(c, r => { r.before[0].wizardp = 1; });
    bad(c, r => { r.before[0].object = '/tests/teaching_actor#1'; });
    bad(c, r => { delete r.before[0].effective_skills.force; });
    bad(c, r => { delete r.before[0].cultivation.character; });
    bad(c, r => { r.metrics[0].jing_cost = null; });
    bad(c, r => { r.metrics[0].heartbeats = 1; });
    bad(c, r => { r.metrics[0].made_up = 1; });
    bad(c, r => { r.callbacks.push({ side: 0 }); });
    bad(c, r => { r.terminals.push({ side: 0, state: 'unconscious' }); });
    bad(c, r => { r.before[0].conditions = { illness: 1 }; });
    bad(c, r => { r.before[0].temp.power = 1; });
    bad(c, r => { r.immediate[0].temp.powerup = 1; r.after = copy(r.immediate); });
    bad(c, r => { r.immediate[1].temp.apply.armor = 101; r.after = copy(r.immediate); });
    bad(c, r => { r.immediate[0].gender = '无性'; r.after = copy(r.immediate); });
});

test('changed finite parameters, unknown methods and invalid metadata never count as success', () => {
    const c = pick('shenghuo-xinfa-lifeheal-l200'), changed = copy(c);
    changed.parameters.actor.properties.neili = 9999; assert.throws(() => validate(fixture(changed), changed));
    bad(c, r => { r.method = 'interface'; });
    bad(c, r => { r.condition_id = 'other'; });
    bad(c, r => { r.index = c.samples; });
    const error = { kind: 'sample', condition_id: c.id, index: 0, method: c.method, outcome: 'error' };
    validate(error, c); assert.throws(() => validate({ ...error, condition_id: 'other' }, c));
});
