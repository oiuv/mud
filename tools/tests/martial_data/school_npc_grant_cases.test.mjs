import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    npcGrantPerformConditions,
    npcGrantSourcePaths,
    validateNpcGrantPerformRecord,
} from './school_npc_grant_cases.mjs';
import { pointRecord, canheYouRecord } from './observed_effects_test_fixture.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const readSource = path => readFileSync(join(root, path), 'utf8');
const formal = npcGrantPerformConditions(catalog, readSource);
const smoke = npcGrantPerformConditions(catalog, readSource, { smoke: true });

function observedRaw(condition) {
    return condition.parameters.expected === 'refused' ? pointRecord(condition) : canheYouRecord(condition);
}

test('NPC 授技绝招按授予与否成对建条件，全部落在 b30-perform 组', () => {
    assert.ok(formal.length > 0);
    assert.equal(formal.length, smoke.length);
    assert.equal(new Set(formal.map(c => c.id)).size, formal.length);
    assert.equal(new Set(smoke.map(c => c.id)).size, smoke.length);
    for (const c of formal) {
        assert.equal(c.parameters.collection_group, 'b30-perform');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.ok(['observed', 'refused'].includes(c.parameters.expected));
        assert.ok(c.parameters.qualification_note.length > 0);
        assert.ok(c.parameters.action.startsWith('perform '));
        // 自映射（force→force 等）会触发 runner "effective skill mapping" 校验失败
        const map = c.parameters.actor.mappings;
        for (const [key, value] of Object.entries(map)) {
            assert.notEqual(value, key, `${c.id}: self-mapping ${key}`);
        }
        assert.equal(map[c.parameters.usage], c.parameters.skill, c.id);
    }
    // 每个绝招必须同时有授予正例与未授予反例（检查 can_perform 的绝招）
    // 不检查 can_perform 的绝招只有授予正例
    const noGrantCheck = new Set(['fireice-strike/binghuo', 'houquan/zhen', 'jingzhong-bafa/bafa',
        'kuangfeng-blade/kuang', 'luohan-gun/shibaluohan', 'shou-yin/jie', 'xuanfeng-leg/kuangfeng', 'zijinbagua-dao/bagua']);
    const bySkillMove = new Map();
    for (const c of formal) {
        const key = `${c.parameters.skill}/${c.parameters.ability}`;
        if (!bySkillMove.has(key)) bySkillMove.set(key, new Set());
        bySkillMove.get(key).add(c.parameters.expected);
    }
    assert.ok(bySkillMove.size > 0);
    for (const [key, expecteds] of bySkillMove) {
        if (noGrantCheck.has(key)) {
            assert.deepEqual([...expecteds].sort(), ['observed'], key);
        } else {
            assert.deepEqual([...expecteds].sort(), ['observed', 'refused'], key);
        }
    }
});

test('NPC 授技条件绑定源码哈希，缺失证据不得建条件', () => {
    for (const c of formal) {
        const p = c.parameters;
        assert.ok(p.ability_source?.path, c.id);
        assert.equal(p.ability_source.sha256.length, 64, c.id);
        assert.ok(p.ability_source.entry_id.length > 0, c.id);
        for (const path of p.qualification_sources) {
            assert.ok(p.source_evidence[path], `${c.id}: ${path}`);
            assert.equal(p.source_evidence[path].length, 64, `${c.id}: ${path}`);
        }
    }
    assert.ok(npcGrantSourcePaths.length > 0);
    // 共享教师文件会在多个绝招间重复出现，只要求每条路径都能解析出哈希
    const uniquePaths = new Set(npcGrantSourcePaths);
    assert.ok(uniquePaths.size > 0 && uniquePaths.size <= npcGrantSourcePaths.length);
    for (const path of uniquePaths) {
        assert.ok(formal[0].parameters.source_evidence[path], path);
        assert.equal(formal[0].parameters.source_evidence[path].length, 64, path);
    }
});

test('烟雾条件样本数固定为 2，不冒充正式采样量', () => {
    for (const c of smoke) assert.equal(c.samples, 2);
    for (const c of formal) assert.equal(c.samples,
        c.parameters.expected === 'refused' || c.parameters.ability === 'shibaluohan' ? 2 : 100);
});

