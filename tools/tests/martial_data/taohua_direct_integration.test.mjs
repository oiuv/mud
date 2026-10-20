import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoJiuyangFusionProbes, restoreMingjiaoJiuyangFusionProbes }
    from './school_mingjiao_jiuyang_fusion_probes.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { taohuaDirectConditions, taohuaDirectMoves, taohuaDirectSourcePaths,
    taohuaDirectBounds, validateTaohuaDirectRecord } from './school_taohua_direct_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const conditions = taohuaDirectConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);
const body = (source, name) => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(match, 'actual definition: ' + name);
    const end = source.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return source.slice(match.index, end + 3);
};

// Synthetic consumer fixtures only: no driver runs, sample files or measured results.
function actorSnapshot(config, side) {
    const equipped = !!config.equipment;
    const qualification = key => key.includes('/') || key === 'character';
    const apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const unarmed = Math.max(...['unarmed', 'finger', 'strike', 'hand', 'claw', 'cuff']
        .map(key => config.skills[key] ?? 0));
    return {
        ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualification(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualification(key))),
        object: `/tests/actor#${side + 100}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1,
        busy: null, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, temp: { apply },
        effective_str: config.properties.str + Math.trunc(unarmed / 10),
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, level]) => [key,
            Math.trunc(level / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { object: `/tests/sword#${side + 200}`, program: '/tests/sword',
            skill_type: 'sword', damage: 50, flag: 4, weight: 3000, consistence: 100,
            material: null, rigidity: null, no_wield: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {},
    };
}

function syntheticRecord(condition) {
    const p = condition.parameters;
    const move = taohuaDirectMoves.find(d => d.skill === p.skill && d.ability === p.ability);
    const accepted = p.expected === 'observed';
    const before = [actorSnapshot(p.actor, 0), actorSnapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: p.expected,
        command_accepted: accepted ? 23 : 0, before, immediate: structuredClone(before), after: [],
        metrics: [{}, {}], launches: [], refusals: [], directs: [], attacks: [], dropped: [], terminals: [],
        callbacks: [], passives: [], defenses: [], interfaces: [], dodge_checks: [], reason: '', elapsed: 0.01 };
    if (accepted) {
        const bounds = taohuaDirectBounds(...before, move);
        const hit = bounds.hit_numerator > 0;
        raw.launches.push({ actor: before[0].object, skill: move.skill, argument: move.ability + ' right' });
        raw.metrics[0].ability_launched = 1;
        raw.metrics[0].neili_cost = hit ? move.hitFee : move.missFee;
        raw.immediate[0].neili -= raw.metrics[0].neili_cost;
        raw.immediate[0].busy = hit || move.ability === 'tian' ? 2 : 3;
        raw.immediate[0].learned[move.skill] = 1;
        if (hit) {
            const input = bounds.input_min;
            raw.directs.push({ actor: 0, target: 1, type: move.usage === 'sword' ? 1 : 0,
                damage: input, percent: move.percent, weapon: move.usage === 'sword' ? 'sword' : 'none',
                weapon_object: move.usage === 'sword' ? before[0].weapon_details.object : '' });
            raw.metrics[0].direct = 1;
            // Same finite neutral branch as the isolated module tests, not a damage oracle.
            let damage = input + (move.usage === 'sword' ? 50 : 0);
            const strength = before[0].str * 2 + before[0].effective_str;
            damage += Math.trunc(damage * (Math.trunc((strength - 60) / 4) + 30) / 50);
            if (damage > 1500) damage = Math.trunc((damage - 1500) / 4) + 1000;
            else if (damage > 500) damage = Math.trunc((damage - 500) / 2) + 500;
            let wound = Math.trunc(damage * move.percent / 100);
            wound -= Math.trunc(wound * 20 / 100);
            wound -= Math.trunc(wound * 26 / 100);
            Object.assign(raw.metrics[1], { qi_cost: damage, eff_qi_cost: wound });
            raw.immediate[1].qi -= damage;
            raw.immediate[1].eff_qi -= wound;
            if (move.ability === 'zhuan') raw.immediate[1].busy = 2;
        }
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
        raw.immediate[0].temp.notify_fail = raw.reason;
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('旧15812完整有序条件不变，仅尾追加四门直伤41条件1650/41', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke })
            .filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['taohua-control', 'taohua-attack', 'taohua-combo', 'taohua-bihai', 'taohua-passive', 'taohua-combination', 'taohua-force', 'taohua-music', 'taohua-npc', 'mingjiao-core', 'mingjiao-qishang', 'mingjiao-xinfa', 'mingjiao-movement', 'mingjiao-shengong', 'mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group));
        assert.equal(all.length, 15853);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 15812))), smoke
            ? '00b6e1d454b6996563393eb9908109734f6f0e0d96dd29872b35cbe2d6e233a5'
            : '38a0e985b80d4885b476b55b78dbfe7d5c52e5172854732a4efad4e046396369');
        const tail = all.slice(15812);
        assert.deepEqual(tail, taohuaDirectConditions(catalog, read, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? '7d13af9641c8fd82953e97df131662b1e24038e8d41dbf943d89eb6be6f95942'
            : '8014b5cd664eb8ebf146106533b2913e190b5c3347092e4dd924be8073d394b0');
        assert.equal(tail.length, 41);
        assert.equal(tail.reduce((sum, c) => sum + c.samples, 0), smoke ? 41 : 1650);
        assert.ok(tail.every(c => !Object.hasOwn(c.parameters, 'qualification_sources')),
            '本组保留原source_evidence协议，不虚增字段');
    }
});

