import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, parseArgs } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { profiles, weaponConditions } from './weapon_cases.mjs';
import { collectionInput, launchProbes, huboPerformProbes, huboBusyProbes, combatActionProbes, validateRecord,
    validateExpectedOutcomes } from './execution.mjs';
import { missingJobs } from './continuation.mjs';
import { abilityConditions, validateAbilityRecord } from './ability_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));

test('采集结果声明在创建隔离副本和启动驱动前检查，不等采样后才发现缺项', () => {
    const condition = expected => ({ id: 'declaration-test', parameters: { expected } });
    validateExpectedOutcomes([condition('observed'), condition(['observed', 'refused'])]);
    for (const expected of [undefined, null, [], '', 'success', ['observed', 'invalid']])
        assert.throws(() => validateExpectedOutcomes([condition(expected)]), /结果声明：declaration-test/);
    assert.throws(() => validateExpectedOutcomes([{ id: 'missing-parameters' }]), /结果声明：missing-parameters/);
});

test('完整批次的 UTF-8 输入容量覆盖全部样本，不受默认 read_file 截断', () => {
    const conditions = weaponConditions(catalog, { samples: 100, level: 200 });
    const jobs = missingJobs({ identity: { conditions } }, []);
    const input = collectionInput(jobs, null);
    assert.equal(jobs.length, 4800);
    assert.ok(input.bytes > 1048576);
    assert.ok(input.bytes > input.text.length, '输入包含中文，容量必须按字节计算');
    assert.deepEqual(JSON.parse(input.text), { jobs, fault: null });
    assert.ok(input.limits['maximum read file size'] > input.bytes);
    assert.ok(input.limits['maximum string length'] > input.bytes);
    assert.ok(input.limits['maximum buffer size'] > input.bytes);
    assert.ok(input.limits['maximum array size'] >= jobs.length);
    assert.deepEqual(collectionInput([], null).limits, {
        'maximum read file size': 262144, 'maximum string length': 1048576,
        'maximum buffer size': 1048576,
        'maximum array size': 15000,
    });
    assert.equal(collectionInput(Array(16000).fill(0), null).limits['maximum array size'], 16384);
});

test('十二类分别配置；针、箫、暗器没有借用普通剑的结果', () => {
    assert.equal(profiles.length, 12);
    assert.equal(new Set(profiles.map(p => p.type)).size, 12);
    assert.deepEqual(profiles.map(p => p.type).sort(), catalog.weapon_types.map(t => t.macro.toLowerCase()).sort());
    const conditions = weaponConditions(catalog, { smoke: true });
    assert.equal(conditions.length, 36);
    assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 72);
    for (const condition of conditions) {
        for (const path of condition.parameters.qualification_sources) assert.ok(existsSync(join(root, path)));
        const p = condition.parameters;
        assert.ok(catalog.skills.some(s => s.path === condition.entry_id || s.entries.some(e => e.id === condition.entry_id)));
        assert.ok(existsSync(join(root, p.actor.equipment.provider + '.c'))
            || existsSync(join(root, p.actor.equipment.provider + '.lpc')));
        assert.equal(p.target.mappings && Object.keys(p.target.mappings).length, 0);
    }
    const pin = conditions.find(c => c.id.startsWith('pin-perform')).parameters;
    assert.equal(pin.actor.equipment.type, 'pin');
    assert.equal(pin.actor.mappings.sword, 'pixie-jian');
    const flute = conditions.find(c => c.id.startsWith('xsword-perform')).parameters;
    assert.equal(flute.actor.equipment.type, 'xsword');
    assert.equal(flute.actor.mappings.sword, 'yuxiao-jian');
    const ammo = conditions.find(c => c.id.startsWith('throwing-ordinary')).parameters;
    assert.equal(ammo.actor.equipment.hold, true);
    assert.equal(ammo.expected, 'not_applicable');
    for (const condition of conditions.filter(c => c.method === 'refusal')) {
        assert.equal(condition.parameters.actor.properties.neili, 0);
        assert.equal(condition.parameters.expected, 'refused');
    }
});

test('正式条件保留样本量/成长参数和两档加力，烟雾拒绝不混入效果分母', () => {
    const conditions = weaponConditions(catalog, { samples: 13, level: 400 });
    assert.equal(conditions.length, 48);
    assert.ok(conditions.every(c => c.samples === 13 && c.method !== 'refusal'));
    assert.deepEqual([...new Set(conditions.map(c => c.parameters.actor.properties.jiali))], [0, 50]);
    assert.ok(conditions.every(c => c.parameters.actor.skills[c.parameters.profile.skill] === 400));
    assert.equal(parseArgs(['weapons', '--smoke']).smoke, true);
    assert.equal(parseArgs(['weapons', '--level', '800', '--samples', '10']).level, 800);
    assert.throws(() => parseArgs(['weapons', '--samples', '0']), /正整数/);
    assert.throws(() => parseArgs(['inventory', '--smoke']), /无效/);
});