test('校验器接受与条件一致的记录，拒绝组名/结果/发动数不符', () => {
    for (const c of formal.filter(c => c.parameters.expected === 'refused'
        || c.parameters.skill === 'canhe-zhi')) {
        validateNpcGrantPerformRecord(observedRaw(c), c);
    }
    const sample = formal.find(c => c.parameters.skill === 'canhe-zhi' && c.parameters.expected === 'observed');
    const refused = formal.find(c => c.parameters.expected === 'refused');

    assert.throws(() => validateNpcGrantPerformRecord(observedRaw(sample), {
        ...sample,
        parameters: { ...sample.parameters, collection_group: 'npc-grant-perform' },
    }), /b30-perform/);

    assert.throws(() => validateNpcGrantPerformRecord(
        { ...observedRaw(sample), outcome: 'refused' }, sample));

    assert.throws(() => validateNpcGrantPerformRecord(
        { ...observedRaw(sample), launches: [] }, sample));

    assert.throws(() => validateNpcGrantPerformRecord(observedRaw(refused), {
        ...refused,
        parameters: { ...refused.parameters, expected: 'observed' },
    }));
});

test('拒绝分支不得记发动与费用，观察分支须记实际发动技能', () => {
    const refused = formal.find(c => c.parameters.expected === 'refused');
    const raw = observedRaw(refused);
    assert.equal(raw.launches.length, 0);
    assert.equal(raw.metrics[0].neili_cost, 0);
    assert.throws(() => validateNpcGrantPerformRecord(
        { ...raw, metrics: [{ neili_cost: 30 }] }, refused));

    const observed = formal.find(c => c.parameters.skill === 'canhe-zhi' && c.parameters.expected === 'observed');
    const wrongSkill = observedRaw(observed);
    wrongSkill.launches[0].skill = 'wrong-skill';
    assert.throws(() => validateNpcGrantPerformRecord(wrongSkill, observed), /wrong-skill/);
});

test('参合指必须扣除源码规定的 300 内力，不能只检查非零或 >=10', () => {
    const c = formal.find(c => c.parameters.skill === 'canhe-zhi' && c.parameters.expected === 'observed');
    for (const fee of [0, 1, 10, 299, 301]) {
        const raw = canheYouRecord(c);
        raw.metrics[0].neili_cost = fee;
        raw.after[0].neili = raw.before[0].neili - fee;
        assert.throws(() => validateNpcGrantPerformRecord(raw, c), /canhe extra query_action count/);
    }
});

test('参合连击总费用包含可核对的选招及命中被动，不能将总费固定为 300', () => {
    const c = formal.find(c => c.parameters.skill === 'canhe-zhi' && c.parameters.expected === 'observed');
    const raw = canheYouRecord(c);
    raw.metrics[0].neili_cost = 680; raw.after[0].neili = raw.before[0].neili - 680;
    raw.passives = [{ skill: 'canhe-zhi', actor: 0, target: 1, route: 'martial', incoming: 287, result: '嗤嗤嗤' }];
    validateNpcGrantPerformRecord(raw, c);
    const missing = structuredClone(raw); missing.passives = [];
    assert.throws(() => validateNpcGrantPerformRecord(missing, c));
    const tooMany = structuredClone(raw); tooMany.metrics[0].neili_cost += 1800;
    tooMany.after[0].neili -= 1800;
    assert.throws(() => validateNpcGrantPerformRecord(tooMany, c));
    const version = structuredClone(c); version.parameters.effect_dependencies[0].sha256 = '0'.repeat(64);
    assert.throws(() => validateNpcGrantPerformRecord(raw, version), /passive source version/);
});

test('拒绝源码版本漂移、错误初始属性和伪造有效等级', () => {
    const c = formal.find(c => c.parameters.skill === 'canhe-zhi' && c.parameters.expected === 'observed');
    const version = structuredClone(c);
    version.parameters.ability_source.sha256 = '0'.repeat(64);
    assert.throws(() => validateNpcGrantPerformRecord(canheYouRecord(c), version), /source version/);
    const initial = canheYouRecord(c);
    initial.before[0].str++;
    assert.throws(() => validateNpcGrantPerformRecord(initial, c), /initial str/);
    const effective = canheYouRecord(c);
    effective.before[0].effective_skills.finger++;
    assert.throws(() => validateNpcGrantPerformRecord(effective, c), /effective skill/);
});
