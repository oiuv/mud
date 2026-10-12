// Additional weapon conditions, kept separate from the frozen neutral series.
// Uses the shared driver executor; no alteration of the existing neutral data.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';
import { weaponConditions } from './weapon_cases.mjs';

const reviewed = {
    'kungfu/skill/chanhun-suo/duo.c': '9cb0c153d1b0d87f6b8459471e73d9a88859e75eb91f92fdfcf78fd90b078b26',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
};

export function weaponSpecialConditions(catalog, { smoke = false, samples = 100 } = {}) {
    for (const [path, hash] of Object.entries(reviewed)) {
        assert.equal(sha256(readFileSync(join(root, path))), hash, '特殊兵器条件来源改变：' + path);
    }
    assert.ok(Number.isSafeInteger(samples) && samples > 0, '样本数须为正整数');
    const originals = weaponConditions(catalog, { level: 200, samples });
    const conditions = [];
    for (const jiali of [0, 50]) {
        const original = originals.find(c => c.id === `whip-perform-l200-j${jiali}`);
        assert.ok(original, '缺少原鞭类条件');
        for (const material of ['plain', 'silk']) {
            const condition = structuredClone(original);
            condition.id = `whip-material-${material}-l200-j${jiali}`;
            condition.samples = smoke ? 2 : samples;
            const p = condition.parameters;
            // Applied to the test item before wield(), never to a game object.
            p.actor.equipment.properties = material === 'silk' ? { material: 'white silk' } : {};
            p.qualification_sources = [...new Set([...p.qualification_sources, ...Object.keys(reviewed)])];
            p.qualification_evidence = { ...reviewed };
            p.note = '独立材质对照：只改变实验鞭的 material；等级、目标、装备伤害和重量不变。'
                + '不添加毒技或改随机，不与旧中性系列混算；命中、控制及两种扣费分别观察。';
            conditions.push(condition);
        }
    }
    return conditions;
}

function busy(state) {
    assert.ok(state && Object.hasOwn(state, 'busy'), '缺少忙乱观察');
    // The existing snapshot encodes an uninitialized integer busy as null.
    if (state.busy === null) return 0;
    assert.ok(Number.isSafeInteger(state.busy) && state.busy >= 0, '忙乱观察不是已知整数');
    return state.busy;
}

// Branch checks preserve random outcomes; no prescribed hit/control rate.
export function validateWeaponSpecialRecord(raw, condition) {
    assert.equal(condition.method, 'perform');
    assert.equal(raw.method, 'perform');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.outcome, 'observed');
    const p = condition.parameters;
    const material = p.actor.equipment.properties.material;
    const initial = raw.before?.[0], target = raw.before?.[1];
    assert.ok(initial && target, '缺少双方初态');
    assert.ok(Object.hasOwn(initial.weapon_details, 'material'), '缺少实际材质');
    if (material) assert.equal(initial.weapon_details.material, material);
    else assert.ok(initial.weapon_details.material === null || initial.weapon_details.material === 0,
        '中性鞭不应额外获得材质');
    assert.equal(initial.weapon_details.program, '/tests/whip');
    assert.equal(initial.weapon_details.damage, 50);
    assert.equal(initial.weapon_details.weight, 3000);
    assert.equal(initial.effective_skills.whip, 300);
    assert.equal(initial.effective_skills.force, 300);
    assert.equal(initial.skills.poison ?? 0, 0);
    assert.equal(target.effective_skills.force, 300);
    assert.equal(target.effective_skills.parry, 300);
    assert.equal(target.skills['martial-cognize'] ?? 0, 0);
    assert.equal(initial.jiali, p.actor.properties.jiali);
    assert.equal(busy(target), 0);
    assert.ok(Array.isArray(raw.launches) && raw.launches.length === 1, '须有单次真实发动证据');
    assert.equal(raw.launches[0].skill, 'chanhun-suo');
    assert.ok(raw.metrics?.[0] && raw.metrics?.[1], '缺少资源／事件观察');
    const cost = raw.metrics[0].neili_cost;
    // do_damage applies jiali only in the successful damage branch, even with
    // no special force mapping; the miss branch spends exactly 100.
    const hit = cost === 180 + initial.jiali;
    assert.ok(hit || cost === 100, '夺魂势扣费与已核对分支不符');
    assert.equal(raw.metrics[0].direct ?? 0, hit ? 1 : 0, '直接结算与扣费分支不一致');
    assert.equal(busy(raw.immediate?.[0]), hit ? 2 : 3);
    const targetBusy = busy(raw.immediate?.[1]);
    if (!hit || material !== 'white silk') assert.equal(targetBusy, 0, '没有白绸命中条件却产生控制');
    else assert.ok(targetBusy >= 0 && targetBusy <= 4, '白绸控制须保留原随机范围');
    if (hit) assert.ok(raw.metrics[1].qi_cost > 0, '直接结算缺少目标支出');
    else assert.equal(raw.metrics[1].qi_cost ?? 0, 0, '闪开分支不应造成伤害');
    return { hit, controlled: targetBusy > 0, initial_busy: targetBusy };
}
