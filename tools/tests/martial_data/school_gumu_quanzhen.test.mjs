import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createSeries, openSeries, digest } from './ledger.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown, schoolCombatEffects } from './school_combat_report.mjs';
import { gumuQuanzhenConditions, gumuQuanzhenAllowed, gumuQuanzhenFixtureRequirements,
    gumuQuanzhenHuaPower, validateGumuQuanzhenRecord, validateGumuQuanzhenLoads, gumuQuanzhenEffects } from './school_gumu_quanzhen_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const skills = ['quanzhen-jian', ...['chan', 'ding', 'hua', 'lian'].map(x => 'quanzhen-jian/' + x)].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = readFileSync(join(root, path), 'utf8');
    const line = id.includes('/') ? source.split('\n').findIndex(x => x.startsWith('int perform(')) + 1 : 0;
    return { id, path, sha256: sha(source), entries: line ? [{ id: `${path}:${line}:perform`, role: 'perform' }] : [] };
});
const sourceFingerprint = digest(skills.map(s => ({ path: s.path, sha256: s.sha256 })));
const catalog = { skills, source_fingerprint: sourceFingerprint, dictionary_sha256: '0'.repeat(64) };
const cases = gumuQuanzhenConditions(catalog), smoke = gumuQuanzhenConditions(catalog, { smoke: true });
const pick = tag => { const c = cases.find(x => x.id === `school-gumu-qz-${tag}`); assert.ok(c, tag); return c; };
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];

function snapshot(cfg, side, fighting) {
    const equipment = cfg.equipment, apply = { armor: 100, ...(equipment ? { damage: 50, dodge: -1 } : {}) };
    for (const [key, value] of Object.entries(cfg.temp ?? {})) apply[key.slice(6)] = value;
    const properties = Object.entries(cfg.properties);
    return { ...Object.fromEntries(properties.filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: Object.fromEntries(properties.filter(([k]) => k.includes('/') || k === 'character')),
        object: '/tests/' + (side ? 'right' : 'left') + '#1', id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: cfg.busy ?? null,
        skills: structuredClone(cfg.skills), learned: {}, mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        temp: { apply }, effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (apply[k] ?? 0)])),
        weapon: equipment?.type ?? 'none', weapon_damage: equipment ? 50 : 0, weapon_flag: equipment?.type === 'sword' ? 4 : 0,
        weapon_details: equipment ? { program: '/tests/' + equipment.type, object: '/tests/' + equipment.type + '#' + side,
            skill_type: equipment.type, weight: 3000, damage: 50, flag: equipment.type === 'sword' ? 4 : 0,
            consistence: 100, material: null } : {} };
}

