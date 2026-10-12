import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { taohuaNpcGroup, taohuaNpcCallbacks, taohuaNpcSources, taohuaNpcAbsentSources,
    taohuaNpcReviewed, taohuaNpcFixtureRequirements, taohuaNpcConditions, taohuaNpcEntries,
    validateTaohuaNpcPlan, validateTaohuaNpcRecord, taohuaNpcEffects } from './school_taohua_npc_cases.mjs';

const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const readSource = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = taohuaNpcConditions(catalog, readSource), smoke = taohuaNpcConditions(catalog, readSource, { smoke: true });
const copy = structuredClone;
const choose = (id, index = -1, state = id === 'huang' ? 'free' : 'original') => cases.find(c =>
    c.parameters.npc.id === id && c.parameters.npc.callback_index === index && c.parameters.npc.singleton_state === state);
const jade = '/clone/lonely/yuxiao', book = '/clone/lonely/book/zhenjing2', flower = '/d/items/throwing/taohua_ban';

// Synthetic contracts only. None of these rows is a real sample or submitted to a ledger.
function state(p, serial = 700) {
    const object = p.path + '#' + serial;
    const inventory = p.original.gear.map((program, i) => {
        const combined = program === flower, weapon = [jade, flower, '/clone/weapon/changjian'].includes(program);
        const weights = { [jade]: 500, [book]: 500, [flower]: 50, '/clone/weapon/changjian': 5000,
            '/clone/cloth/bupao': 3000, '/clone/misc/cloth': 3000, '/d/items/cloth/qing_bupao': 1000,
            '/d/items/armor/ruanwei_jia': 1000, '/d/items/headwear/jindai2': 50 };
        return { object: [jade, book].includes(program) ? program : program + '#' + (serial + i + 1),
            program, clone: [jade, book].includes(program) ? 0 : 1, environment: object, name: program.split('/').at(-1),
            skill_type: weapon ? combined ? 'throwing' : 'sword' : null,
            equipped: weapon || program === book ? null : 'worn', consistence: program === book ? null : 100,
            amount: combined ? 50 : null, weight: weights[program],
            weapon_prop: weapon ? { damage: program === jade ? 81 : combined ? 2 : 25 } : {}, armor_prop: {} };
    });
    const handLevel = Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => p.original.skills[k] ?? 0));
    return { object, program: p.path, name: p.original.name, clone: 1, userp: 0, playerp: null,
        interactive: 0, wizardp: 0, living: 1, busy: null,
        properties: { ...copy(p.original.props), id: p.original.id, qi: p.original.props.max_qi,
            eff_qi: p.original.props.max_qi, jing: p.original.props.max_jing, eff_jing: p.original.props.max_jing,
            neili: p.original.props.max_neili, chat_chance_combat: 120, potential: null,
            family: { family_name: '桃花岛', generation: p.id === 'huang' ? 1 : 2,
                title: p.id === 'huang' ? '岛主' : p.id === 'rong' ? '爱女'
                    : ['chen', 'mei'].includes(p.id) ? '被逐弟子' : '弟子' } },
        skills: copy(p.original.skills), mappings: copy(p.original.mappings), preparations: copy(p.original.preparations),
        learned: {}, inventory, weapon: 'none', weapon_object: '', secondary_weapon_object: '',
        handing_object: inventory.find(i => i.program === p.original.handing)?.object ?? '',
        combat_callbacks: taohuaNpcCallbacks[p.id].map(([entry, arg]) => `(: ${entry}, "${arg}" :)`),
        combat_callback_owners: taohuaNpcCallbacks[p.id].map(() => object),
        temp: { apply: { attack: 150, defense: 150, ...copy(p.original.apply) } }, callouts: [],
        effective_str: p.original.props.str + Math.trunc(handLevel / 10),
        effective_dex: p.original.props.dex + Math.trunc(p.original.skills.dodge / 10) };
}

