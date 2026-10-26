import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSeries } from './ledger.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { emeiNpcConditions, emeiNpcGroup, npcEntries, validateEmeiNpcRecord } from './school_emei_npc_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = emeiNpcConditions(catalog);

test('原NPC批覆盖28配置与8原闭包，不改旧11544条件', () => {
    const all = schoolCombatConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => ![emeiNpcGroup, 'emei-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11544); assert.equal(old.reduce((n, c) => n + c.samples, 0), 289308);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'), '89e542db4bd6d8ba5c200b38eff5456bd83288c151737fcacfbadc31c4ca9bb7');
    assert.equal(cases.length, 36); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 216);
    assert.equal(npcEntries(cases).length, 28); validateSchoolCombatPlan(cases, catalog);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
});

test('烟雾独立且不改原NPC配置、不补鞭或改错名', () => {
    const smoke = emeiNpcConditions(catalog, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 36);
    for (const c of cases) {
        assert.deepEqual(Object.keys(c.parameters.npc).sort(), ['callback_index', 'path', 'source']);
        assert.equal(c.parameters.fighting, false); assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.method, 'npc');
    }
    assert.throws(() => emeiNpcConditions({ teachers: [] }));
});

test('台账必须登记原NPC证据，错hash/越界来源不能入库', () => {
    const create = (entries) => createSeries(mkdtempSync(join(tmpdir(), 'mud-npc-ledger-')),
        { inventory, catalog, conditions: cases, execution: { test: true }, npcEntries: entries });
    assert.equal(create(npcEntries(cases)).identity.conditions.length, 36);
    assert.throws(() => create([]), /不在源码清单/);
    const wrong = structuredClone(npcEntries(cases)); wrong[0].sha256 = '0'.repeat(64);
    assert.throws(() => create(wrong), /不属于当前源码/);
    wrong[0].path = '../npc.c'; wrong[0].id = wrong[0].path;
    assert.throws(() => create(wrong));
});

test('缺失NPC证据或冒充已加载配置不能通过', () => {
    assert.throws(() => validateEmeiNpcRecord({ outcome: 'observed' }, cases[0]), /缺少原 NPC/);
    assert.throws(() => validateEmeiNpcRecord({ outcome: 'refused' }, cases[0]));
});

function snapshotRecord(c) {
    const before = { program: c.parameters.npc.path, name: '测试用快照', clone: 1, userp: 0,
        playerp: null, living: 1, skills: { force: 100 }, mappings: {}, preparations: {},
        inventory: [], properties: { neili: 1000 }, temp: {} };
    return { outcome: 'observed', npc_observation: { before, after: structuredClone(before), called: 0, destroyed: 1 } };
}

test('原playerp空值可保留，但真玩家/未清理/偷偷改配装必须拒绝', () => {
    const c = cases[0], r = snapshotRecord(c);
    validateEmeiNpcRecord(r, c);
    for (const mutate of [r => { r.npc_observation.before.playerp = 1; },
        r => { r.npc_observation.destroyed = 0; },
        r => { r.npc_observation.after.skills.force = 400; },
        r => { r.npc_observation.after.inventory.push({ program: '/tests/whip' }); }]) {
        const changed = structuredClone(r); mutate(changed);
        assert.throws(() => validateEmeiNpcRecord(changed, c));
    }
});

test('原错误闭包不可被替换入口、假报成功或暗扣内力', () => {
    const c = cases.find(c => c.id.endsWith('zhou-callback1')), r = snapshotRecord(c);
    Object.assign(r.npc_observation.before, { weapon: 'none', skills: { 'jiuyin-baiguzhao': 260 },
        mappings: { parry: 'yinlong-bian' }, preparations: { strike: 'cuixin-zhang', claw: 'jiuyin-baiguzhao' },
        properties: { neili: 6000 }, combat_callbacks: Array.from({ length: 8 }, (_, i) => i === 1 ? '(: perform_action, "claw.jie" :)' : '') });
    Object.assign(r.npc_observation, { called: 1, callback_index: 1, result: 0,
        after: structuredClone(r.npc_observation.before) });
    validateEmeiNpcRecord(r, c);
    for (const mutate of [r => { r.npc_observation.result = 1; },
        r => { r.npc_observation.after.properties.neili -= 100; },
        r => { r.npc_observation.before.combat_callbacks[1] = '(: perform_action, "claw.zhua" :)'; }]) {
        const changed = structuredClone(r); mutate(changed);
        assert.throws(() => validateEmeiNpcRecord(changed, c));
    }
});

test('原NPC夺命连环保留加力200：首中300、变招中450、全失250', () => {
    const c = cases.find(c => c.id.endsWith('zhou-callback0'));
    for (const [busy, hits, cost] of [[2, 1, 300], [3, 1, 450], [3, 0, 250]]) {
        const r = snapshotRecord(c), n = r.npc_observation;
        Object.assign(n.before, { weapon: 'none', skills: { 'jiuyin-baiguzhao': 260 },
            mappings: { parry: 'yinlong-bian' }, preparations: { strike: 'cuixin-zhang', claw: 'jiuyin-baiguzhao' },
            properties: { neili: 6000 }, combat_callbacks: ['(: perform_action, "claw.duo" :)', ...Array(7).fill('')] });
        Object.assign(n, { called: 1, callback_index: 0, result: 1, after: structuredClone(n.before) });
        n.after.busy = busy; n.after.properties.neili -= cost;
        r.npc_direct = hits ? [{ actor_program: c.parameters.npc.path, target: 0 }] : [];
        validateEmeiNpcRecord(r, c);
        const wrong = structuredClone(r); wrong.npc_observation.after.properties.neili += 200;
        assert.throws(() => validateEmeiNpcRecord(wrong, c));
    }
});
