// Actual source/catalog preparation checks only; these are not simulated native samples.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource, sha256 } from './inventory.mjs';
import { buildCatalog } from './catalog.mjs';
import { mingjiaoCombinationGroup as combo, mingjiaoNpcBoutGroup as npc,
    mingjiaoCombinationSourcePaths as paths, mingjiaoCombinationReviewedSourceHash as sourceHash,
    mingjiaoCombinationConditions as make, validateMingjiaoCombinationPlan as validate,
} from './school_mingjiao_combination_cases.mjs';

const root = process.env.MUD_COMBINATION_SOURCE_ROOT ?? fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(resolve(root, path));
// Run the real catalog extractor over this public subset, including real function roles.
const files = paths.filter(p => /^(?:kungfu\/(?:skill|class)\/|include\/weapon\.h$)/.test(p))
    .map(path => ({ path, sha256: sha256(read(path)),
        scope: path.startsWith('kungfu/skill/') ? 'skill' : path.startsWith('kungfu/class/') ? 'class' : 'header_dependency',
        ...scanSource(read(path).toString()) }));
const catalog = buildCatalog({ files, source_fingerprint: 'scoped-source-preparation-not-a-full-inventory' },
    read('data/e2c_dict.o').toString());
const formal = make(catalog, read), smoke = make(catalog, read, { smoke: true });
const total = rows => rows.reduce((n, c) => n + c.samples, 0);
const select = (id, rows = formal) => {
    const c = rows.find(c => c.id === id); assert.ok(c, id); return c;
};
const c = id => select('school-mingjiao-combination-' + id).parameters;
const n = id => select('school-mingjiao-npc-bout-' + id).parameters;
const changed = (rows, edit) => { const x = structuredClone(rows); edit(x); return x; };

test('finite 37 rows bind formal 1020 and independent smoke 74 without gameplay execution', () => {
    assert.equal(formal.length, 37); assert.equal(new Set(formal.map(c => c.id)).size, 37);
    assert.equal(total(formal), 1020); assert.equal(total(smoke), 74);
    assert.equal(total(formal.filter(c => c.parameters.collection_group === combo)), 840);
    assert.equal(total(formal.filter(c => c.parameters.collection_group === npc)), 180);
    assert.equal(formal.filter(c => c.parameters.collection_group === combo).length, 28);
    assert.equal(formal.filter(c => c.parameters.collection_group === npc).length, 9);
    assert.deepEqual(Object.fromEntries(['interface', 'prepare', 'round', 'bout'].map(method =>
        [method, formal.filter(c => c.method === method).length])), { interface: 6, prepare: 14, round: 8, bout: 9 });
    assert.deepEqual(validate(formal, catalog, read), formal);
    assert.deepEqual(validate(smoke, catalog, read, { smoke: true }), smoke);
    for (const row of formal) {
        assert.match(row.id, /^[a-z][a-z0-9_-]*$/); assert.equal(row.status, 'prepared_not_sampled');
        assert.equal(row.parameters.integration.registered, false);
        assert.equal(row.parameters.integration.native_samples, 'not_collected');
        assert.ok(row.parameters.integration.missing.includes('strict_raw_record_and_effect_validation'));
    }
});

test('six actual valid_combine sources retain asymmetric external pair and real catalog role', () => {
    for (const [a, b, expected] of [['yinfeng-dao', 'tougu-zhen', 1], ['tougu-zhen', 'yinfeng-dao', 1],
        ['nianhua-zhi', 'sanhua-zhang', 1], ['sanhua-zhang', 'nianhua-zhi', 1],
        ['pili-quan', 'feihua-zhang', 1], ['feihua-zhang', 'pili-quan', 0]]) {
        const p = c(`${a}-allows-${b}`), s = catalog.skills.find(s => s.id === a);
        assert.equal(p.interface.object, '/kungfu/skill/' + a); assert.equal(p.interface.combo, b);
        assert.equal(p.combine_result, expected);
        const e = s.entries.find(e => e.function === 'valid_combine');
        assert.equal(e.role, 'query_or_gate'); assert.equal(p.source_entry.entry_id, e.id);
        assert.equal(p.source_entry.line, e.evidence.line);
    }
});

test('two command routes do not symmetrize compatibility or erase an earlier successful step', () => {
    const names = c('pili-quan-feihua-zhang-names').prepare_commands;
    const reversed = c('feihua-zhang-pili-quan-names').prepare_commands;
    const sequence = c('pili-quan-feihua-zhang-sequential').prepare_commands;
    const reverseSequence = c('feihua-zhang-pili-quan-sequential').prepare_commands;
    assert.equal(names[0].accepted, 1); assert.equal(reversed[0].accepted, 0);
    assert.deepEqual(reversed[0].preparations, {});
    assert.deepEqual(sequence.map(s => s.accepted), [1, 0]);
    assert.deepEqual(sequence[1].preparations, { cuff: 'pili-quan' });
    assert.equal(c('pili-quan-feihua-zhang-sequential').expected, 'observed');
    assert.deepEqual(reverseSequence.map(s => s.accepted), [1, 1]);
    assert.deepEqual(reverseSequence[1].preparations, { strike: 'feihua-zhang', cuff: 'pili-quan' });
    assert.equal(c('feihua-zhang-pili-quan-names').expected, 'refused');
});