function record(c, { hit = true, second = false, growth = 0, attackResult = 0, extraActions = 0, bonus = true } = {}) {
    const p = c.parameters.npc, before = state(p), after = copy(before), kind = p.effect;
    const user = { object: '/tests/left#500', userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1,
        ...copy(c.parameters.actor.properties), skills: copy(c.parameters.actor.skills),
        effective_skills: { force: 300, dodge: 300, parry: 300 }, busy: null, conditions: null,
        weapon: 'none', temp: { apply: { armor: 100 } } };
    const raw = { kind: 'sample', method: 'npc', condition_id: c.id, outcome: 'observed',
        before: [user, { ...copy(user), object: '/tests/right#501' }], after: [], attacks: [], npc_direct: [], callbacks: [] };
    raw.after = copy(raw.before); const target = raw.after[0];
    const n = raw.npc_observation = { before, after, target_object: user.object, room: '/tests/arena',
        called: p.callback_index < 0 ? 0 : 1, callback_index: p.callback_index,
        callback_owner: p.callback_index < 0 ? '' : before.object,
        callback_repr: p.callback_index < 0 ? '' : before.combat_callbacks[p.callback_index],
        result: kind === 'loadout' ? null : kind === 'refused' ? 0 : 1, steps: [], effect_callouts: [], singletons: [],
        execution: { target_active_after: 1 }, destroyed: 1,
        preparation: { entry_player: user.object, returned_player: user.object, initializer_actor: 'not_observed',
            npc_heartbeat_before: 1, npc_heartbeat_paused: 0, blueprint_heartbeat: 0, constructor_callbacks: [],
            loaded_before: [], loaded_after: [], created_npcs: [before.object] },
        cleanup: { enemies_removed: 1, remaining_callbacks: [], objects: [before.object, ...before.inventory.map(i => i.object)]
            .map(object => ({ object, destroyed: 1 })) } };
    if (n.called && ['chen', 'mei'].includes(p.id)) after.temp.my_killer = user.object;
    if (['chen', 'huang'].includes(p.id)) {
        const occupied = p.singleton_state === 'occupied';
        const companion = occupied ? state({ ...p, original: { ...p.original,
            gear: [jade, '/d/items/cloth/qing_bupao'], handing: jade } }, 900) : null;
        n.singletons = [{ object: p.id === 'chen' ? book : jade, clone: 0, state: occupied ? 'occupied' : 'free',
            initial_environment: companion?.object ?? '', before_environment: companion?.object ?? before.object,
            after_environment: companion?.object ?? before.object, companion_before: companion,
            companion_after: copy(companion), companion_room: companion ? '/tests/preparation' : '' }];
        if (companion) {
            n.preparation.created_npcs.push(companion.object);
            n.cleanup.objects.push(...[companion.object, ...companion.inventory.map(i => i.object)].map(object => ({ object, destroyed: 1 })));
        }
    }
    const event = (type, damage, percent) => ({ actor: -1, actor_object: before.object, actor_program: p.path,
        target: 0, target_object: user.object, type, damage, percent });
    const direct = (type, damage, percent) => {
        raw.npc_direct.push(event(type, damage, percent)); target.qi -= 300;
        if (percent) target.eff_qi -= 100;
    };
    const spend = amount => { after.properties.neili -= amount; };
    const timer = (type, delay) => n.effect_callouts.push({
        owner: type === 'ding' ? '/kungfu/skill/tanzhi-shentong/ding' : '/kungfu/skill/cuixin-zhang/cui',
        function: type === 'ding' ? 'ding_end' : 'cuixin_end', handle: 711,
        actor_object: before.object, target_object: user.object, delay, fired: 0, removed_remaining: delay, remaining_after: [] });
    const jiali = before.properties.jiali;
    if (kind === 'powerup') {
        spend(100); after.busy = 2; after.temp.powerup = 1;
        const lvl = before.skills['bibo-shengong'];
        after.temp.apply.attack += Math.trunc(lvl / 3); after.temp.apply.defense += Math.trunc(lvl / 3);
        after.callouts.push({ owner: before.object, function: 'eval_function', remaining: lvl });
    }
    if (kind === 'fu') { spend(100); after.busy = 1; target.busy = 14; }
    if (['kuang', 'fei'].includes(kind)) {
        const attackBonus = kind === 'kuang' ? Math.trunc(before.skills['xuanfeng-tui'] / 4)
            : bonus ? Math.trunc(before.skills['lanhua-shou'] / 5) : 0;
        for (let i = 0; i < 6; i++) raw.attacks.push({ ...event(0, attackResult === 0 ? 100 : 0, 0),
            result: attackResult, apply_attack: before.temp.apply.attack + attackBonus });
        spend((kind === 'kuang' ? 100 : 150) + (attackResult === 0 ? 6 * jiali : 0) + 300 * extraActions);
        if (attackResult === 0) { target.qi -= 600; target.eff_qi -= 100; }
        after.busy = kind === 'kuang' ? 4 : 0;
        if (kind === 'kuang' && hit) target.busy = 1;
        if (growth) { after.learned[kind === 'kuang' ? 'unarmed' : 'hand'] = growth; after.properties.potential = growth; }
    }
    if (kind === 'tao') { spend(hit ? 80 + jiali : 50); after.busy = hit ? 2 : 3; if (hit) direct(0, 140, 30); }
    if (kind === 'dai') { spend(hit ? 50 + jiali : 30); after.busy = hit ? 2 : 3; if (hit) direct(0, p.id === 'feng' ? 120 : 150, 20); }
    if (kind === 'qimen') { spend(150 + (hit ? jiali : 0)); after.busy = hit ? 2 : 3; if (hit) { target.busy = 3; direct(0, 180, 30); } }
    if (kind === 'duo') {
        spend(hit ? (second ? 250 : 100) + jiali : 250); after.busy = hit && !second ? 2 : 3;
        if (hit) direct(0, p.id === 'chen' ? 433 : 281, second ? 65 : 55);
    }
    if (kind === 'zhua') { spend(hit ? 230 + jiali : 50); after.busy = 2; if (hit) { direct(0, 495, 70); target.busy = 1; } }
    if (kind === 'cui') {
        spend(hit ? 260 + jiali : 120); after.busy = hit ? 2 : 3;
        if (hit) {
            direct(2, p.id === 'chen' ? 495 : 300, 40);
            const lvl = before.skills['cuixin-zhang'];
            target.conditions = { cuixin_zhang: { level: jiali, remain: jiali * Math.trunc(lvl / 50),
                id: before.properties.id, name: '催心掌掌力' } };
            target.temp.cuixin = 1; target.temp.apply.parry = -Math.trunc(lvl / 8); timer('cui', 5);
        }
    }
    if (kind === 'ding') {
        spend(hit ? 200 + jiali : 150); after.busy = hit ? 2 : 1;
        if (hit) { direct(2, 127, 0); target.temp.no_perform = 1; timer('ding', 1); }
    }
    if (kind === 'zhuan') { spend(hit ? 200 + jiali : 200); after.busy = hit ? 3 : 2; if (hit) direct(0, 1345, 100); }
    if (kind === 'bihai') { spend(200); after.busy = 1; target.jing -= 1617; target.eff_jing -= 1078; }
    if (kind === 'xiao') {
        after.busy = hit ? 3 : 4;
        if (hit) { target.jing -= 680; target.eff_jing -= 170; target.neili -= 1530; }
    }
    if (kind === 'po') {
        spend(300); after.busy = hit ? 2 : 3;
        const ammo = after.inventory.find(i => i.program === flower); ammo.amount--; ammo.weight--;
        if (hit) { target.qi -= 510; target.eff_qi -= 510; }
    }
    return raw;
}