// Synthetic observer contract tests only. None are appended to a real sample series.
function trace(c, options = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 }); preparation.after = structuredClone(before[1]);
    }
    const r = { kind: 'sample', condition_id: c.id, method: c.method, outcome: p.expected, before,
        immediate: structuredClone(before), after: [], metrics: [{}, {}], attacks: [], actions: [], directs: [], passives: [], launches: [],
        interfaces: [], terminals: [], callbacks: [], dropped: [], elapsed: 0.01, reason: '',
        ...(c.method === 'perform' ? { command_accepted: Number(p.expected === 'observed') } : {}), ...(preparation ? { preparation } : {}),
        skill_loads: [{ ...p.capture_skill_loads[0], run_id: 'synthetic-run', load_id: 'first-qz',
            state: snapshot(pick('yunv-ordinary-l200-j0').parameters.actor, 0, false) }] };
    const finish = () => {
        r.after = structuredClone(r.immediate);
        for (const side of [0, 1]) for (const key of health) {
            const value = r.before[side][key] - r.immediate[side][key]; if (value > 0) r.metrics[side][key + '_cost'] = value;
        }
        return r;
    };
    if (p.expected === 'refused') { r.reason = '原资格拒绝（合成校验资料）'; r.immediate[0].temp.notify_fail = r.reason; return finish(); }
    const [b, t] = before, [a, target] = r.immediate;
    const direct = (damage, percent, type = 1) => {
        r.directs.push({ actor: 0, target: 1, damage, percent, type, weapon: type ? 'sword' : 'none', weapon_object: type ? b.weapon_details.object : '' });
        r.metrics[0].direct = (r.metrics[0].direct ?? 0) + 1;
        target.qi -= 20; target.eff_qi -= 10;
    };
    const attack = (palm = false, bonus = 0) => {
        const name = palm ? b.mappings.strike : 'quanzhen-jian';
        const action = { action: '原query_action的合成观察', damage_type: '刺伤', lvl: 0, force: 70, attack: 10, dodge: 10, damage: 13 };
        const fixed = [[0,70,10,10,13],[10,74,15,20,19],[20,85,20,25,21],[40,118,25,30,28],
            [60,130,30,35,32],[80,150,33,45,39],[100,170,36,42,48],[120,193,40,55,54],
            [140,220,45,55,63],[160,240,50,58,75],[180,280,55,65,88],[200,340,57,62,103],[220,370,60,66,135]];
        if (!palm) {
            const eligible = fixed.filter(x => x[0] < b.skills[name]);
            if (b.skills[name] > 300) eligible.push([300]);
            const selected = eligible.slice(-6)[0];
            for (const [i, key] of ['lvl', 'force', 'attack', 'dodge', 'damage'].entries()) action[key] = selected[i];
        } else {
            const levels = name === 'haotian-zhang' ? [0,5,10,15,20,25,30,35,40,45,50,55,60,80,100,110,120,130,140,150,160]
                : [0,15,30,50,70,90,110,130,150];
            action.lvl = levels.filter(n => n < b.skills[name]).slice(-6)[0];
        }
        if (options.dynamic && !palm) Object.assign(action, { lvl: 300, force: 100, attack: 50, dodge: 33, parry: 33, damage: 50 });
        r.actions.push({ actor: 0, target: 1, skill: name, action });
        const type = p.ability === 'lian' ? 1 : 0, result = options.hit ? 0 : -1;
        r.attacks.push({ actor: 0, target: 1, type, result, damage: options.hit ? 20 : 0,
            attack_usage: palm ? 'strike' : 'sword', attack_skill: name, weapon: palm ? 'none' : 'sword',
            weapon_object: palm ? '' : b.weapon_details.object, apply_attack: (b.temp.apply.attack ?? 0) + bonus });
        const metric = result === 0 ? 'hit' : 'dodge'; r.metrics[0][metric] = (r.metrics[0][metric] ?? 0) + 1;
        if (type) r.metrics[0].riposte = (r.metrics[0].riposte ?? 0) + 1;
        if (options.hit) {
            const passive = (skill, route, factor, spent) => {
                const start = structuredClone(r.immediate), end = structuredClone(start);
                start[0].temp.apply.attack = (b.temp.apply.attack ?? 0) + bonus;
                end[0].temp.apply.attack = start[0].temp.apply.attack;
                end[0].neili -= spent;
                r.passives.push({ actor: 0, target: 1, route, skill, factor, incoming: 100,
                    result: route === 'force' && skill === 'surge-force' ? 30 : 0, before: start, after: end });
                a.neili -= spent;
            };
            if (b.jiali) passive(b.mappings.force, 'force', b.jiali, b.mappings.force === 'surge-force' ? b.jiali : 0);
            passive(name, 'martial', 0, 0); target.qi -= 20; target.eff_qi -= 5;
        }
    };
    const ap = p.ability === 'chan' ? b.effective_skills.sword : p.ability === 'ding' ? b.effective_skills.force
        : p.ability === 'hua' ? gumuQuanzhenHuaPower(b) : b.effective_skills.sword + b.skills.unarmed;
    const dp = p.ability === 'chan' ? t.effective_skills.force : p.ability === 'ding' ? Math.trunc(t.effective_skills.force / 2)
        : p.ability === 'hua' ? t.effective_skills.force + Math.trunc(t.skills.parry * 2 / 3) : Math.trunc(t.effective_skills.parry / 2);
    const maximum = (['chan', 'hua'].includes(p.ability) ? Math.trunc(ap / 2) : 0) + Math.max(0, ap - 1);
    const branch = options.branch ?? (maximum <= dp ? 'failure' : 'success');
    if (c.method === 'perform') { r.launches.push({ actor: b.object, skill: 'quanzhen-jian', argument: p.ability }); r.metrics[0].ability_launched = 1; }
    switch (p.ability) {
        case 'ordinary': attack(); break;
        case 'chan':
            a.neili -= 50;
            if (branch === 'success') target.busy = Math.trunc(b.skills['quanzhen-jian'] / 28) + 2; else a.busy = 1;
            break;
        case 'ding':
            a.busy = 2; a.neili -= branch === 'success' ? 80 : 30;
            if (branch === 'success') direct(b.skills['quanzhen-jian'] + b.skills.force + (b.skills['xiantian-gong'] ?? 0), 50);
            break;
        case 'hua':
            a.neili -= 200; a.busy = branch === 'success' ? 3 : 2;
            if (branch === 'success') {
                direct(Math.trunc(gumuQuanzhenHuaPower(b) / 2), 100);
                if (options.secondary !== false) {
                    for (let i = 0; i < (options.partial ?? 3); i++) attack(false, Math.trunc(b.skills['xiantian-gong'] / 2));
                    // Original add_temp(+n), add_temp(-n) leaves an explicit zero when absent initially.
                    a.temp.apply.attack = b.temp.apply.attack ?? 0;
                }
                if (options.partial !== undefined) {
                    target.living = 0; target.qi = 0; target.jing = 0; a.fighting_opponent = 0;
                    r.terminals.push({ side: 1, state: 'unconscious' });
                }
            }
            break;
        case 'lian':
            a.busy = 3; a.neili -= 60; attack(); attack(true);
            if (branch === 'success') direct(Math.trunc((b.effective_skills.sword + b.skills.unarmed) / 2), 70, 0);
            a.neili -= branch === 'success' ? 150 : 50;
            break;
        default: assert.fail(p.ability);
    }
    return finish();
}
const validate = (r, c) => { validateRecord(r, c); return validateSchoolCombatRecord(r, c); };
const mutate = (c, change, options) => { const r = trace(c, options); change(r); assert.throws(() => validate(r, c)); };

