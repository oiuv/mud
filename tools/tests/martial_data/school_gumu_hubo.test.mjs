import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { schoolCombatMarkdown } from './school_combat_report.mjs';
import { validateExpectedOutcomes } from './execution.mjs';
import { gumuHuboConditions, gumuHuboFixtureRequirements, huboCanLearn, huboBusyValues,
    huboGateChance, validateGumuHuboRecord, gumuHuboEffects } from './school_gumu_hubo_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = gumuHuboConditions(catalog);
const pick = (ability, level = 200, suffix = '') => {
    const c = cases.find(c => c.id === `school-gumu-hubo-${ability}-l${level}${suffix ? '-' + suffix : ''}`);
    assert.ok(c, [ability, level, suffix].join('/')); return c;
};
const copy = structuredClone, names = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

// Synthetic traces test the collector. None is evidence from a game driver.
function row(c, { failGate = false, control = false } = {}) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => ({ userp: 1, interactive: 1, wizardp: 0, weapon: 'none',
        qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')),
        busy: cfg.busy ?? 0, mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        skills: copy(cfg.skills), effective_skills: { force: Math.trunc(cfg.skills.force / 2) },
        temp: { ...(cfg.temp ?? {}) } }));
    const r = { parameters: p, method: c.method, before, immediate: copy(before), metrics: [{}, {}],
        interfaces: [], launches: [], attacks: [], hubo_steps: [], busy_calls: [], outcome: 'observed', reason: '' };
    if (c.method === 'perform') {
        const chance = huboGateChance(before[0], p.fighting, p.perform_arguments.length === 2);
        if (!chance) r.command_accepted = 0;
        else if (failGate) {
            r.command_accepted = 1; r.immediate[0].busy = 1;
            r.busy_calls.push({ side: 0, caller_side: 0, requested: 1, before: 0, after: 1 });
        } else {
            let busy = 0;
            for (const argument of p.perform_arguments) {
                r.immediate[0].busy = 0;
                const s = { argument, before: copy(r.immediate), accepted: 0, reason: '' };
                const allowed = argument === 'strike.wang' && p.actor.properties['can_perform/tianluo-diwang/wang']
                    && p.fighting && !r.immediate[1].busy && r.immediate[0].neili >= 70;
                if (allowed) {
                    s.accepted = 1; r.immediate[0].neili -= 60;
                    const applied = control && p.target.skills.dodge < 798;
                    if (applied) {
                        r.busy_calls.push({ side: 1, caller_side: 0, requested: 27, before: 0, after: 27 });
                        r.immediate[1].busy = 27;
                    }
                    const requested = applied ? 3 : 1, after = huboBusyValues(p.level, requested)[0];
                    r.busy_calls.push({ side: 0, caller_side: 0, requested, before: 0, after });
                    r.immediate[0].busy = after; r.launches.push({ skill: 'tianluo-diwang', argument: 'wang' });
                } else s.reason = '原招式不满足条件';
                s.after = copy(r.immediate); r.hubo_steps.push(s); busy = Math.max(busy, s.after[0].busy);
            }
            r.immediate[0].busy = busy;
            r.command_accepted = p.perform_arguments.length === 2 ? 1 : r.hubo_steps[0].accepted;
        }
        r.metrics[0].neili_cost = before[0].neili - r.immediate[0].neili;
        r.outcome = r.launches.length ? 'observed' : 'refused';
        if (r.outcome === 'refused') r.reason = '命令拒绝或无招式发动';
        return r;
    }
    if (p.ability === 'research') { r.command_accepted = 0; r.outcome = 'refused'; r.reason = '知识只能学习'; return r; }
    const i = { ...p.interface, result: 0, implemented_by: p.ability === 'start_busy' ? '/feature/action'
        : p.ability === 'valid_learn_level' ? '/inherit/skill/skill' : '/kungfu/skill/zuoyou-hubo' };
    r.interfaces.push(i);
    if (p.ability === 'start_busy') {
        const side = p.interface.player_side, b = before[side];
        const after = huboBusyValues(p.level, p.interface.amount, { own: side === 0,
            clever: b.cultivation.character === '狡黠多变', before: b.busy })[0];
        r.busy_calls.push({ side, caller_side: 0, requested: p.interface.amount, before: b.busy, after });
        r.immediate[side].busy = after;
    } else if (p.ability === 'skill_improved') {
        const layer = Math.min(10, Math.trunc(p.level / 30));
        r.skill_messages = [layer ? `你${p.level % 30 ? '又加深了一点了解' : '领悟了'}第${names[layer]}层境界的左右互博。`
            : '你潜心领悟左右互博，若有所悟。'];
    } else {
        i.result = p.ability === 'type' ? 'knowledge' : p.ability === 'valid_learn_level' ? 999
            : p.ability === 'valid_learn' ? Number(huboCanLearn(before[0])) : 0;
        if (['valid_learn', 'practice_skill'].includes(p.ability) && !i.result) { r.outcome = 'refused'; r.reason = '原资格拒绝'; }
    }
    return r;
}

