import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { digest } from './ledger.mjs';
import { mingjiaoJiuyangConditions } from './school_mingjiao_jiuyang_cases.mjs';
import { mingjiaoJiuyangReport, mingjiaoJiuyangMarkdown } from './school_mingjiao_jiuyang_report.mjs';
const catalog = collectCatalog(root, buildInventory(root));
const condition = mingjiaoJiuyangConditions(catalog, p => readFileSync(join(root, p), 'utf8'))[0];
const cases = mingjiaoJiuyangConditions(catalog, p => readFileSync(join(root, p), 'utf8'));
// Independent pure state fixture, not a driver record and not a gameplay claim.
function known(c, passive = false, index = 0) {
    const state = (cfg, side) => {
        const s = { object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1,
            living: 1, wizardp: 0, ghost: 0, busy: null, fighting_opponent: 0, conditions: null,
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations), learned: {},
            cultivation: Object.fromEntries(['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
                'special_skill/guimai', 'wudang-jiuyang', 'immune/poison'].map(k => [k, null])),
            temp: { user_setup: 1, apply: { armor: 100 } }, craze: 0, max_craze: 5000,
            weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {}, handing: 'none', handing_details: {} };
        for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
            if (k.includes('/') || ['reborn', 'character', 'class', 'doing'].includes(k)) s.cultivation[k] = v; else s[k] = v;
        }
        s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
            [k, Math.trunc(v / 2) + (cfg.mappings[k] === 'jiuyang-shengong' ? cfg.skills['jiuyang-shengong'] : 0)]));
        s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10); s.effective_con = s.con + Math.trunc(cfg.skills.force / 10);
        s.effective_int = s.int; s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10); return s;
    };
    const p = c.parameters, before = [state(p.actor, 0), state(p.target, 1)], immediate = structuredClone(before);
    const result = passive ? '只见$N九阳内劲自体内迸发，真气随招式而荡漾，摧毁了$n的真元！\n'
        : { damage: -1000, msg: '$n默念九阳神功总诀，收敛内劲，承下$N这一招，$N只觉犹如石沉大海，丝毫不起作用。\n' };
    const metrics = passive ? [{ neili_cost: 50 }, { qi_cost: 460, eff_qi_cost: 460 }] : [{}, { neili_cost: 100 }];
    if (passive) { immediate[0].neili -= 50; immediate[1].qi -= 460; immediate[1].eff_qi -= 460; immediate[1].craze = 153; }
    else immediate[1].neili -= 100;
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: .01, outcome: 'observed', reason: '',
        before, immediate, after: structuredClone(immediate), metrics, command_accepted: 1,
        interfaces: [{ object: p.interface.object, function: p.ability, result, implemented_by: p.interface.object }],
        actions: [], attacks: [], directs: [], passives: passive ? [{ actor: 0, target: 1, skill: p.skill, incoming: 1000,
            factor: 0, result, route: 'interface', before: structuredClone(before), after: structuredClone(immediate) }] : [],
        defenses: passive ? [] : [{ actor: 0, target: 1, skill: p.skill, incoming: 1000, result, route: 'interface' }],
        defense_messages: [], dodge_checks: [], launches: [], refusals: [], callbacks: [], dropped: [], terminals: [],
        bhinfo: { before: null, after: null, cleared: null } };
    return { condition_id: c.id, index, outcome: raw.outcome, reason: raw.reason, raw, raw_sha256: digest(raw) };
}
const error = (outcome = 'error', index = 0) => {
    const raw = { kind: 'sample', condition_id: condition.id, method: condition.method, index, elapsed: 0.2,
        outcome, reason: '原样保留的未知原因' };
    return { condition_id: condition.id, index, outcome, reason: raw.reason, raw, raw_sha256: digest(raw) };
};
test('空九阳报告保留缺样本，不报告零费用或取消', () => {
    const summary = mingjiaoJiuyangReport([], condition); assert.equal(summary.effects, null);
    assert.equal(summary.coverage.missing, 2); assert.match(mingjiaoJiuyangMarkdown(summary), /未观测/);
});
test('九阳错误与不适用只保留未知，不伪造成零消耗', () => {
    for (const outcome of ['error', 'not_applicable']) {
        const summary = mingjiaoJiuyangReport([error(outcome)], condition);
        assert.equal(summary.coverage.unknown, 1); assert.equal(summary.effects.canceled, null);
        assert.equal(summary.effects.qi_cost, null); assert.equal(summary.effects.passive_neili_cost, null);
        assert.match(mingjiaoJiuyangMarkdown(summary), /未知/);
    }
});
test('九阳报告拒绝错误槽位、原件摘要、结果、理由及重复编号', () => {
    for (const mutate of [r => r.index = null, r => r.raw.index = 1, r => r.condition_id = 'other',
        r => r.raw_sha256 = '0'.repeat(64), r => r.reason = 'different', r => r.outcome = 'observed']) {
        const row = error(); mutate(row); assert.throws(() => mingjiaoJiuyangReport([row], condition));
    }
    assert.throws(() => mingjiaoJiuyangReport([error(), error()], condition));
});
test('九阳Markdown保留正常/未知分母，不接受缺失合计和伪零', () => {
    const summary = mingjiaoJiuyangReport([error()], condition);
    const a = structuredClone(summary); a.effects.qi_cost = 0;
    assert.throws(() => mingjiaoJiuyangMarkdown(a));
    const b = structuredClone(summary); delete b.effects.passive_calls;
    assert.throws(() => mingjiaoJiuyangMarkdown(b));
    const d = structuredClone(summary); d.coverage.missing = 0;
    assert.throws(() => mingjiaoJiuyangMarkdown(d));
});
test('九阳返回频数不能丢记录或覆盖同名分类，正文转义原件理由', () => {
    const summary = mingjiaoJiuyangReport([error()], condition);
    const a = structuredClone(summary); a.effects.interface_values = { null: 1 };
    assert.throws(() => mingjiaoJiuyangMarkdown(a));
    const b = structuredClone(summary); b.exceptional[0].reason = '<script>|`\x1b';
    const md = mingjiaoJiuyangMarkdown(b); assert.match(md, /&lt;script&gt;/); assert.doesNotMatch(md, /<script>|\x1b/);
});
test('正常取消的频数累加且费用只记防御方，不冒充附伤或扣血', () => {
    const c = cases.find(c => c.parameters.variant === 'damage-input1000');
    const rows = [known(c), known(c, false, 1)], before = JSON.stringify(rows);
    const s = mingjiaoJiuyangReport(rows, c);
    assert.equal(s.effects.canceled, 2); assert.equal(s.effects.defense_neili_cost, 200);
    assert.equal(s.effects.qi_cost, 0); assert.equal(s.effects.passive_neili_cost, 0);
    assert.deepEqual(Object.values(s.effects.interface_values), [2]);
    assert.match(mingjiaoJiuyangMarkdown(s), /防御内力支出/); assert.equal(JSON.stringify(rows), before);
    const bad = structuredClone(s); bad.effects.interface_values = {}; assert.throws(() => mingjiaoJiuyangMarkdown(bad));
});
test('正常被动创伤与气血夹制毛损同源，不能当成公共扣血', () => {
    const c = cases.find(c => c.parameters.variant === 'hit-input1000'), row = known(c, true);
    const s = mingjiaoJiuyangReport([row], c);
    assert.equal(s.effects.triggered, 1); assert.equal(s.effects.passive_wound, 460);
    assert.equal(s.effects.passive_neili_cost, 50); assert.equal(s.effects.qi_cost, 460);
    assert.equal(s.effects.public_damage, 0); assert.equal(s.effects.public_wound, 0);
    assert.match(mingjiaoJiuyangMarkdown(s), /九阳原创伤/);
});