test('原持剑回调允许每次至多磨损1，最终零伤害不抹掉已经到达的磨损机会', () => {
    for (const damage of [20, 0]) {
        const c = pick('yunv-ordinary-l200-j50'), r = trace(c, { hit: true });
        r.attacks[0].damage = damage; r.immediate[0].weapon_details.consistence = 99;
        r.after = structuredClone(r.immediate);
        const original = structuredClone(r); validate(r, c); assert.deepEqual(r, original);
    }
    for (const [tag, options, budget] of [
        ['yunv-ding-l200', {}, 1],
        ['mixed-hua-l400', {}, 1],
        ['mixed-hua-l400', { hit: true }, 4],
        ['mixed-lian-p0-l200', { hit: true }, 1],
    ]) {
        const c = pick(tag), r = trace(c, options);
        r.immediate[0].weapon_details.consistence -= budget; r.after = structuredClone(r.immediate);
        validate(r, c);
        r.immediate[0].weapon_details.consistence--; r.after = structuredClone(r.immediate);
        assert.throws(() => validate(r, c), /磨损/);
    }
});

test('闪避招架、控制、拒绝、失败直伤和仅force回调不能凭空磨损武器', () => {
    for (const [tag, options] of [
        ['yunv-ordinary-l200-j0', {}], ['chan-weak', {}], ['ding-no-grant', {}],
        ['yunv-ding-l200', { branch: 'failure' }], ['mixed-hua-l400', { branch: 'failure' }],
        ['mixed-lian-p0-l200', {}],
    ]) mutate(pick(tag), r => {
        r.immediate[0].weapon_details.consistence = 99; r.after = structuredClone(r.immediate);
    }, options);
    const c = pick('yunv-ordinary-l200-j50');
    mutate(c, r => {
        r.attacks[0].result = -2; r.metrics[0].dodge = 0; r.metrics[0].parry = 1;
        r.immediate[0].weapon_details.consistence = 99; r.after = structuredClone(r.immediate);
    });
    mutate(c, r => {
        r.attacks[0].damage = 0; r.passives = r.passives.filter(event => event.route === 'force');
        r.immediate[0].weapon_details.consistence = 99; r.after = structuredClone(r.immediate);
    }, { hit: true });
    mutate(c, r => {
        r.before[0].weapon_details.material = 'tian jing'; r.immediate[0].weapon_details.material = 'tian jing';
        r.immediate[0].weapon_details.consistence = 99; r.after = structuredClone(r.immediate);
    }, { hit: true });
});