test('古墓互搏条件：资格、原忙乱及双招分开，合成记录不冒充实测', () => {
    assert.equal(cases.length, 166); assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5624);
    assert.equal(gumuHuboFixtureRequirements.length, 4);
    for (const c of cases) {
        assert.equal(c.parameters.collection_group, 'gumu-hubo'); assert.equal(c.parameters.observe_seconds, 0);
        assert.deepEqual(c.parameters.target.mappings, {}); assert.equal(c.parameters.actor.properties.jiali, 0);
        for (const f of c.parameters.qualification_sources) assert.ok(existsSync(join(root, f)), f);
        validateGumuHuboRecord(row(c), c);
    }
    const smoke = gumuHuboConditions(catalog, { smoke: true });
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 332);
    assert.throws(() => gumuHuboConditions({ skills: [] }));
    for (const samples of [0, -1, 1.5, NaN]) assert.throws(() => gumuHuboConditions(catalog, { samples }));
});

test('学习检查count而非mathematics，天道仅豁免悟性，不豁免循影／count', () => {
    for (const [suffix, expected] of [['count1', false], ['mathematics1', true], ['qinzong', false],
        ['int16', false], ['tiandao', true], ['tiandao-count', false]]) {
        const c = pick('valid_learn', 200, suffix), r = row(c);
        assert.equal(huboCanLearn(r.before[0]), expected); validateGumuHuboRecord(r, c);
    }
    assert.equal(row(pick('valid_learn', 49, 'asexual')).interfaces[0].result, 1);
    assert.equal(row(pick('valid_learn', 50, 'asexual')).interfaces[0].result, 0);
    for (const level of [149, 150, 200, 800]) {
        assert.equal(row(pick('valid_learn', level, 'force-low')).interfaces[0].result, 0);
        assert.equal(row(pick('valid_learn', level, 'force-minimum')).interfaces[0].result, 1);
    }
});

test('知识类型、继承学习上限、练习／研究拒绝与仅显示的层数分别核验', () => {
    for (const level of [200, 400, 800]) {
        assert.equal(row(pick('type', level)).interfaces[0].result, 'knowledge');
        assert.equal(row(pick('valid_learn_level', level)).interfaces[0].result, 999);
        for (const ability of ['practice_skill', 'research']) assert.equal(row(pick(ability, level)).outcome, 'refused');
    }
    for (const level of [29, 30, 31, 299, 300, 301, 330, 800]) {
        const c = pick('skill_improved', level), r = row(c); validateGumuHuboRecord(r, c);
        r.immediate[0].skills['zuoyou-hubo']++; assert.throws(() => validateGumuHuboRecord(r, c));
    }
    const c = pick('skill_improved', 330), r = row(c);
    r.skill_messages = ['领悟了第十一层境界']; assert.throws(() => validateGumuHuboRecord(r, c));
});

