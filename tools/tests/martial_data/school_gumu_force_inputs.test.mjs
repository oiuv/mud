import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createSeries, openSeries, digest } from './ledger.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { validateExpectedOutcomes } from './execution.mjs';
import { gumuWeapons, gumuWeaponConditions } from './school_gumu_weapons_cases.mjs';
import { gumuForceInputConditions, gumuForceInputVariants, gumuForceInputReviewed } from './school_gumu_force_inputs_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const ids = [...new Set(gumuWeapons.flatMap(d => [d.skill, d.force ?? 'yunv-xinjing', d.dodge ?? 'yunv-shenfa']))];
const skills = ids.map(id => {
    const path = `kungfu/skill/${id}.c`;
    return { id, path, sha256: hash(readFileSync(join(root, path), 'utf8')), entries: [] };
});
const fingerprint = digest(skills.map(s => ({ path: s.path, sha256: s.sha256 })));
const catalog = { skills, source_fingerprint: fingerprint, dictionary_sha256: '0'.repeat(64) };
const cases = gumuForceInputConditions(catalog), smoke = gumuForceInputConditions(catalog, { smoke: true });

test('12个独立单变量对照固定1200正式及24烟雾，不代表已触发或实测', () => {
    assert.equal(cases.length, 12); assert.equal(smoke.length, 12);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1200);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 24);
    assert.equal(new Set(cases.map(c => c.id)).size, 12);
    for (const [i, c] of cases.entries()) {
        assert.equal(c.method, 'interface'); assert.equal(c.status, 'configured_not_executed');
        assert.equal(c.parameters.collection_group, 'gumu-weapons');
        assert.equal(c.parameters.expected, 'observed');
        assert.deepEqual({ ...c, samples: 2 }, smoke[i]);
    }
});

test('800级真实触发支持区间、口诀和配装保留，不降低目标基本功来强造命中', () => {
    for (const c of cases) {
        const p = c.parameters, actor = p.actor, target = p.target;
        assert.equal(p.level, 800); assert.equal(actor.skills.force, 800);
        assert.equal(actor.skills['yunv-xinjing'], 800);
        assert.equal(actor.mappings.force, 'yunv-xinjing');
        assert.equal(actor.properties['can_learn/yunv-xinjing/wall'], 1);
        assert.equal(target.skills.force, 600);
        assert.equal(target.skills.parry, 600);
        assert.equal(p.interface.object, '/kungfu/skill/yunv-xinjing');
        assert.equal(p.interface.function, 'hit_ob');
        assert.equal(p.fighting, false); assert.equal(p.observe_seconds, 0);
        const effectiveCon = target.properties.con + Math.trunc(target.skills.force / 10);
        assert.ok(Math.trunc((800 / 2 + 800) / 6) - 1 >= effectiveCon);
        assert.ok(effectiveCon > 0, '先天零不伪造有效零');
    }
});

test('每个新条件只变一个目标变量；两条基准与原800级条件完整同源', () => {
    const old = gumuWeaponConditions(catalog), original = JSON.stringify(old);
    for (const skill of ['suxin-jian', 'yinsuo-jinling']) {
        const baseline = old.find(c => c.id === `school-gumu-weapons-${skill}-force-level800`);
        for (const variant of gumuForceInputVariants) {
            const c = structuredClone(cases.find(c => c.id === `school-gumu-force-inputs-${skill}-${variant}`));
            c.id = baseline.id; delete c.status;
            c.parameters.qualification_note = baseline.parameters.qualification_note;
            if (variant.startsWith('damage')) c.parameters.interface.damage = 200;
            if (variant === 'factor100000') c.parameters.interface.factor = 0;
            if (variant === 'neili300') c.parameters.actor.properties.neili = 6000;
            if (variant === 'con0') c.parameters.target.properties.con = 36;
            assert.deepEqual(c, baseline);
        }
    }
    assert.equal(JSON.stringify(old), original);
    assert.equal(JSON.stringify(gumuWeaponConditions(catalog)), original);
});