function invalid(c, mutate, options) { const raw = record(c, options); mutate(raw); assert.throws(() => validateTaohuaNpcRecord(raw, c)); }

test('七原NPC42闭包，8配装和44次调用为52条件、1476/52计划，仍未执行', () => {
    validateTaohuaNpcPlan(cases, catalog, readSource); validateTaohuaNpcPlan(smoke, catalog, readSource, { smoke: true });
    assert.equal(taohuaNpcEntries(cases).length, 7); assert.equal(Object.values(taohuaNpcCallbacks).flat().length, 42);
    assert.equal(cases.length, 52); assert.equal(cases.filter(c => c.samples === 100).length, 14);
    assert.equal(cases.filter(c => c.parameters.npc.callback_index < 0).length, 8);
    assert.equal(cases.reduce((sum, c) => sum + c.samples, 0), 1476); assert.equal(smoke.reduce((sum, c) => sum + c.samples, 0), 52);
    assert.equal(sha256(JSON.stringify(cases)), '9ee4e16d6e3b52f3bd4f1d81d80f0961d0f595c4fb9351b2aeac1f2fbe8976e1');
    assert.equal(sha256(JSON.stringify(smoke)), 'e7ce42d788679e079a0f585b709fbf8d903f4ab2a23eadfc3bddb47f81d5e72c');
    assert.equal(taohuaNpcSources.length, 111); assert.equal(taohuaNpcAbsentSources.length, 10);
    assert.equal(sha256(JSON.stringify(taohuaNpcSources.map(p => [p, sha256(readSource(p))]))), taohuaNpcReviewed);
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed'); assert.equal(c.parameters.expected, 'observed');
        assert.equal(c.parameters.fighting, false); assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.actor.properties.max_neili, 10000); assert.equal(c.parameters.actor.properties.qi, 100000);
    }
});