test('150级起减自己忙乱，300级封顶；对方持有互搏不减少被控制计数', () => {
    assert.deepEqual(huboBusyValues(149, 9), [9]); assert.deepEqual(huboBusyValues(150, 9), [8]);
    assert.deepEqual(huboBusyValues(180, 9), [7, 8]);
    assert.deepEqual(huboBusyValues(300, 9), [3, 4, 5, 6, 7, 8]);
    assert.deepEqual(huboBusyValues(800, 9), huboBusyValues(300, 9));
    assert.deepEqual(huboBusyValues(800, 27, { own: false }), [27]);
    assert.deepEqual(huboBusyValues(800, 1), [1]); assert.deepEqual(huboBusyValues(800, 0, { before: 7 }), [7]);
    assert.deepEqual(huboBusyValues(149, 9, { clever: true }), [8, 9]);
    assert.deepEqual(huboBusyValues(300, 9, { clever: true }), [2, 3, 4, 5, 6, 7, 8]);
    const c = pick('start_busy', 300, 'n9-side1'), r = row(c);
    r.busy_calls[0].after = 8; r.immediate[1].busy = 8; assert.throws(() => validateGumuHuboRecord(r, c));
});

test('双招101级才获尝试，360级不再随机失败；单招不套双招门槛', () => {
    assert.equal(huboGateChance(row(pick('perform', 100)).before[0], true), 0);
    assert.equal(huboGateChance(row(pick('perform', 101)).before[0], true), 1 / 101);
    assert.equal(huboGateChance(row(pick('perform', 359)).before[0], true), 259 / 359);
    assert.equal(huboGateChance(row(pick('perform', 360)).before[0], true), 1);
    for (const level of [101, 149, 150, 200, 299, 300, 359]) validateGumuHuboRecord(row(pick('perform', level), { failGate: true }), pick('perform', level));
    for (const level of [360, 400, 800]) {
        const c = pick('perform', level); assert.throws(() => validateGumuHuboRecord(row(c, { failGate: true }), c));
    }
    for (const level of [0, 100]) {
        const c = pick('perform', level), r = row(c); r.command_accepted = 1;
        assert.throws(() => validateGumuHuboRecord(r, c));
    }
    assert.equal(row(pick('perform', 0, 'single')).launches.length, 1);
    for (const suffix of ['int36', 'asexual', 'mathematics1']) assert.equal(row(pick('perform', 360, suffix)).launches.length, 2);
    for (const suffix of ['count1', 'qinzong', 'busy', 'no-perform', 'no-fight']) assert.equal(row(pick('perform', 360, suffix)).command_accepted, 0);
});

test('原twice／and单次命令保持独立两招费用和第二招入场资源', () => {
    for (const suffix of ['', 'and']) {
        const c = pick('perform', 360, suffix), r = row(c); validateGumuHuboRecord(r, c);
        assert.equal(r.launches.length, 2); assert.equal(r.metrics[0].neili_cost, 120);
    }
    for (const [neili, launches] of [[69, 0], [70, 1], [129, 1], [130, 2]]) {
        const c = pick('perform', 360, 'neili' + neili), r = row(c); validateGumuHuboRecord(r, c);
        assert.equal(r.command_accepted, 1); assert.equal(r.launches.length, launches);
        assert.equal(r.immediate[0].neili, neili - launches * 60);
    }
    const c = pick('perform', 360, 'neili70'), r = row(c);
    r.hubo_steps[1].accepted = 1; assert.throws(() => validateGumuHuboRecord(r, c));
});

test('首招失败仍可尝试后招；后招拒绝不能抹掉首招忙乱与消耗', () => {
    for (const suffix of ['first-unknown', 'second-unknown']) {
        const c = pick('perform', 360, suffix), r = row(c); validateGumuHuboRecord(r, c);
        assert.equal(r.launches.length, 1); assert.equal(r.immediate[0].busy, 1);
        assert.equal(r.metrics[0].neili_cost, 60);
    }
    const c = pick('perform', 360, 'second-unknown'), r = row(c);
    r.immediate[0].busy = 0; assert.throws(() => validateGumuHuboRecord(r, c));
    assert.equal(row(pick('perform', 360, 'no-grant')).outcome, 'refused');
    assert.equal(row(pick('perform', 360, 'no-grant')).command_accepted, 1);
});