test('耐久缺失、错误类型、增加、越界和换武器不因允许原磨损而放过', () => {
    const c = pick('yunv-ordinary-l200-j50');
    for (const value of [null, undefined, '99', 99.5, -1, 101, 98]) mutate(c, r => {
        r.immediate[0].weapon_details.consistence = value; r.after = structuredClone(r.immediate);
    }, { hit: true });
    for (const phase of ['before', 'immediate']) mutate(c, r => {
        delete r[phase][0].weapon_details.consistence; r.after = structuredClone(r.immediate);
    }, { hit: true });
    for (const [key, value] of Object.entries({ object: '/tests/sword#other', program: '/tests/other',
        skill_type: 'blade', weight: 2999, flag: 0, damage: 51, material: 'iron' })) mutate(c, r => {
        r.immediate[0].weapon_details[key] = value; r.after = structuredClone(r.immediate);
    }, { hit: true });
    for (const phase of ['before', 'after']) mutate(c, r => {
        r.passives.find(event => event.route === 'martial')[phase][0].weapon_details.object = '/tests/sword#other';
        r.immediate[0].weapon_details.consistence = 99; r.after = structuredClone(r.immediate);
    }, { hit: true });
    mutate(c, r => {
        r.immediate[1].weapon_details.consistence = 99; r.after = structuredClone(r.immediate);
    }, { hit: true });
});

test('首次冷加载允许尚未创建apply，但保留原临时属性映射且不回填证据', () => {
    for (const tag of ['yunv-ordinary-l200-j0', 'yunv-ordinary-l200-j50']) {
        const c = pick(tag), r = trace(c), state = r.skill_loads[0].state;
        state.temp = { user_setup: 1 };
        const original = structuredClone(r);
        validate(r, c);
        validateGumuQuanzhenLoads([r]);
        assert.deepEqual(r, original);
    }
});

test('冷加载仍拒绝缺少temp及显式无效apply，战斗与被动快照仍必须包含apply', () => {
    const c = pick('yunv-ordinary-l200-j50');
    mutate(c, r => { delete r.skill_loads[0].state.temp; });
    for (const value of [null, 0, undefined, []]) {
        mutate(c, r => { r.skill_loads[0].state.temp = value; });
        mutate(c, r => { r.skill_loads[0].state.temp = { apply: value }; });
    }
    for (const phase of ['before', 'immediate', 'after']) for (const side of [0, 1])
        mutate(c, r => { delete r[phase][side].temp.apply; });
    for (const phase of ['before', 'after']) for (const side of [0, 1])
        mutate(c, r => { delete r.passives[0][phase][side].temp.apply; }, { hit: true });
});