test('有依据源码和缺失入口都冻结，ENOENT不能被权限/读取错误替代', () => {
    assert.throws(() => taohuaNpcConditions({ ...catalog, teachers: [] }, readSource));
    assert.throws(() => taohuaNpcConditions(catalog, p => p === taohuaNpcSources[0] ? readSource(p) + '\n' : readSource(p)));
    assert.throws(() => taohuaNpcConditions(catalog, p => taohuaNpcAbsentSources.includes(p) ? '' : readSource(p)));
    assert.throws(() => taohuaNpcConditions(catalog, p => { if (taohuaNpcAbsentSources.includes(p)) throw Object.assign(Error('denied'), { code: 'EACCES' }); return readSource(p); }));
    const altered = copy(cases); altered[0].parameters.npc.original.skills.force = 800;
    assert.throws(() => validateTaohuaNpcPlan(altered, catalog, readSource));
});

test('原准备和未持器决定可达性，不把缺失/未准备闭包拟造成功', () => {
    for (const id of ['feng', 'lu', 'qu']) {
        assert.equal(choose(id, 0).parameters.npc.effect, 'refused');
        assert.equal(choose(id, 4).parameters.npc.effect, 'refused');
    }
    for (const index of [1, 3, 4]) assert.equal(choose('mei', index).parameters.npc.effect, 'refused');
    assert.equal(choose('qu', 1).parameters.npc.effect, 'tao');
    for (const index of [2, 3]) assert.equal(choose('qu', index).parameters.npc.effect, 'refused');
    assert.equal(choose('huang', 0).parameters.npc.effect, 'bihai');
    assert.equal(choose('huang', 5).parameters.npc.effect, 'refused');
    assert.equal(choose('huang', 0, 'occupied').parameters.npc.effect, 'refused');
    assert.equal(choose('huang', 5, 'occupied').parameters.npc.effect, 'po');
    for (const c of cases.filter(c => c.parameters.npc.effect === 'refused')) invalid(c, r => { r.npc_observation.result = 1; });
    assert.ok(cases.filter(c => ['chen', 'mei'].includes(c.parameters.npc.id)).every(c => c.samples === 2));
});

test('52组合成契约及各可达随机未命中/九阴第二击分支，不称驱动验收', () => {
    for (const c of cases) {
        validateTaohuaNpcRecord(record(c), c);
        validateTaohuaNpcRecord(record(c, { hit: false }), c);
    }
    for (const id of ['chen', 'mei']) validateTaohuaNpcRecord(record(choose(id, 0), { second: true }), choose(id, 0));
});

test('明确未设置字段仅接受有键0/null，缺失/undefined/布尔/空串拒绝', () => {
    const c = choose('chen');
    for (const value of [0, null]) {
        const raw = record(c); raw.npc_observation.result = value;
        for (const s of [raw.npc_observation.before, raw.npc_observation.after]) {
            s.playerp = value; s.inventory.find(i => i.program === book).consistence = value;
        }
        validateTaohuaNpcRecord(raw, c);
    }
    for (const key of ['result', 'playerp', 'amount', 'consistence']) {
        const select = r => key === 'result' ? r.npc_observation : key === 'playerp' ? r.npc_observation.before
            : r.npc_observation.before.inventory.find(i => i.program === book);
        invalid(c, r => { delete select(r)[key]; });
        for (const value of [undefined, false, '', '0', 1, [], {}]) invalid(c, r => { select(r)[key] = value; });
    }
});

test('原NPC身份、闭包索引/owner/repr、真实靶和旁观者互不冒用', () => {
    const c = choose('huang', 3);
    for (const mutate of [r => { r.npc_observation.before.userp = 1; }, r => { r.npc_observation.before.clone = 0; },
        r => { r.npc_observation.callback_owner = r.before[0].object; }, r => { r.npc_observation.callback_index++; },
        r => { r.npc_observation.callback_repr = '(: <code>() :)'; }, r => { r.npc_observation.before.combat_callback_owners[0] = '/other'; },
        r => { r.npc_direct[0].actor = 0; }, r => { r.npc_direct[0].target_object = r.before[1].object; },
        r => { r.after[1].neili--; }, r => { r.before[0].interactive = 0; }, r => { r.after[0].living = 0; }]) invalid(c, mutate);
    invalid(c, r => { r.npc_observation.before.properties.family.family_name = '丐帮'; });
    invalid(c, r => { r.npc_observation.after.properties.family.generation++; });
    invalid(choose('chen', 0), r => { delete r.npc_observation.after.temp.my_killer; });
});

