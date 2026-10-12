import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { shaolinRecruitConditions } from './shaolin_recruit_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'shaolin-recruit');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-shaolin-recruit-' + suffix));

// Synthetic reader tests only, not game or source evidence.
function fixture(c) {
    const p = c.parameters, props = p.actor.properties, teacher = p.teacher.path + '#2';
    let before = { ...props, contribution: props.gongxian, grants: {},
        skills: { ...p.actor.skills }, learned: {}, mappings: {}, max_jingli: 0,
        family: props.family?.family_name || 0, master_id: props.family?.master_id || 0,
        master_name: props.family?.master_name || 0, effective_int: props.int,
        effective_force: Math.trunc(p.actor.skills.force / 2),
        recruitment: { family: props.family || {}, name: props.name, class: props.class,
            title: '', pending_apprentice: '', pending_betrayer: '',
            flags: Object.fromEntries(['have_letter', 'apprentice_ok', 'valid_in_fumoquan'].map(k => [k, p.actor.temp?.[k] ?? 0])) } };
    return p.teaching_expectations.map(e => {
        const after = structuredClone(before), f = { ...e.family_after };
        if (e.recruited || before.recruitment.family.enter_time) f.enter_time = 1000;
        after.recruitment = { ...after.recruitment, family: f, name: e.name_after,
            title: e.recruited ? '少林派某代传人' : before.recruitment.title, flags: { ...e.flags_after },
            pending_apprentice: e.pending_apprentice ? teacher : '', pending_betrayer: e.pending_betrayer ? teacher : '' };
        after.family = f.family_name || 0; after.master_id = f.master_id || 0; after.master_name = f.master_name || 0;
        after.contribution -= e.contribution_spent;
        const step = { teacher, teacher_program: p.teacher.path, student: '/tests/teaching_actor#1',
            teacher_family: { ...p.teacher_family }, teacher_pending_recruit: '', command: e.action ?? p.action,
            command_accepted: e.command_accepted, wall_time: 1000, elapsed: 0.01, before: structuredClone(before), after,
            messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' };
        before = after; return step;
    });
}

test('少林63个NPC的原拜师入口独立覆盖，历史8449条件内容不变', () => {
    assert.equal(cases.length, 780); assert.equal(cases.reduce((n,c) => n+c.samples, 0), 1560);
    assert.equal(new Set(cases.map(c=>c.parameters.teacher.path)).size, 63);
    const prior = all.filter(c=>c.parameters.teaching_profile !== 'shaolin-recruit' && c.parameters.teaching_profile !== 'shaolin-promotion' && !['shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers'].includes(c.parameters.teaching_profile));
    assert.equal(prior.length, 8449);
    assert.equal(sha256(JSON.stringify(prior)), '8057142e438f17fdcb5621c971ab4f67d810ab02b7011318f26b941227b1efad');
});

test('所有确定性条件的完整状态校验，受理不等于实际拜师', () => {
    for (const c of cases) {
        const results = validateTeachingObservation(fixture(c), c);
        assert.equal(results.some(s => s.recruited), c.parameters.expected === 'observed', c.id);
    }
    const c = get('wuming-baseline'), rows = fixture(c);
    rows[0].after.recruitment.family.master_id = c.parameters.teacher.id;
    assert.throws(()=>validateTeachingObservation(rows,c));
});

test('重复请安不新增师承，取消只清意向，不预置意向对象', () => {
    const c=get('qing-fa-repeat'), rows=fixture(c);
    assert.deepEqual(validateTeachingObservation(rows,c).map(s=>s.recruited),[true,false]);
    rows[1].before.recruitment.name='中途改名';
    assert.throws(()=>validateTeachingObservation(rows,c), /步骤之间/);
    for(const c of cases) assert.ok(!Object.keys(c.parameters.actor.temp ?? {}).some(k=>k.startsWith('pending/')));
});

test('晋升只使用显式实验资格，三渡120门槛与达摩悟性缺陷均按原规则保留', () => {
    const x=get('xuan-ci-luohan-permission'); assert.equal(x.parameters.actor.properties.luohan_winner,1);
    assert.equal(x.parameters.expected,'observed');
    assert.equal(get('du-e-force-low').parameters.expected,'refused');
    const d=get('da-mo-int34'); assert.equal(d.parameters.actor.properties.int,34);
    assert.equal(d.parameters.expected,'observed');assert.equal(d.parameters.known_issue,'MA-018');
    const c=get('cheng-guan-letter-permission'), rows=fixture(c);
    rows[0].after.recruitment.flags.apprentice_ok=1;
    assert.throws(()=>validateTeachingObservation(rows,c));
});

test('出生师承、先天资质、费用和源码版本不能静默变化', () => {
    for(const change of [r=>r[0].before.int++,r=>r[0].after.jing--,
        r=>r[0].after.recruitment.family.generation++,r=>r[0].teacher_family.generation++,
        r=>r[0].before.recruitment.pending_apprentice=r[0].teacher]) {
        const c=get('da-mo-baseline'),rows=fixture(c);change(rows);
        assert.throws(()=>validateTeachingObservation(rows,c));
    }
    assert.throws(()=>shaolinRecruitConditions(relations,p=>readFileSync(p,'utf8')+
        (p==='cmds/skill/recruit.c'?'\n// changed':'')),/源码变化/);
});