test('天罗首招控住目标时第二招按原条件拒绝，不以预定双招数充当成功', () => {
    const c = pick('perform', 360, 'target-dodge200');
    for (const control of [false, true]) validateGumuHuboRecord(row(c, { control }), c);
    const r = row(c, { control: true });
    assert.equal(r.launches.length, 1); assert.equal(r.immediate[1].busy, 27);
    r.busy_calls[0].after = 21; r.immediate[1].busy = 21;
    assert.throws(() => validateGumuHuboRecord(r, c));
    assert.equal(row(pick('perform', 360, 'target-busy')).launches.length, 0);
});

test('拒绝缺观察、错误身份、心跳污染、漏扣费与伪造逐招轨迹', () => {
    const c = pick('perform', 360);
    for (const change of [r => { delete r.hubo_steps; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[1].interactive = 0; }, r => { r.metrics[0] = null; },
        r => { r.metrics[0].heartbeats = 1; }, r => { r.metrics[0].neili_cost = null; },
        r => { r.hubo_steps[1].before[0].busy = 1; }, r => { r.launches.pop(); },
        r => { r.busy_calls.pop(); }, r => { r.busy_calls[0].caller_side = 1; },
        r => { r.attacks.push({}); }, r => { r.immediate[1].qi--; }]) {
        const r = row(c); change(r); assert.throws(() => validateGumuHuboRecord(r, c));
    }
});

test('统计不混知识／忙乱接口和命令，单招不加入两次发动分母，未知不补零', () => {
    const raws = [row(pick('perform', 360)), row(pick('perform', 200), { failGate: true }),
        row(pick('perform', 360, 'second-unknown')), row(pick('perform', 0, 'single')),
        row(pick('start_busy', 300, 'n9-side0')), { method: 'perform' }];
    const data = gumuHuboEffects([...raws.map(raw => ({ outcome: raw.outcome ?? 'observed', raw })), { outcome: 'error', raw: {} }]);
    assert.equal(data.command_samples, 5); assert.equal(data.unknown, 1); assert.equal(data.errors, 1);
    assert.equal(data.accepted.rate, 1); assert.equal(data.any_launch.rate, 3 / 4);
    assert.equal(data.two_launches.rate, 1 / 3); assert.equal(data.two_launches.trials, 3);
    assert.equal(data.second_refused, 1); assert.equal(data.entered_dual_attempts, 2);
    assert.equal(data.qualification_and_busy_interfaces, 1);
    assert.equal(gumuHuboEffects([]).two_launches.rate, null);
    const unknown = row(pick('perform', 360)); unknown.metrics[0].neili_cost = null;
    assert.equal(gumuHuboEffects([{ outcome: 'observed', raw: unknown }]).neili_cost.unknown, 1);
});

test('真实快照的空闲null按零核验，缺失或非法忙乱仍拒绝', () => {
    const nilBusy = value => {
        if (Array.isArray(value)) return value.map(nilBusy);
        if (!value || typeof value !== 'object') return value;
        return Object.fromEntries(Object.entries(value).map(([key, item]) =>
            [key, key === 'busy' && item === 0 ? null : nilBusy(item)]));
    };
    for (const c of cases) {
        const r = nilBusy(row(c));
        for (const call of r.busy_calls) {
            if (call.before === 0) call.before = null;
            if (call.after === 0) call.after = null;
        }
        validateGumuHuboRecord(r, c);
    }
    const gated = pick('perform', 200), failed = nilBusy(row(gated, { failGate: true }));
    failed.busy_calls[0].before = null; validateGumuHuboRecord(failed, gated);
    for (const change of [r => { delete r.before[0].busy; }, r => { delete r.immediate[1].busy; },
        r => { r.before[0].busy = '0'; }, r => { r.before[0].busy = -1; },
        r => { delete r.busy_calls[0].before; }, r => { delete r.hubo_steps[0].before[0].busy; }]) {
        const c = pick('perform', 360), r = row(c); change(r);
        assert.throws(() => validateGumuHuboRecord(r, c));
    }
});