test('cancel, third-item refusal and eight fixed rounds use actual prepare commands only', () => {
    assert.deepEqual(c('cancel-and-replace').prepare_commands.map(s => s.action),
        ['prepare yinfeng-dao tougu-zhen', 'prepare none', 'prepare yinfeng-dao']);
    const third = c('third-refused'); assert.equal(third.actor.skills['pili-quan'], 200);
    assert.equal(third.actor.mappings.cuff, 'pili-quan');
    assert.equal(third.prepare_commands[1].accepted, 0);
    assert.deepEqual(third.prepare_commands[1].preparations, third.prepare_commands[0].preparations);
    for (const row of formal.filter(c => c.method === 'round')) {
        const p = row.parameters;
        assert.equal(row.samples, 100); assert.equal(p.action, 'fight_round'); assert.equal(p.observe_seconds, 0);
        assert.equal(p.actor.skills.force, 600); assert.equal(p.actor.skills.dodge, 600);
        assert.equal(p.actor.skills.parry, 200); assert.equal(p.actor.properties.str, 36);
        assert.equal(p.actor.properties.dex, 36); assert.equal(p.actor.properties.jiali, 0);
        assert.equal(p.actor.properties.neili, 6000); assert.equal(p.actor.properties.max_neili, 6000);
        assert.deepEqual(p.actor.preparations, {}); assert.equal(p.actor.equipment, undefined);
        assert.equal(p.actor.mappings.force, undefined); assert.equal(p.actor.action_flag, undefined);
        assert.deepEqual(p.target.skills, { unarmed: 600, force: 600, dodge: 600, parry: 600 });
        assert.deepEqual(p.target.mappings, {}); assert.equal(p.target.equipment, undefined);
        assert.equal(p.skill === 'pili-quan' || p.skill === 'feihua-zhang', false);
        assert.ok(p.prepare_commands.every(s => s.action.startsWith('prepare ') && s.accepted === 1));
    }
});

test('nine original NPCs have natural 20 x 30s windows, alternating first heartbeat and separate smoke', () => {
    for (const row of formal.filter(c => c.method === 'bout')) {
        const p = row.parameters, small = select(row.id, smoke);
        assert.equal(row.samples, 20); assert.equal(p.observe_seconds, 30);
        assert.equal(small.samples, 2); assert.equal(small.parameters.observe_seconds, 3);
        assert.equal(p.first, 'alternating_index'); assert.equal(p.strategy, 'original_npc_chat');
        assert.equal(p.npc.callback_index, -1); assert.equal(p.npc.callback, null);
        assert.equal(p.actor_role, 'neutral_user_opponent'); assert.equal(p.target_role, 'outside_arena_bystander');
        assert.deepEqual(p.actor, p.target); assert.deepEqual(p.actor.preparations, {});
        assert.equal(p.actor.equipment.type, 'sword'); assert.equal(p.actor.skills.sword, 200);
        assert.equal(p.requirements.npc_gross_resources, 'not_observed');
        assert.equal(p.requirements.public_fight_acceptance, 'not_covered');
        assert.equal(p.requirements.coagent_assistance, 'not_covered');
        assert.deepEqual(p.capture_skill_loads.map(s => s.skill), ['qishang-quan', 'shenghuo-ling']);
        assert.equal(p.requirements.native_outcome_policy, 'original_terminal_or_duration_no_replacement');
    }
});

test('constructor mappings differ from invalid declarations and closures are not constructor preparation', () => {
    const f = n('fanyao').npc.original, d = n('daijisi').npc.original, z = n('zhangwuji').npc.original;
    assert.equal(f.mapping_declarations.force, 'shenhuo-shengong'); assert.equal(f.mappings.force, undefined);
    assert.deepEqual(f.preparations, {});
    assert.deepEqual(f.callbacks, [['prepare_skill', 'finger', 'nianhua-zhi'], ['prepare_skill', 'strike', 'sanhua-zhang']]);
    assert.equal(f.gear.includes('/clone/weapon/gangjian'), true);
    assert.equal(d.mapping_declarations.parry, 'yinfeng-dao'); assert.equal(d.mappings.parry, undefined);
    assert.equal(d.skills['yinfeng-dao'], undefined);
    assert.equal(z.mappings.dodge, 'qiankun-danuoyi'); assert.equal(z.mappings.unarmed, 'jiuyang-shengong');
    assert.equal(z.mappings.force, 'shenghuo-shengong');
    assert.deepEqual(n('yintianzheng').npc.original.preparations, { strike: 'yinfeng-dao', finger: 'tougu-zhen' });
    assert.deepEqual(n('xiaozhao').npc.original.callbacks, []);
    assert.deepEqual(n('xiaozhao').npc.original.combat_exp,
        { observation: 'original_random', minimum: 50000, maximum: 59999 });
    assert.deepEqual(n('xiaozhao').npc.original.gear, ['/clone/misc/cloth']);
    assert.equal(n('yangxiao').npc.original.callbacks.length, 4);
    assert.equal(n('yangxiao').npc.original.props.chat_chance_combat, 20);
    assert.equal(n('xiaozhao').npc.original.props.chat_chance_combat, undefined);
    assert.equal(n('xiaozhao').npc.original.props.neili, undefined, 'do not invent a constructor neili assignment');
    for (const [id, jiali, qi] of [['daijisi', 210, 6500], ['fanyao', 200, 6500], ['lengqian', 75, 2200],
        ['weiyixiao', 160, 4500], ['xiaozhao', 50, 500], ['xiexun', 210, 6500],
        ['yangxiao', 150, 7500], ['yintianzheng', 210, 6500], ['zhangwuji', 200, 8800]]) {
        const original = n(id).npc.original;
        assert.equal(original.props.jiali, jiali); assert.equal(original.props.max_qi, qi);
        assert.equal(original.construction_evidence.length, Object.keys(original.props).length);
        for (const e of original.construction_evidence) {
            assert.equal(e.path, `kungfu/class/mingjiao/${id}.c`);
            assert.equal(e.sha256, sha256(read(e.path))); assert.equal(e.value, original.props[e.key]);
            assert.ok(read(e.path).toString().split('\n')[e.line - 1].includes(`set(${JSON.stringify(e.key)}, ${JSON.stringify(e.value)})`));
        }
    }
});