test('原装备/handing/单例归属保持；不允许外部占有者或强行持剑', () => {
    for (const c of [choose('feng'), choose('huang'), choose('huang', -1, 'occupied'), choose('chen')]) {
        invalid(c, r => { r.npc_observation.before.weapon = 'sword'; });
        invalid(c, r => { r.npc_observation.before.inventory[0].environment = '/tests/other'; });
        invalid(c, r => { r.npc_observation.before.handing_object = '/external'; });
        invalid(c, r => { r.npc_observation.after.inventory[0].weight++; });
    }
    const c = choose('huang', 5, 'occupied');
    invalid(choose('huang'), r => { r.npc_observation.before.inventory.find(i => i.program === jade).weapon_prop.damage = 90; });
    for (const mutate of [r => { r.npc_observation.singletons[0].companion_after.properties.neili--; },
        r => { r.npc_observation.singletons[0].companion_room = r.npc_observation.room; },
        r => { r.npc_observation.singletons[0].initial_environment = '/external/npc'; },
        r => { r.npc_observation.singletons[0].clone = 1; },
        r => { r.npc_observation.preparation.created_npcs.push('/external/npc'); }]) invalid(c, mutate);
});

test('花瓣50到49同一原物品，受理未命中仍扣一枚和300，非最后弹药实验', () => {
    const c = choose('huang', 5, 'occupied');
    validateTaohuaNpcRecord(record(c, { hit: false }), c);
    for (const key of ['amount', 'weight', 'object', 'environment']) invalid(c, r => {
        const item = r.npc_observation.after.inventory.find(i => i.program === flower);
        item[key] = typeof item[key] === 'number' ? 50 : 'changed';
    });
    invalid(c, r => { r.after[0].qi++; });
    invalid(c, r => { r.npc_observation.after.properties.neili++; }, { hit: false });
});

test('技能所有者定/催心真实句柄和目标关联必需，清理不是自然解除', () => {
    for (const c of [choose('huang', 3), choose('chen', 2), choose('mei', 2)]) {
        for (const mutate of [r => { delete r.npc_observation.effect_callouts; }, r => { r.npc_observation.effect_callouts = []; },
            r => { r.npc_observation.effect_callouts[0].handle = 0; }, r => { r.npc_observation.effect_callouts[0].target_object = r.before[1].object; },
            r => { r.npc_observation.effect_callouts[0].owner = r.npc_observation.before.object; },
            r => { r.npc_observation.effect_callouts[0].removed_remaining = -1; }, r => { r.npc_observation.effect_callouts[0].fired = 1; },
            r => { r.npc_observation.effect_callouts[0].remaining_after = [711]; },
            r => { r.npc_observation.cleanup.objects.pop(); }, r => { r.npc_observation.cleanup.objects[0].destroyed = 0; }]) invalid(c, mutate);
        invalid(c, r => { r.npc_observation.effect_callouts = record(c).npc_observation.effect_callouts; }, { hit: false });
    }
    assert.ok(taohuaNpcFixtureRequirements.some(s => s.includes('3 columns')));
});

test('直接输入类型/百分比与加力净费严格，不能把输入伤害当最终损血', () => {
    for (const c of cases.filter(c => ['tao', 'dai', 'qimen', 'duo', 'zhua', 'cui', 'ding', 'zhuan'].includes(c.parameters.npc.effect))) {
        invalid(c, r => { r.npc_direct[0].type = 1; }); invalid(c, r => { r.npc_direct[0].damage = 0; });
        invalid(c, r => { r.npc_direct[0].percent = 200; });
        invalid(c, r => { r.npc_observation.after.properties.neili += r.npc_observation.before.properties.jiali; });
    }
    const c = choose('huang', 3), row = record(c);
    assert.notEqual(row.npc_direct[0].damage, row.before[0].qi - row.after[0].qi);
    validateTaohuaNpcRecord(row, c);
    invalid(c, r => { r.after[0].eff_qi--; });
});