test('原命中源码变化、缺源或无效烟雾选项均停止，不静默改预期', () => {
    assert.equal(skills.find(s => s.id === 'yunv-xinjing').sha256, gumuForceInputReviewed);
    const wrong = structuredClone(catalog); wrong.skills.find(s => s.id === 'yunv-xinjing').sha256 = '0'.repeat(64);
    assert.throws(() => gumuForceInputConditions(wrong), /重新核对/);
    assert.throws(() => gumuForceInputConditions({ skills: [] }), /重新核对/);
    assert.throws(() => gumuForceInputConditions(catalog, { smoke: 'true' }));
});

test('实际建档与重开核验12条件；非法ID和源码入口仍拒绝，无驱动或正式样本', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-force-inputs-unit-'));
    try {
        const input = { inventory: { source_fingerprint: fingerprint, versions: { synthetic: true } }, catalog,
            conditions: cases, execution: { synthetic: true, driver_started: false } };
        const manifest = createSeries(directory, input);
        assert.deepEqual(openSeries(directory).identity.conditions, cases);
        assert.equal(openSeries(directory).fingerprint, manifest.fingerprint);
        createSeries(join(directory, 'smoke'), { ...input, conditions: smoke });
        assert.deepEqual(openSeries(join(directory, 'smoke')).identity.conditions, smoke);
        const invalid = structuredClone(input); invalid.conditions[0].id += '.';
        assert.throws(() => createSeries(join(directory, 'invalid'), invalid), /条件 ID/);
        invalid.conditions[0].id = cases[0].id; invalid.conditions[0].entry_id += '-invalid';
        assert.throws(() => createSeries(join(directory, 'invalid-entry'), invalid), /入口不在源码/);
    } finally {
        assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'mud-gumu-force-inputs-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('实际总入口只尾追加12条件；旧15665正式/烟雾完整指纹不变，报告复用原跨加载校验', () => {
    const inventory = buildInventory(root), fullCatalog = collectCatalog(root, inventory);
    for (const [isSmoke, count, oldSha] of [
        [false, 406756, '5e351aa94802a292e16f2410723c25f079bf689b70e5e01396eacc12ba2577b3'],
        [true, 25855, '7f2a79ddcd76933c49e64eb51a964c16ff40c06e8ebc52b71f555657732ebe8f'],
    ]) {
        const all = schoolCombatConditions(fullCatalog, { smoke: isSmoke }), prior = all.slice(0, 15665);
        const added = isSmoke ? smoke : cases;
        assert.equal(prior.length, 15665); assert.equal(prior.reduce((n, c) => n + c.samples, 0), count);
        assert.equal(hash(prior), oldSha);
        const throughThisGroup = all.slice(0, 15677);
        assert.equal(throughThisGroup.length, 15677); assert.deepEqual(throughThisGroup.slice(15665), added);
        assert.equal(throughThisGroup.reduce((n, c) => n + c.samples, 0), count + (isSmoke ? 24 : 1200));
        validateExpectedOutcomes(added);
        // Strict reports intentionally accept formal plans, not smoke as formal evidence.
        if (!isSmoke) validateSchoolCombatPlan(added, fullCatalog);
    }
    const wrong = structuredClone(cases); wrong[0].parameters.actor.properties.neili++;
    assert.throws(() => validateSchoolCombatPlan(wrong, fullCatalog), /不同|不符/);
    const execution = readFileSync(join(root, 'tools/tests/martial_data/execution.mjs'), 'utf8');
    for (const name of ['school_gumu_force_inputs_cases.mjs', 'school_gumu_force_inputs.test.mjs'])
        assert.ok(execution.includes(name), name);
    const report = readFileSync(join(root, 'tools/tests/martial_data/school_combat_report.mjs'), 'utf8');
    assert.ok(report.includes("r.condition_id?.startsWith('school-gumu-force-inputs-')"));
});