test('161 public source pins include original NPCs, gear, callbacks, common guards and exact dictionary', () => {
    assert.equal(paths.length, 161); assert.equal(new Set(paths).size, paths.length);
    assert.equal(sha256(JSON.stringify(paths.map(p => [p, sha256(read(p))]))), sourceHash);
    for (const p of ['feature/coagent.c', 'feature/guarder.c', 'inherit/char/npc.c', 'inherit/armor/cloth.c',
        'd/items/staff_data.h', 'd/items/cloth_data.h', 'clone/weapon/gangjian.c',
        'kungfu/skill/shenghuo-ling/can.c', 'kungfu/skill/shenghuo-shengong.c', 'data/e2c_dict.o']) assert.ok(paths.includes(p), p);
    assert.deepEqual(paths.filter(p => p.startsWith('data/')), ['data/e2c_dict.o']);
    for (const row of formal) {
        assert.deepEqual(row.parameters.qualification_sources, paths);
        assert.deepEqual(Object.keys(row.parameters.source_evidence), paths);
    }
});

test('formal and smoke are explicitly bound, input counts cannot silently shrink or grow', () => {
    for (const value of [0, 1, 2, 99, 101, -1, NaN, '100']) assert.throws(() => make(catalog, read, { samples: value }));
    for (const value of [0, 1, 'false', null]) assert.throws(() => make(catalog, read, { smoke: value }));
    assert.throws(() => validate(smoke, catalog, read));
    assert.throws(() => validate(formal, catalog, read, { smoke: true }));
    assert.throws(() => validate(formal.slice(1), catalog, read));
    for (const edit of [rows => rows[0].samples++, rows => rows[0].parameters.run_mode = 'smoke',
        rows => rows.at(-1).parameters.observe_seconds = 3, rows => rows.at(-1).samples = 2,
        rows => rows[1].parameters.prepare_commands[0].accepted = 0,
        rows => rows[0].parameters.source_evidence[paths[0]] = '0'.repeat(64),
        rows => rows[0].parameters.integration.registered = true])
        assert.throws(() => validate(changed(formal, edit), catalog, read));
});

test('source drift and malformed catalog role, owner, identity, line or duplicate reject', () => {
    assert.throws(() => make(catalog, p => p === paths[0] ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
    const source = catalog.skills.find(s => s.id === 'pili-quan');
    for (const edit of [x => x.skills.push(structuredClone(source)),
        x => x.skills.find(s => s.id === 'pili-quan').sha256 = '0'.repeat(64),
        x => x.skills.find(s => s.id === 'pili-quan').entries.find(e => e.function === 'valid_combine').role = 'perform',
        x => x.skills.find(s => s.id === 'pili-quan').entries.find(e => e.function === 'valid_combine').evidence.line++,
        x => x.teachers.push(structuredClone(x.teachers[0])),
        x => x.teachers[0].npc_skills[0].values[1]++,
        x => x.teachers[0].npc_skills[0].evidence.sha256 = '0'.repeat(64),
        x => x.teachers[0].npc_skills[0].evidence.path = 'kungfu/class/gumu/li.c']) {
        const x = structuredClone(catalog); edit(x); assert.throws(() => make(x, read));
    }
});

test('fresh factory outputs do not leak mutations into later plans or source pin arrays', () => {
    const x = make(catalog, read); x[0].parameters.actor.skills.force = 1;
    x[0].parameters.source_evidence[paths[0]] = '0'.repeat(64);
    x.at(-1).parameters.npc.original.mappings.force = 'jiuyang-shengong';
    assert.deepEqual(make(catalog, read), formal); assert.throws(() => validate(x, catalog, read));
    assert.equal(Object.isFrozen(paths), true);
});
