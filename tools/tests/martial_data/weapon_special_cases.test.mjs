import assert from 'node:assert/strict';
import test from 'node:test';
import { root, parseArgs } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { weaponConditions } from './weapon_cases.mjs';
import { weaponSpecialConditions, validateWeaponSpecialRecord } from './weapon_special_cases.mjs';
import { summarizeMaterialSamples, materialMarkdown } from './weapon_special_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const conditions = weaponSpecialConditions(catalog);

test('材质入口复用原 CLI 参数，不接受改变固定等级或输入命令', () => {
    assert.equal(parseArgs(['weapon-special', '--smoke']).smoke, true);
    assert.equal(parseArgs(['weapon-special', '--samples', '100']).samples, 100);
    assert.equal(parseArgs(['weapon-special', '--case', 'whip-material-silk-l200-j0']).case,
        'whip-material-silk-l200-j0');
    assert.throws(() => parseArgs(['weapon-special', '--level', '400']), /无效/);
    assert.throws(() => parseArgs(['weapon-special', '--samples', '0']), /正整数/);
    assert.throws(() => parseArgs(['weapon-special', '--case', '../unsafe']), /条件 ID/);
});

test('白绸对照保留原四条件身份，除材质外不更改中性战斗配置', () => {
    assert.equal(conditions.length, 4);
    assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 400);
    assert.equal(new Set(conditions.map(c => c.id)).size, 4);
    const originals = weaponConditions(catalog);
    for (const condition of conditions) {
        const p = condition.parameters;
        const source = originals.find(c => c.id === `whip-perform-l200-j${p.actor.properties.jiali}`);
        const copy = structuredClone(p.actor);
        const properties = copy.equipment.properties;
        delete copy.equipment.properties;
        assert.deepEqual(copy, source.parameters.actor);
        assert.deepEqual(p.target, source.parameters.target);
        assert.deepEqual(properties, condition.id.includes('-silk-') ? { material: 'white silk' } : {});
        assert.equal(condition.entry_id, source.entry_id);
        assert.equal(condition.stage, 'weapon');
        assert.equal(p.observe_seconds, 0);
        assert.equal(p.expected, 'observed');
        assert.ok(p.qualification_sources.includes('adm/daemons/combatd.c'));
        assert.equal(p.qualification_evidence['kungfu/skill/chanhun-suo/duo.c'].length, 64);
    }
    assert.equal(weaponSpecialConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 8);
    assert.throws(() => weaponSpecialConditions(catalog, { samples: 0 }), /正整数/);
});

// Artificial observations validate the reader only, not the game branch.
function observation(condition, hit, targetBusy = 0) {
    const p = condition.parameters;
    return {
        condition_id: condition.id, method: 'perform', outcome: 'observed',
        before: [{ skills: {}, effective_skills: { whip: 300, force: 300 },
            weapon_details: { program: '/tests/whip', material: p.actor.equipment.properties.material ?? null,
                damage: 50, weight: 3000 }, jiali: p.actor.properties.jiali },
        { skills: {}, effective_skills: { force: 300, parry: 300 }, busy: null }],
        immediate: [{ busy: hit ? 2 : 3 }, { busy: targetBusy }],
        launches: [{ skill: 'chanhun-suo' }],
        metrics: [{ neili_cost: hit ? 180 + p.actor.properties.jiali : 100, ...(hit ? { direct: 1 } : {}) },
            hit ? { qi_cost: 900 } : {}],
    };
}

test('命中和控制分开，白绸不强制每次控制；加力只随直接结算扣除', () => {
    for (const condition of conditions) {
        assert.deepEqual(validateWeaponSpecialRecord(observation(condition, false), condition),
            { hit: false, controlled: false, initial_busy: 0 });
        assert.deepEqual(validateWeaponSpecialRecord(observation(condition, true), condition),
            { hit: true, controlled: false, initial_busy: 0 });
        if (condition.id.includes('-silk-')) {
            for (const seconds of [1, 4]) assert.deepEqual(
                validateWeaponSpecialRecord(observation(condition, true, seconds), condition),
                { hit: true, controlled: true, initial_busy: seconds });
        }
    }
});

test('拒绝缺材质、错费用、额外毒技、伪造控制或缺发动的人工记录', () => {
    const silk = conditions.find(c => c.id === 'whip-material-silk-l200-j50');
    const plain = conditions.find(c => c.id === 'whip-material-plain-l200-j0');
    const mutations = [
        r => { delete r.before[0].weapon_details.material; },
        r => { r.before[0].weapon_details.material = 'steel'; },
        r => { r.before[0].weapon_details.damage = 55; },
        r => { r.before[0].skills.poison = 200; },
        r => { r.before[1].skills['martial-cognize'] = 200; },
        r => { r.metrics[0].neili_cost = 180; },
        r => { r.metrics[0].direct = 0; },
        r => { r.immediate[1].busy = 5; },
        r => { delete r.immediate[1].busy; },
        r => { r.launches = []; },
        r => { r.metrics = []; },
    ];
    for (const change of mutations) {
        const raw = observation(silk, true, 2); change(raw);
        assert.throws(() => validateWeaponSpecialRecord(raw, silk));
    }
    assert.throws(() => validateWeaponSpecialRecord(observation(plain, true, 1), plain), /控制/);
    assert.throws(() => validateWeaponSpecialRecord(observation(silk, false, 1), silk), /控制/);
});

test('材质报告分别统计命中和控制分母，无命中时条件控制率未知', () => {
    const selected = structuredClone(conditions);
    selected.forEach(c => { c.samples = 4; });
    const manifest = { fingerprint: 'artificial-only', versions: {}, identity: {
        execution: { smoke: false }, conditions: selected } };
    const rows = selected.flatMap(c => Array.from({ length: 4 }, (_, index) => ({
        condition_id: c.id, index, outcome: 'observed', raw_sha256: c.id + index,
        raw: observation(c, c.id.includes('-j0') && index > 0,
            c.id.includes('-silk-') && c.id.includes('-j0') && index === 3 ? 2 : 0),
    })));
    const report = summarizeMaterialSamples(manifest, rows);
    const silk = report.conditions.find(c => c.id === 'whip-material-silk-l200-j0');
    assert.equal(silk.damage_branch.rate, 3 / 4);
    assert.equal(silk.control.rate, 1 / 4);
    assert.equal(silk.control_given_hit.rate, 1 / 3);
    assert.equal(silk.controlled_target_busy.mean, 2);
    assert.equal(silk.initial_target_busy.mean, 0.5);
    const plain = report.conditions.find(c => c.id === 'whip-material-plain-l200-j0');
    assert.equal(plain.control.rate, 0);
    assert.equal(plain.control_given_hit.rate, 0);
    assert.equal(plain.controlled_target_busy.mean, null);
    const noHits = report.conditions.find(c => c.id === 'whip-material-silk-l200-j50');
    assert.equal(noHits.control.rate, 0);
    assert.equal(noHits.control_given_hit.rate, null);
    assert.equal(noHits.control_given_hit.trials, 0);
    assert.throws(() => summarizeMaterialSamples(manifest, rows.slice(1)), /未采满/);
    const duplicate = [...rows]; duplicate[1] = duplicate[0];
    assert.throws(() => summarizeMaterialSamples(manifest, duplicate), /重复/);
    const text = materialMarkdown({ ...report, evidence_sha256: 'artificial-only' });
    assert.match(text, /控制 \/ 命中/);
    assert.match(text, /零次命中时.*未知/);
    assert.match(text, /不冒充完整持续时间/);
});