test('原六击加成回收与熟练成长独立；兰花query_action300包含未命中时的真实费用', () => {
    for (const c of [choose('feng', 3), choose('lu', 3), choose('rong', 1)]) {
        validateTaohuaNpcRecord(record(c, { growth: 6, attackResult: -1, bonus: false }), c);
        invalid(c, r => { r.attacks.pop(); }); invalid(c, r => { r.attacks[1].apply_attack++; });
        invalid(c, r => { r.npc_observation.after.temp.apply.attack++; });
        invalid(c, r => { r.npc_observation.after.learned.force = 1; });
        invalid(c, r => { r.npc_observation.after.properties.potential = 7; });
    }
    const c = choose('rong', 1);
    for (const extraActions of [0, 1, 6]) validateTaohuaNpcRecord(record(c, { attackResult: -2, extraActions }), c);
    invalid(c, r => { r.npc_observation.after.properties.neili--; }, { attackResult: -2 });
    invalid(c, r => { r.npc_observation.after.properties.neili -= 2100; }, { attackResult: -1 });
    invalid(choose('feng', 3), r => { r.npc_observation.after.properties.neili -= 300; }, { attackResult: -1 });
});

test('碧海与啸精神/创伤分列，啸实际零NPC费用与靶内力净差不能混淆', () => {
    const c = choose('huang', 4);
    validateTaohuaNpcRecord(record(c, { hit: false }), c);
    for (const mutate of [r => { r.npc_observation.after.properties.neili--; },
        r => { r.after[0].jing++; }, r => { r.after[0].eff_jing++; }, r => { r.after[0].neili++; },
        r => { r.after[0].qi--; }]) invalid(c, mutate);
    invalid(choose('huang', 0), r => { r.after[0].eff_jing++; });
    invalid(choose('huang', 0), r => { r.after[0].neili--; });
});

test('兰花拂穴固定靶必然受控14，强化113/80和原NPC定时撤销独立', () => {
    const c = choose('rong', 0); invalid(c, r => { r.after[0].busy = 13; });
    for (const c of [choose('huang', 7), choose('rong', 3)]) {
        invalid(c, r => { r.npc_observation.after.temp.apply.attack++; });
        invalid(c, r => { r.npc_observation.after.callouts[0].owner = r.before[0].object; });
        invalid(c, r => { r.npc_observation.after.callouts = []; });
        invalid(c, r => { r.npc_observation.after.properties.qi--; });
    }
});

test('即时催心毒和招架下降只挂原靶，不能伪报持续伤害或另一NPC来源', () => {
    for (const c of [choose('chen', 2), choose('mei', 2)]) {
        invalid(c, r => { r.after[0].conditions.cuixin_zhang.id = 'other npc'; });
        invalid(c, r => { r.after[0].conditions.cuixin_zhang.remain++; });
        invalid(c, r => { r.after[0].temp.apply.parry++; }); invalid(c, r => { r.after[0].jing--; });
        invalid(c, r => { r.after[0].temp.cuixin = 0; });
    }
});

test('统计只使用冻结condition与原件；方法受理/未命中/错误/配装分母不混', () => {
    const c = choose('huang', 3), raws = [record(c), record(c, { hit: false }),
        { kind: 'sample', method: 'npc', condition_id: c.id, outcome: 'error' }];
    const rows = raws.map(raw => ({ condition_id: c.id, outcome: raw.outcome, raw }));
    const before = JSON.stringify(rows), report = taohuaNpcEffects(rows, c);
    assert.equal(report.samples, 3); assert.equal(report.observed, 2); assert.equal(report.errors, 1);
    assert.equal(report.callbacks, 2); assert.equal(report.method_returned_one, 2); assert.equal(report.direct_calls, 1);
    assert.equal(report.npc_net_neili_spent.mean, 275); assert.equal(report.npc_gross_resource_accounting, 'not_observed');
    assert.equal(report.natural_control_poison_or_powerup_expiry, 'not_sampled'); assert.equal(JSON.stringify(rows), before);
    const loadout = choose('chen'), raw = record(loadout), summary = taohuaNpcEffects([{ condition_id: loadout.id, outcome: raw.outcome, raw }], loadout);
    assert.equal(summary.callbacks, 0); assert.equal(summary.loadouts, 1); assert.equal(summary.method_returned_zero, 0);
    const refused = choose('mei', 1), reject = record(refused);
    assert.equal(taohuaNpcEffects([{ condition_id: refused.id, outcome: reject.outcome, raw: reject }], refused).method_returned_zero, 1);
    assert.equal(taohuaNpcEffects([], c).npc_net_neili_spent.mean, null);
    assert.throws(() => taohuaNpcEffects(rows, choose('huang', 4)));
});
