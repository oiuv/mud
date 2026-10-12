import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangLookupConditions, validateWudangLookupRecord, lookupEffects } from './school_wudang_lookup_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = wudangLookupConditions(catalog);
const pick = mode => cases.find(c => c.parameters.skill === 'taiji-shengong' && c.parameters.lookup_mode === mode);

// Artificial records exercise the validator, not evidence of actual game execution.
function row(c) {
    const p = c.parameters, mode = p.lookup_mode, success = p.expected === 'observed';
    const before = [p.actor, p.target].map((cfg, i) => ({ ...cfg.properties, id: i ? 'right' : 'left',
        skills: cfg.skills, mappings: cfg.mappings, object: '/tests/actor#' + i,
        interactive: 1, wizardp: 0, busy: cfg.busy ?? null }));
    const s = structuredClone(before[1]);
    if (['by-living', 'no-environment'].includes(mode)) { s.interactive = 0; s.object = '/tests/actor#2'; }
    const b = { state: s, room: mode === 'no-environment' ? '' : '/tests/runner', room_short: '演武场', name: '寻踪弟子' };
    const a = structuredClone(b); if (success && ['west', 'far'].includes(mode)) a.room = '/d/foshan/street3';
    const reasons = { 'no-permission': '没有这种功能', 'no-quest': '没有这种功能', 'not-found': '没有找到这个人物',
        'no-environment': '不知道在那里', busy: '上一个动作', 'no-force-map': 'enable' };
    return { before, immediate: structuredClone(before), after: structuredClone(before),
        outcome: p.expected, command_accepted: Number(success), reason: reasons[mode] ?? '',
        attacks: [], callbacks: [], launches: success ? [{ skill: 'force' }] : [], metrics: [{}, {}],
        lookup: { permission: p.actor.properties['can_perform/wiz_test'], before: b, after: a,
            find_player: mode === 'by-player' ? s.object : 0,
            find_living: ['by-player', 'by-living'].includes(mode) ? s.object : 0,
            find_object: ['by-player', 'by-living', 'no-quest', 'not-found'].includes(mode) ? 0 : s.object },
        lookup_messages: success ? [`${b.name}(${s.id})现在在${b.room_short}(${b.room}).\n`] : [] };
}

test('寻人42项确定性条件，三内功分别覆盖；历史条件数和样本量不变', () => {
    assert.equal(cases.length, 42); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 84);
    assert.equal(new Set(cases.map(c => c.id)).size, 42);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4122); assert.equal(old.reduce((s, c) => s + c.samples, 0), 105390);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'wudang-lookup'), cases);
    assert.deepEqual(wudangLookupConditions(catalog, { smoke: true }), cases);
});

test('完整分支的原始位置、身份与命令输出必须可核验', () => {
    for (const c of cases) { validateWudangLookupRecord(row(c), c); validateSchoolCombatRecord(row(c), c); }
});

test('三种查找不能互相冒充；未连接对象不当玩家路径', () => {
    for (const mode of ['by-player', 'by-living', 'by-object']) {
        const c = pick(mode), r = row(c);
        r.lookup[mode === 'by-player' ? 'find_player' : mode === 'by-living' ? 'find_living' : 'find_object'] = 0;
        assert.throws(() => validateWudangLookupRecord(r, c));
    }
});

test('移动后原文仍报旧位置的缺陷有独立计数，不能误报正常定位', () => {
    const c = pick('west'), r = row(c);
    const stats = lookupEffects([{ outcome: r.outcome, raw: r }]);
    assert.equal(stats.moved, 1); assert.equal(stats.stale_reports, 1);
    r.lookup_messages[0] = r.lookup_messages[0].replace('/tests/runner', '/d/foshan/street3');
    assert.throws(() => validateWudangLookupRecord(r, c));
});

test('拒绝必须保存原原因，资源改变和缺消息不能通过', () => {
    const c = pick('busy'), r = row(c); r.reason = '';
    assert.throws(() => validateWudangLookupRecord(r, c));
    const ok = pick('zero-neili'), cost = row(ok); cost.metrics[0].neili_cost = 1;
    assert.throws(() => validateWudangLookupRecord(cost, ok));
    const blank = row(ok); blank.lookup_messages = [];
    assert.throws(() => validateWudangLookupRecord(blank, ok));
    assert.equal(lookupEffects([{ outcome: 'error', raw: {} }]).unknown, 1);
});