test('快照性格按真实cultivation字段读取，忙乱接口不允许污染其他状态', () => {
    const c = pick('start_busy', 300, 'clever-side0');
    for (const change of [r => { delete r.before[0].cultivation.character; },
        r => { r.immediate[0].skills['zuoyou-hubo']++; },
        r => { r.immediate[1].cultivation.character = '光明磊落'; },
        r => { r.immediate[0].temp.changed = 1; },
        r => { delete r.interfaces[0].result; }]) {
        const r = row(c); change(r); assert.throws(() => validateGumuHuboRecord(r, c));
    }
    const r = row(c); r.immediate[0].temp.notify_fail = '仅命令拒绝信息';
    validateGumuHuboRecord(r, c);
});

test('统计区分已观察的空闲null与缺失的忙乱字段', () => {
    const idle = row(pick('perform', 100)); idle.immediate[0].busy = null;
    const missing = copy(idle); delete missing.immediate[0].busy;
    const summary = gumuHuboEffects([idle, missing].map(raw => ({ outcome: raw.outcome, raw })));
    assert.equal(summary.actor_busy.n, 1); assert.equal(summary.actor_busy.mean, 0);
    assert.equal(summary.actor_busy.unknown, 1);
});

test('统一入口仅追加166条件，旧12988条件360438计划完整内容不变', () => {
    const all = schoolCombatConditions(catalog), old = all.slice(0, 12988);
    assert.equal(old.length, 12988); assert.equal(old.reduce((n, c) => n + c.samples, 0), 360438);
    assert.equal(sha256(JSON.stringify(old)), '4a4a54e78de9e0f96c1da0974ae3106ed1742340e8e506c3b7256eb4c86b001c');
    const originalPlan = copy(cases);
    for (const c of originalPlan) delete c.parameters.expected;
    assert.equal(sha256(JSON.stringify(originalPlan)), '8f3c057d7f993ed3c96d7a4d266e6d0c19f842deaa561046e7aa67b636b3e7ff');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'gumu-hubo'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
});

test('启动前完整声明结果，静态门槛与随机双招区分，不从烟雾样本反推预期', () => {
    validateExpectedOutcomes(cases);
    validateExpectedOutcomes(gumuHuboConditions(catalog, { smoke: true }));
    for (const c of cases) assert.ok([].concat(c.parameters.expected).includes(row(c).outcome), c.id);
    for (const level of [101, 149, 150, 200, 299, 300, 359]) {
        const c = pick('perform', level);
        assert.deepEqual(c.parameters.expected, ['observed', 'refused']);
        assert.ok(c.parameters.expected.includes(row(c, { failGate: true }).outcome));
        assert.equal(pick('perform', level, 'single').parameters.expected, 'observed');
    }
    for (const suffix of ['count1', 'qinzong', 'int16', 'tiandao-count', 'force-low'])
        assert.equal(pick('valid_learn', 200, suffix).parameters.expected, 'refused');
    for (const suffix of ['mathematics1', 'tiandao', 'force-minimum'])
        assert.equal(pick('valid_learn', 200, suffix).parameters.expected, 'observed');
    assert.equal(pick('valid_learn', 49, 'asexual').parameters.expected, 'observed');
    assert.equal(pick('valid_learn', 50, 'asexual').parameters.expected, 'refused');
    for (const suffix of ['no-grant', 'count1', 'qinzong', 'busy', 'no-perform', 'no-fight', 'target-busy', 'neili69'])
        assert.equal(pick('perform', 360, suffix).parameters.expected, 'refused');
    for (const suffix of ['', 'first-unknown', 'second-unknown', 'asexual', 'int36', 'neili70', 'target-dodge200'])
        assert.equal(pick('perform', 360, suffix).parameters.expected, 'observed');
    for (const ability of ['type', 'valid_learn_level', 'skill_improved', 'start_busy'])
        assert.ok(cases.filter(c => c.parameters.ability === ability).every(c => c.parameters.expected === 'observed'));
    for (const ability of ['practice_skill', 'research'])
        assert.ok(cases.filter(c => c.parameters.ability === ability).every(c => c.parameters.expected === 'refused'));
});