test('有限矩阵固定、原入口和结果声明完整；一条件一个烟雾，不虚构古墓外派技能', () => {
    assert.equal(cases.length, 120); assert.equal(smoke.length, 120); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 120);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4552);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').reduce((n, c) => n + c.samples, 0), 4434);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').reduce((n, c) => n + c.samples, 0), 118);
    assert.equal(sha(cases), '6eea30655e0a845407c9a64cda82099ddf2bacadc75578b7c5d90948203b7c06');
    assert.equal(sha(smoke), 'b51d92752dd26fc24a9d9ca017d71f2e3ddf5bf57411156daf25b4b6d660b669');
    assert.deepEqual(cases.map(c => c.parameters), smoke.map(c => c.parameters));
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const c of cases) {
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
        assert.equal(c.parameters.actor.skills.parry > 0, true, '原enable parry首次加载必须有基本招架');
        assert.equal(c.parameters.expected === 'observed', gumuQuanzhenAllowed(c.parameters));
        assert.doesNotThrow(() => validate(trace(c), c), c.id);
        if (c.parameters.scope === 'pure-gumu') for (const name of ['xiantian-gong', 'haotian-zhang', 'chongyang-shenzhang'])
            assert.equal(Object.hasOwn(c.parameters.actor.skills, name), false);
    }
    assert.equal(gumuQuanzhenFixtureRequirements.length, 6);
    for (const samples of [0, -1, 0.5, NaN]) assert.throws(() => gumuQuanzhenConditions(catalog, { samples }));
    assert.throws(() => gumuQuanzhenConditions({ skills: [] }));
});

test('实际createSeries/openSeries验证公共条件ID与源码入口；不调用游戏driver', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-qz-unit-'));
    try {
        const input = { inventory: { source_fingerprint: sourceFingerprint, versions: { synthetic: true } }, catalog,
            conditions: cases, execution: { synthetic: true, driver_started: false } };
        const manifest = createSeries(directory, input);
        assert.deepEqual(openSeries(directory).identity.conditions, cases); assert.equal(openSeries(directory).fingerprint, manifest.fingerprint);
        createSeries(join(directory, 'smoke'), { ...input, conditions: smoke });
        assert.deepEqual(openSeries(join(directory, 'smoke')).identity.conditions, smoke);
        const invalid = structuredClone(input); invalid.conditions[0].id += '.';
        assert.throws(() => createSeries(join(directory, 'invalid'), invalid), /条件 ID/);
        invalid.conditions[0].id = cases[0].id; invalid.conditions[0].entry_id += '-invalid';
        assert.throws(() => createSeries(join(directory, 'invalid-entry'), invalid), /入口不在源码/);
    } finally {
        assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + '\\mud-gumu-qz-unit-')
            || resolve(directory).startsWith(resolve(tmpdir()) + '/mud-gumu-qz-unit-'));
        rmSync(directory, { recursive: true, force: true });
    }
});

test('师父已学档和归一化档分开，纯古墓拒绝不被混合诊断替代', () => {
    assert.equal(pick('teacher-longnv').parameters.actor.skills['quanzhen-jian'], 200);
    assert.equal(pick('teacher-longnv').parameters.actor.skills.sword, 220);
    assert.equal(pick('teacher-yang').parameters.actor.skills['quanzhen-jian'], 380);
    assert.equal(pick('teacher-yang').parameters.actor.skills['surge-force'], 390);
    for (const native of ['yunv', 'surge']) for (const level of [200, 400, 800]) for (const ability of ['hua', 'lian'])
        assert.equal(pick(`${native}-${ability}-pure-l${level}`).parameters.expected, 'refused');
    for (const ability of ['chan', 'ding', 'hua', 'lian']) {
        for (const suffix of ['no-grant', 'no-weapon', 'wrong-weapon', 'no-map', 'wrong-map', 'busy', 'no-fight', 'unconscious', 'skill-below', 'neili-below'])
            assert.equal(pick(`${ability}-${suffix}`).parameters.expected, 'refused');
        for (const suffix of ['skill-at', 'neili-at']) assert.equal(pick(`${ability}-${suffix}`).parameters.expected, 'observed');
    }
    assert.equal(pick('lian-palm-level1').parameters.expected, 'observed');
    assert.equal(pick('hua-learned-not-mapped').parameters.expected, 'refused');
});