test('实际冻结新增四文件与既有报告依赖，15文件48位点探针原摘要不变', () => {
    const state = snapshot();
    for (const name of ['school_taohua_direct_cases.mjs', 'school_taohua_direct.test.mjs',
        'taohua_direct_integration.test.mjs', 'school_taohua_direct_report.test.mjs',
        'runner.lpc', 'execution.mjs', 'school_combat_cases.mjs', 'school_combat_report.mjs', 'statistics.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(read(path)), path);
    }
    // Only the separately reviewed yanlian probe is projected out of the old 15/48 baseline.
    const fusionPath = 'cmds/skill/yanlian.c';
    const fusionProbes = state.probes.filter(p => p.path === fusionPath);
    assert.equal(fusionProbes.length, 1);
    const fusionSource = read(fusionPath);
    const prepared = mingjiaoJiuyangFusionProbes(fusionSource, { collectionGroup: 'mingjiao-jiuyang-fusion' });
    assert.equal(prepared.sites.length, 17);
    assert.deepEqual(fusionProbes[0], { path: fusionPath, before: sha256(fusionSource),
        after: sha256(prepared.changed), sites: prepared.sites });
    assert.equal(state.files[fusionPath], sha256(fusionSource));
    assert.equal(restoreMingjiaoJiuyangFusionProbes(prepared.changed), fusionSource);
    for (const name of [
        'school_mingjiao_jiuyang_fusion_cases.mjs',
        'school_mingjiao_jiuyang_fusion_cases.test.mjs',
        'school_mingjiao_jiuyang_fusion_observation.mjs',
        'school_mingjiao_jiuyang_fusion_observation.test.mjs',
        'school_mingjiao_jiuyang_fusion_probes.mjs',
        'school_mingjiao_jiuyang_fusion_probes.test.mjs',
        'school_mingjiao_jiuyang_fusion_record.mjs',
        'school_mingjiao_jiuyang_fusion_record.test.mjs',
        'school_mingjiao_jiuyang_fusion_report.mjs',
        'school_mingjiao_jiuyang_fusion_report.test.mjs',
        'school_mingjiao_jiuyang_fusion_integration.test.mjs',
        'jiuyang_fusion_receivers.h',
    ]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(read(path)), path);
    }
    const historicalProbes = state.probes.filter(p => p.path !== fusionPath);
    assert.equal(historicalProbes.length, 15);
    assert.equal(historicalProbes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(historicalProbes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.equal(taohuaDirectSourcePaths.length, 36);
    assert.equal(new Set(taohuaDirectSourcePaths).size, 36);
    for (const c of conditions) assert.deepEqual(Object.keys(c.parameters.source_evidence), taohuaDirectSourcePaths);
    validateQualificationSources(conditions, state.files);
});

test('36项来源拒绝缺项、多项、坏摘要和实际复制漂移，入口和两来源严格绑定', () => {
    const files = snapshot().files;
    const original = conditions[0];
    for (const path of taohuaDirectSourcePaths) {
        const missing = structuredClone(original);
        delete missing.parameters.source_evidence[path];
        assert.throws(() => validateQualificationSources([missing], files), '缺少 ' + path);
        const malformed = structuredClone(original);
        malformed.parameters.source_evidence[path] = 'not-a-sha256';
        assert.throws(() => validateQualificationSources([malformed], files), '坏摘要 ' + path);
        const changed = structuredClone(original);
        changed.parameters.source_evidence[path] = '0'.repeat(64);
        assert.throws(() => validateQualificationSources([changed], files), '来源漂移 ' + path);
        const absentCopy = { ...files };
        delete absentCopy[path];
        assert.throws(() => validateQualificationSources([original], absentCopy), '未复制 ' + path);
        assert.throws(() => validateQualificationSources([original], { ...files, [path]: '0'.repeat(64) }),
            '副本漂移 ' + path);
    }
    const extra = structuredClone(original);
    extra.parameters.source_evidence['kungfu/skill/unknown.c'] = '0'.repeat(64);
    assert.throws(() => validateQualificationSources([extra], files));
    for (const move of taohuaDirectMoves) {
        const condition = conditions.find(c => c.parameters.skill === move.skill && c.parameters.ability === move.ability);
        for (const mutate of [
            c => { c.parameters.ability_source.sha256 = '0'.repeat(64); },
            c => { c.parameters.base_source.sha256 = '0'.repeat(64); },
            c => { c.parameters.ability_source.path = c.parameters.base_source.path; },
            c => { c.parameters.base_source.path = c.parameters.ability_source.path; },
            c => { c.parameters.ability_source.entry_id += ':wrong'; },
            c => { c.entry_id += ':wrong'; },
        ]) {
            const bad = structuredClone(condition);
            mutate(bad);
            assert.throws(() => validateQualificationSources([bad], files), move.ability);
        }
    }
});

test('41条件原形合成记录经公共、school分派、专用三层消费且不回写', () => {
    for (const condition of conditions) {
        const raw = syntheticRecord(condition);
        const before = JSON.stringify(raw);
        validateRecord(raw, condition);
        const dispatched = validateSchoolCombatRecord(raw, condition);
        const dedicated = validateTaohuaDirectRecord(raw, condition);
        assert.deepEqual(dispatched, dedicated, condition.id);
        assert.equal(dedicated.accepted, condition.parameters.expected === 'observed');
        assert.equal(JSON.stringify(raw), before, '消费者不可改写原记录 ' + condition.id);
    }
});

test('真实公共消费拒绝错物品，school分派保留本组成本和事件身份门禁', () => {
    for (const move of taohuaDirectMoves) {
        const condition = conditions.find(c => c.parameters.skill === move.skill
            && c.parameters.variant === 'low-defense');
        for (const mutate of [
            r => { r.condition_id = 'other'; },
            r => { r.method = 'exert'; },
            r => { r.command_accepted = 0; },
            r => { r.command_accepted = 0.5; },
            r => { delete r.command_accepted; },
            r => { r.directs[0].target = 0; },
            r => { r.directs[0].type = 2; },
            r => { r.metrics[0].direct = 0; },
            r => { r.before[0].cultivation['can_perform/' + move.skill + '/' + move.ability] = 0; },
        ]) {
            const bad = syntheticRecord(condition);
            mutate(bad);
            assert.throws(() => validateSchoolCombatRecord(bad, condition), move.ability);
            assert.throws(() => validateTaohuaDirectRecord(bad, condition), move.ability);
        }
    }
    const armed = conditions.find(c => c.parameters.ability === 'tian' && c.parameters.variant === 'baseline');
    const bad = syntheticRecord(armed);
    bad.before[0].weapon_details.program = '/tests/unknown';
    assert.throws(() => validateRecord(bad, armed), '公共夹具校验仍实际执行');
});

test('runner复用原属性和别名，显式只读四领悟及交战快照并接通direct双名单', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const take = body(runner, 'snapshot');
    assert.match(take, /"gumu-zhi",\s*"gumu-quanzhen",\s*"taohua-direct"/);
    assert.match(take, /result\["fighting_opponent"\] = objectp\(opponent\) && !!ob->is_fighting\(opponent\)/);
    const grantBranch = /if \(current\["parameters"\]\["collection_group"\] == "taohua-direct"\)\s*\{?\s*foreach \(key in \(\{([\s\S]*?)\}\)\)\s*result\["cultivation"\]\[key\] = ob->query\(key\)/.exec(take);
    assert.ok(grantBranch, '本组资格来自实际对象的只读快照');
    assert.deepEqual([...grantBranch[1].matchAll(/"([^"]+)"/g)].map(m => m[1]),
        ['character', ...taohuaDirectMoves.map(d => 'can_perform/' + d.skill + '/' + d.ability)]);
    const prepare = body(runner, 'prepare_actor');
    assert.match(prepare, /current\["parameters"\]\["named_participants"\]/);
    assert.match(prepare, /ob->set_name\([\s\S]*?side \? "right" : "left"/);
    assert.match(prepare, /foreach \(key, value in config\["properties"\] \|\| \(\[\]\)\) ob->set\(key, value\)/);
    assert.match(prepare, /original (?:TAOHUA )?DIRECT input resolves to exact USER/);
    const direct = body(runner, 'observe_direct');
    const advance = body(runner, 'advance');
    const allowlist = /"gumu-quanzhen",\s*"gumu-temporal",\s*"taohua-ding",\s*"taohua-zhuan",\s*"taohua-direct"/;
    assert.match(direct, allowlist);
    assert.match(advance, allowlist);
    assert.match(advance, /current\["directs"\] = \(\{\}\)/);
    for (const field of ['actor', 'target', 'type', 'damage', 'percent', 'weapon', 'weapon_object'])
        assert.ok(direct.includes('"' + field + '"'), field);
    assert.equal([...direct.matchAll(/me->count_event\("direct"\)/g)].length, 1);
    assert.doesNotMatch(runner, /#include\s+["<]taohua_direct_receivers\.h[">]/,
        '本组只复用现有观察字段，不新增接收头或探针');
});