test('报告将互搏单列，不把命令受理或知识接口写成伤害效果', () => {
    const c = pick('perform', 360, 'second-unknown'), raw = row(c);
    delete raw.parameters;
    const report = { fingerprint: 'synthetic', evidence_sha256: 'not-driver-evidence',
        totals: { conditions: 1, samples: 1, observed: 1, refused: 0 }, conditions: [{
            ...c, counts: { observed: 1, refused: 0 }, gumu_hubo: gumuHuboEffects([{ raw, outcome: raw.outcome }], c),
            effects: { callback_start_seconds: { mean: null }, target_callback_start_seconds: { mean: null } },
        }] };
    const text = schoolCombatMarkdown(report);
    assert.match(text, /左右互搏：资格、忙乱减免与双招分别观察/);
    assert.match(text, /命令受理不表示两招都发动/);
    assert.match(text, /第二招拒绝/);
    assert.equal(text.split(c.id).length - 1, 1);
});

test('真实原始日志不带parameters时使用冻结条件，不能全记未知或丢失双招分母', () => {
    for (const c of [pick('perform', 360), pick('perform', 0, 'single'), pick('perform', 360, 'second-unknown')]) {
        const raw = row(c), full = [{ raw, outcome: raw.outcome }];
        const expected = gumuHuboEffects(full, c);
        delete raw.parameters;
        assert.deepEqual(gumuHuboEffects(full, c), expected);
        assert.equal(gumuHuboEffects(full, c).unknown, 0);
        assert.equal(gumuHuboEffects(full, c).two_launches.trials, c.parameters.perform_arguments.length === 2 ? 1 : 0);
        assert.equal(gumuHuboEffects(full).unknown, 1);
    }
});

test('隔离入口观察原tell_object消息，零忙乱返回后重新读取而非推造终态', () => {
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.match(runner, /"function"\] == "skill_improved"[\s\S]*?type == "tell_object"[\s\S]*?current\["skill_messages"\] \+=/);
    assert.match(runner, /result = call_other\(players\[spec\["player_side"\]\], "start_busy", spec\["amount"\]\);[\s\S]*?if \(!spec\["amount"\]\)[\s\S]*?busy_call\["after"\] = serializable\(players\[spec\["player_side"\]\]->query_busy\(\)\);/);
    assert.doesNotMatch(runner, /call\["after"\] = call\["before"\]/);
    const normalized = runner.replace(/\s+/g, ' ');
    const remainingScope = '"mingjiao-qkd", "mingjiao-remaining-perform", "mingjiao-remaining-base" })) != -1 ||';
    assert.equal(normalized.split(remainingScope).length, 2, 'only the exact added busy restoration scope');
    assert.ok(normalized.replace(remainingScope, '"mingjiao-qkd" })) != -1 ||').includes(
        'if (member_array(current["parameters"]["collection_group"], '
        + '({ "gumu-hubo", "gumu-quanzhen", "gumu-temporal", "taohua-music", "mingjiao-qkd" })) != -1 || '
        + '(!side && member_array(current["parameters"]["teaching_profile"], '
        + '({ "gumu-recruit", "mingjiao-apprentice-learning", "mingjiao-recruit", "mingjiao-book" })) != -1)) '
        + 'ob->restore_busy(({ config["busy"], 0 })); else ob->start_busy(config["busy"]);'
    ), 'original exact busy restoration scopes and fallback remain');
});