test('缠字诀成功忙乱与失败忙1都扣50；确定两端来自原AP/DP而非RNG替换', () => {
    const success = validate(trace(pick('chan-weak')), pick('chan-weak'));
    assert.equal(success.branch, 'success'); assert.equal(success.target_busy, 9); assert.equal(success.busy, 0); assert.equal(success.total_cost, 50);
    const failure = validate(trace(pick('chan-strong')), pick('chan-strong'));
    assert.equal(failure.branch, 'failure'); assert.equal(failure.target_busy, 0); assert.equal(failure.busy, 1);
    mutate(pick('chan-weak'), () => {}, { branch: 'failure' });
    mutate(pick('chan-strong'), () => {}, { branch: 'success' });
    mutate(pick('chan-weak'), r => { r.immediate[1].busy++; r.after = structuredClone(r.immediate); });
});

test('定阳针记录原减伤前输入和最终损血；已学未映先天仍增加输入，不增加原80/30耗费', () => {
    const pure = pick('yunv-ding-l200'), mixed = pick('mixed-ding-l200');
    const a = trace(pure), b = trace(mixed); validate(a, pure); validate(b, mixed);
    assert.equal(a.directs[0].damage, 400); assert.equal(b.directs[0].damage, 600);
    assert.equal(b.before[0].mappings.force, 'yunv-xinjing'); assert.equal(validate(b, mixed).target_qi_cost, 20);
    assert.equal(validate(trace(pure, { branch: 'failure' }), pure).ability_cost, 30);
    mutate(mixed, r => { r.directs[0].damage = 400; });
    mutate(pure, r => { r.directs[0].damage = 400 + Math.trunc(400 / 3); });
    mutate(pure, r => { r.directs[0].percent = 100; });
    mutate(pick('ding-strong'), () => {}, { branch: 'success' });
});

test('化三清原两次判定、200内力、3/2忙乱，实际三剑加成恢复，不把未达第二门当拒绝', () => {
    const c = pick('mixed-hua-l400'), r = trace(c);
    const success = validate(r, c); assert.equal(success.branch, 'success'); assert.equal(success.secondary, 'success');
    assert.equal(success.actual_attacks, 3); assert.equal(success.ability_cost, 200); assert.equal(success.busy, 3);
    assert.equal(validate(trace(c, { secondary: false }), c).secondary, 'failure');
    assert.equal(validate(trace(c, { branch: 'failure' }), c).secondary, 'not-reached');
    assert.equal(validate(trace(c, { partial: 1 }), c).actual_attacks, 1);
    const existing = pick('hua-existing-attack'), record = trace(existing); validate(record, existing);
    assert.equal(record.attacks[0].apply_attack, 117); assert.equal(record.immediate[0].temp.apply.attack, 17);
    mutate(existing, r => { r.attacks[0].apply_attack = 100; });
    mutate(existing, r => { r.immediate[0].temp.apply.attack = 0; r.after = structuredClone(r.immediate); });
    mutate(pick('hua-weak'), () => {}, { secondary: false });
    mutate(pick('hua-strong'), () => {}, { branch: 'success' });
    mutate(c, r => { r.directs[0].damage = gumuQuanzhenHuaPower(r.before[0]) * 2; });
});