test('辅助机制独立配置；真实回调等待不缩短，学习检查不冒充教师传授', () => {
    const cases = abilityConditions(catalog, { smoke: true });
    assert.equal(cases.length, 12);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 24);
    for (const c of cases) assert.ok(catalog.skills.some(s => s.entries.some(e => e.id === c.entry_id)));
    const power = cases.find(c => c.id === 'ability-powerup-expiry');
    assert.equal(power.parameters.observe_seconds, 17);
    assert.equal(power.parameters.actor.skills.force, 20);
    const ammo = cases.find(c => c.id === 'ability-ammunition-expiry');
    assert.equal(ammo.parameters.observe_seconds, 8);
    assert.equal(ammo.parameters.target.skills.dodge, 1);
    assert.ok(cases.filter(c => c.method === 'interface').every(c => c.parameters.interface.function === 'valid_learn'));
    assert.throws(() => parseArgs(['abilities', '--level', '400']), /无效/);
    assert.equal(parseArgs(['abilities', '--case', 'ability-ma002-dodge']).case, 'ability-ma002-dodge');
    assert.throws(() => parseArgs(['abilities', '--case', '../unsafe']), /条件 ID/);
    const fluteCases = cases.filter(c => c.id.startsWith('ability-ma001-'));
    assert.equal(fluteCases.length, 2);
    assert.ok(fluteCases.every(c => !Object.hasOwn(c.parameters.actor.skills, 'chuixiao-jiafa')));
    assert.deepEqual(fluteCases.map(c => c.parameters.actor.skills['chuixiao-jifa'] ?? 0), [0, 400]);
});

test('观察到发动还不足以通过机制验收；检查恢复、解除和掉落状态', () => {
    const sample = { immediate: [{ temp: {} }, { temp: {} }], after: [{ temp: {} }, { temp: {} }] };
    const recover = { ...sample, condition_id: 'ability-recover', metrics: [{ qi_recovery: 2000, neili_cost: 666 }, {}] };
    validateAbilityRecord(recover);
    assert.throws(() => validateAbilityRecord({ ...recover, metrics: [{ qi_recovery: 0, neili_cost: 666 }, {}] }));
    const power = structuredClone(sample);
    power.condition_id = 'ability-powerup-expiry'; power.elapsed = 17;
    power.immediate[0].temp = { powerup: 1, apply: { attack: 10, parry: 7, dodge: 7 } };
    power.after[0].temp.apply = { attack: 0, parry: 0, dodge: 0 };
    power.callbacks = [{ side: 0, phase: 'before', elapsed: 15, state: { temp: { powerup: 1 } } },
        { side: 0, phase: 'after', elapsed: 15.01, state: { temp: {} } }];
    validateAbilityRecord(power);
    power.after[0].temp.powerup = 1;
    assert.throws(() => validateAbilityRecord(power));
    assert.throws(() => validateAbilityRecord({ ...sample, condition_id: 'unknown' }), /未定义/);
});

test('发动/拒绝探针仅插入观察，去掉探针逐字还原当前游戏源码', () => {
    for (const kind of ['perform', 'exert']) {
        const source = readFileSync(join(root, `cmds/skill/${kind}.c`), 'utf8');
        const { changed, sites } = launchProbes(source, kind);
        assert.equal(sites.length, 3);
        assert.equal(changed.split('->observe_launch(').length - 1, 2);
        assert.equal(changed.split('->observe_refusal(').length - 1, 1);
        let restored = changed;
        for (const site of [...sites].reverse()) restored = restored.replace(site.replacement ?? site.anchor + site.insert, site.anchor);
        assert.equal(restored, source);
        assert.throws(() => launchProbes(source + source, kind), /不唯一/);
    }
    assert.throws(() => launchProbes('', 'other'), /未知/);
});

test('互搏探针保持两处原施展、暂存恢复和忙乱表达式，拒绝不唯一锚点', () => {
    for (const [path, probe] of [['cmds/skill/perform.c', huboPerformProbes], ['feature/action.c', huboBusyProbes]]) {
        const source = readFileSync(join(root, path), 'utf8'), { changed, sites } = probe(source);
        let restored = changed;
        for (const site of [...sites].reverse())
            restored = restored.replace(site.replacement ?? site.anchor + site.insert, site.anchor);
        assert.equal(restored, source);
        assert.throws(() => probe(source + source), /不唯一/);
        assert.throws(() => probe(''), /不唯一/);
        if (path.endsWith('perform.c')) {
            assert.equal(sites.length, 5);
            assert.equal(changed.split('->observe_hubo_step(').length - 1, 4);
            for (const expression of ['result = do_perform(me, arg);', 'result = do_perform(me, and);',
                'busy_state = me->suspend_busy();', 'me->restore_busy(busy_state);'])
                assert.equal(changed.split(expression).length, 2);
            assert.equal(changed.split('random(').length, source.split('random(').length);
        } else {
            assert.equal(sites.length, 2);
            assert.equal(changed.split('->observe_hubo_busy(').length - 1, 2);
            for (const expression of ['if (!new_busy) return;', 'new_busy -= 1 + random(hubo - 4);',
                'if (new_busy > 1 && random(10) < 4 &&', 'busy = new_busy;'])
                assert.equal(changed.split(expression).length, source.split(expression).length);
        }
    }
});