test('三连环剑→掌→腿，type1是RIPOSTE而非QUICK；原持剑身份与属性最终恢复', () => {
    for (const index of [0, 1]) for (const branch of ['success', 'failure']) {
        const c = pick(`mixed-lian-p${index}-l200`), r = trace(c, { branch });
        const actual = validate(r, c); assert.equal(actual.ability_cost, branch === 'success' ? 210 : 110);
        assert.equal(r.metrics[0].riposte, 2); assert.equal(r.metrics[0].quick, undefined);
        assert.deepEqual(r.attacks.map(x => x.weapon), ['sword', 'none']);
        assert.equal(r.directs[0]?.type, branch === 'success' ? 0 : undefined);
        assert.equal(actual.busy, 3);
        mutate(c, x => { x.attacks[1].weapon = 'sword'; });
        mutate(c, x => { x.immediate[0].weapon_details.object = '/tests/sword#other'; x.after = structuredClone(x.immediate); });
    }
    const c = pick('mixed-lian-p0-l200');
    mutate(c, r => { r.attacks[0].type = 2; r.metrics[0].quick = 1; r.metrics[0].riposte--; });
    mutate(c, r => { r.actions[1].skill = 'quanzhen-jian'; });
    mutate(c, r => { r.directs[0].type = 1; });
    mutate(pick('lian-strong'), () => {}, { branch: 'success' });
});

test('实际零攻击加成接受已存在null/0，但缺键、其它类型和非零加成缺失仍拒绝', () => {
    const c = pick('yunv-ordinary-l200-j0');
    for (const value of [null, 0]) {
        const r = trace(c); r.attacks[0].apply_attack = value; validate(r, c);
    }
    for (const value of [undefined, false, '0', 1, -1])
        mutate(c, r => { r.attacks[0].apply_attack = value; });
    mutate(c, r => { delete r.attacks[0].apply_attack; });
    mutate(pick('mixed-hua-l400'), r => { r.attacks[0].apply_attack = null; });
    mutate(pick('hua-existing-attack'), r => { r.attacks[0].apply_attack = 0; });
});

test('玉女心经覆写无附伤与海潮公共force加力账分开，命中damage0不反推未调用', () => {
    for (const native of ['yunv', 'surge']) {
        const c = pick(`${native}-ordinary-l200-j50`), r = trace(c, { hit: true });
        const actual = validate(r, c); assert.equal(actual.passive_cost, native === 'surge' ? 50 : 0);
        assert.equal(actual.ability_cost, 0); assert.equal(actual.passive_calls, 2);
        r.attacks[0].damage = 0; validate(r, c);
        mutate(c, x => { x.passives[0].before[0].object = '/tests/wrong#1'; }, { hit: true });
        mutate(c, x => { delete x.passives[0].result; }, { hit: true });
        mutate(c, x => { x.passives[0].after[1].qi--; }, { hit: true });
    }
    const c = pick('yunv-ordinary-l200-j0');
    mutate(c, r => { r.passives = []; }, { hit: true });
    mutate(c, r => { r.passives[0].route = 'force'; r.passives[0].skill = 'yunv-xinjing'; }, { hit: true });
});

test('300招仅等级严格大于300才可选，首次加载USER/原始技能/随机全局值跨档保持', () => {
    const c = pick('ordinary-action-301'), first = trace(c, { dynamic: true }), second = trace(pick('yunv-ordinary-l800-j0'), { dynamic: true });
    validate(first, c); validate(second, pick('yunv-ordinary-l800-j0'));
    assert.deepEqual(validateGumuQuanzhenLoads([first, second]), { loads: 1, observed_dynamic_actions: 1 });
    mutate(pick('ordinary-action-300'), () => {}, { dynamic: true });
    mutate(c, r => { r.skill_loads[0].state.skills.sword = 0; }, { dynamic: true });
    mutate(c, r => { r.skill_loads[0].sha256 = 'f'.repeat(64); });
    mutate(pick('yunv-ordinary-l200-j0'), r => { r.actions[0].action.force++; });
    mutate(pick('yunv-ordinary-l200-j0'), r => {
        Object.assign(r.actions[0].action, { lvl: 0, force: 70, attack: 10, dodge: 10, damage: 13 });
    });
    const changed = structuredClone(second); changed.actions[0].action.force++;
    assert.throws(() => validateGumuQuanzhenLoads([first, changed]));
    changed.actions = structuredClone(first.actions); changed.skill_loads[0].load_id = 'reloaded';
    assert.throws(() => validateGumuQuanzhenLoads([first, changed]));
});