test('直伤复用唯一原探针读取实参，完整逆还原与随机调用次数不变', () => {
    const source = readFileSync(join(root, 'adm/daemons/combatd.c'), 'utf8');
    const { changed, sites } = combatActionProbes(source);
    assert.equal(changed.split('->observe_direct(').length - 1, 1);
    assert.ok(changed.includes('->observe_direct(me, target, type, damage, percent);'));
    assert.equal(changed.split('random(').length, source.split('random(').length);
    let restored = changed;
    for (const site of [...sites].reverse()) {
        if (Array.isArray(site)) restored = restored.replace(site[1] + site[0], site[0]);
        else restored = restored.replace(site.replacement ?? (site.position === 'before'
            ? site.insert + site.anchor : site.anchor + site.insert), site.anchor);
    }
    assert.equal(restored, source);
    assert.throws(() => combatActionProbes(source + source), /不唯一/);
});

function observation() {
    const before = [0, 1].map(side => ({ object: `actor#${side}`, userp: 1, interactive: 1, playerp: 1, wizardp: 0,
        qi: 100, eff_qi: 100, jing: 100, eff_jing: 100, neili: 500 }));
    const after = structuredClone(before); after[0].neili = 400; after[1].qi = 75;
    return { kind: 'sample', condition_id: 'sample-a', method: 'perform', outcome: 'observed', elapsed: 0.01,
        before, after, metrics: [{ neili_cost: 100 }, { qi_cost: 30, qi_recovery: 5 }], launches: [{ skill: 'real' }] };
}

test('资源账闭合且须有真实发动，不把命令受理或错误当成功', () => {
    const condition = { id: 'sample-a', method: 'perform' };
    validateRecord(observation(), condition);
    const wrong = observation(); wrong.metrics[1].qi_cost = 29;
    assert.throws(() => validateRecord(wrong, condition), /资源账/);
    const noLaunch = observation(); noLaunch.launches = []; noLaunch.command_accepted = 1;
    assert.throws(() => validateRecord(noLaunch, condition), /发动/);
    noLaunch.outcome = 'refused'; validateRecord(noLaunch, condition);
    const privileged = observation(); privileged.before[0].wizardp = 1;
    assert.throws(() => validateRecord(privileged, condition), /非巫师/);
    assert.throws(() => validateRecord(observation(), { ...condition, method: 'exert' }));
    validateRecord({ kind: 'sample', condition_id: 'sample-a', method: 'perform', outcome: 'error' }, condition);
});

test('佛光拒绝可保留独立原强化发动，其它拒绝仍不得有发动', () => {
    const condition = { id: 'sample-a', method: 'perform',
        parameters: { collection_group: 'emei-zhao', powerup_before_combat: true } };
    const r = observation();
    r.outcome = 'refused'; r.command_accepted = 0;
    r.after[1] = structuredClone(r.before[1]); r.metrics[1] = {};
    r.powerup = { action: 'exert powerup', accepted: 1, launches_before: 0, launches_after: 1 };
    r.launches = [{ skill: 'linji-zhuang', argument: 'powerup' }];
    validateRecord(r, condition);
    assert.throws(() => validateRecord(r, { ...condition, parameters: {} }));
    for (const mutate of [x => { delete x.powerup; }, x => { x.powerup.accepted = 0; },
        x => { x.powerup.launches_before = 1; }, x => { x.command_accepted = 1; },
        x => { x.launches[0].skill = 'piaoxue-zhang'; }, x => { x.launches.push({ skill: 'piaoxue-zhang' }); }]) {
        const bad = structuredClone(r); mutate(bad); assert.throws(() => validateRecord(bad, condition));
    }
});

test('明确自制兵器样本使用独立原继承夹具，其他批次不能冒充自制或换类别', () => {
    const r = observation();
    const condition = { id: 'sample-a', method: 'perform', parameters: {
        collection_group: 'gumu-advanced', actor: { equipment: { type: 'sword', item_make: true } } } };
    r.before[0].weapon_details = { program: '/tests/crafted_sword', weight: 3000, flag: 4, damage: 50 };
    r.before[0].weapon_flag = 4; r.before[0].weapon_damage = 50;
    validateRecord(r, condition);
    for (const group of ['gumu-direct', 'emei-weapons', undefined]) {
        const wrong = structuredClone(condition); wrong.parameters.collection_group = group;
        assert.throws(() => validateRecord(r, wrong), /装备初始化/);
    }
    r.before[0].weapon_details.program = '/tests/crafted_hammer';
    assert.throws(() => validateRecord(r, condition), /装备初始化/);
    const template = readFileSync(join(root, 'tools/tests/martial_data/crafted_weapon.lpc'), 'utf8');
    assert.match(template, /inherit F_ITEMMAKE;/);
    assert.doesNotMatch(template, /int\s+is_item_make\s*\(/);
    assert.doesNotMatch(template, /\b(?:save|restore|write_file|read_file)\s*\(/);
});