test('已存在的null忙乱与缺字段区分，资源账不允许额外相抵，归属/准备昏迷证据须完整', () => {
    const c = pick('yunv-ding-l200');
    for (const change of [
        r => { delete r.before[0].busy; }, r => { r.before[0].temp.apply.attack = null; },
        r => { r.metrics[0].neili_cost++; r.metrics[0].neili_recovery = 1; },
        r => { r.metrics[0].neili_cost = null; }, r => { r.metrics[0] = null; },
        r => { r.metrics[0].heartbeats = 1; }, r => { r.launches[0].actor = '/tests/other#1'; },
        r => { r.directs[0].target = 0; }, r => { delete r.directs; }, r => { r.command_accepted = 0; },
        r => { r.before[0].effective_skills.force++; }, r => { r.immediate[0].weapon = 'none'; r.after = structuredClone(r.immediate); },
    ]) mutate(c, change);
    const unconscious = pick('ding-unconscious'); validate(trace(unconscious), unconscious);
    mutate(unconscious, r => { delete r.preparation; });
    mutate(unconscious, r => { r.preparation.before.object = '/tests/other#1'; });
    mutate(unconscious, r => { r.terminals.push({ side: 1, state: 'unconscious' }); });
    mutate(pick('ding-no-grant'), r => { r.before[0].cultivation['can_perform/quanzhen-jian/ding'] = 1; });
});

test('统计必传冻结condition，失败发动仍正常分母，混合/纯古墓与输入/实际损血分列', () => {
    const c = pick('mixed-ding-l200'), a = trace(c), b = trace(c, { branch: 'failure' });
    const rows = [a, b].map(raw => ({ outcome: raw.outcome, raw }));
    assert.equal(Object.hasOwn(a, 'parameters'), false);
    const report = gumuQuanzhenEffects(rows, c);
    assert.equal(report.scope, 'mixed-diagnostic'); assert.equal(report.normal_effect_denominator, 2);
    assert.deepEqual(report.branch, { success: 1, failure: 1, 'not-applicable': 0 });
    assert.equal(report.direct_input_damage.mean, 600); assert.equal(report.direct_input_damage.n, 1);
    assert.equal(report.target_qi_cost.mean, 10); assert.equal(report.ability_cost.mean, 55);
    assert.equal(report.any_direct.trials, 2); assert.equal(report.any_direct.successes, 1);
    const refused = pick('yunv-hua-pure-l200'), rejected = gumuQuanzhenEffects([{ outcome: 'refused', raw: trace(refused) }], refused);
    assert.equal(rejected.scope, 'pure-gumu'); assert.equal(rejected.normal_effect_denominator, 0); assert.equal(rejected.ability_cost.mean, null);
    assert.throws(() => gumuQuanzhenEffects(rows)); assert.throws(() => gumuQuanzhenEffects(rows, pick('yunv-ding-l200')));
    const error = gumuQuanzhenEffects([{ outcome: 'error', raw: { outcome: 'error', condition_id: c.id, method: c.method } }], c);
    assert.equal(error.counts.error, 1); assert.equal(error.normal_effect_denominator, 0);
    assert.equal(gumuQuanzhenEffects([], c).total_cost.mean, null);
    const markdown = schoolCombatMarkdown({ fingerprint: 'synthetic-only', evidence_sha256: 'no-real-samples',
        totals: { conditions: 1, samples: 2, observed: 2, refused: 0, errors: 0 },
        conditions: [{ ...c, counts: { observed: 2, refused: 0 }, gumu_quanzhen: report, effects: schoolCombatEffects(rows) }] });
    const heading = markdown.indexOf('## 古墓所用全真剑');
    assert.ok(heading > 0); assert.ok(!markdown.slice(0, heading).includes(c.id));
    assert.ok(markdown.includes('mixed-diagnostic')); assert.ok(markdown.includes('直伤输入不是最终损血'));
});
