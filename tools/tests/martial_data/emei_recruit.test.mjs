import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { emeiRecruitConditions } from './emei_recruit_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'emei-recruit');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-emei-recruit-' + suffix));

// Synthetic observations test the reader, not original game behavior.
function fixture(c) {
    const p = c.parameters, props = p.actor.properties, teacher = p.teacher.path + '#2';
    let before = { ...props, contribution: props.gongxian, grants: {},
        skills: { ...p.actor.skills }, learned: {}, mappings: {}, max_jingli: 0,
        family: props.family?.family_name || 0, master_id: props.family?.master_id || 0,
        master_name: props.family?.master_name || 0, effective_int: props.int,
        effective_force: Math.trunc(p.actor.skills.force / 2),
        recruitment: { family: props.family || {}, name: props.name, class: props.class,
            title: '', pending_apprentice: '', pending_betrayer: '',
            flags: { have_letter: 0, apprentice_ok: 0, valid_in_fumoquan: 0 } } };
    return p.teaching_expectations.map(e => {
        const after = structuredClone(before), f = { ...e.family_after };
        if (e.recruited || before.recruitment.family.enter_time) f.enter_time = 1000;
        after.recruitment = { ...after.recruitment, family: f, name: e.name_after, class: e.class_after,
            title: e.recruited ? '峨嵋派某代传人' : before.recruitment.title, flags: { ...e.flags_after },
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

test('峨嵋28个NPC399条件798记录，历史10866条件完整不变', () => {
    assert.equal(cases.length, 399); assert.equal(cases.reduce((n,c) => n+c.samples, 0), 798);
    assert.equal(new Set(cases.map(c=>c.parameters.teacher.path)).size, 28);
    assert.equal(cases.filter(c=>c.parameters.variant==='baseline' && c.parameters.expected==='observed').length, 19);
    assert.equal(new Set(all.map(c=>c.id)).size, all.length);
    const prior=all.filter(c=>!['emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(prior.length,10866); assert.equal(prior.reduce((n,c)=>n+c.samples,0),47404);
    assert.equal(sha256(JSON.stringify(prior)), '52309d7d589c04567d45ce48c91ef00314e12900a851769564fd8b5389296371');
    for (const c of cases) validateTeachingObservation(fixture(c), c);
});

test('拒收和缺收徒回调不计成功，重复与取消不伪造师承', () => {
    for (const name of ['dao','feng','guoxiang','ji','daoming','wenfang','wenhui','wenqing','wenyin']) {
        assert.equal(get(name+'-baseline').parameters.expected,'refused');
        assert.deepEqual(validateTeachingObservation(fixture(get(name+'-cancel')),get(name+'-cancel')).map(s=>s.recruited),[false,false]);
    }
    const c=get('miejue-repeat'); assert.deepEqual(validateTeachingObservation(fixture(c),c).map(s=>s.recruited),[true,false]);
    assert.equal(get('zhou-existing-apprentice').parameters.teaching_expectations[0].pending_apprentice,false);
    for(const c of cases) assert.equal(c.parameters.actor.temp,undefined);
});

test('出家与俗家收徒身份按原代码区分，未门派贡献清零不是固定收费', () => {
    assert.equal(get('bei-lay-disciple').parameters.teaching_expectations[0].class_after,'fighter');
    assert.equal(get('zhou-lay-disciple').parameters.teaching_expectations[0].class_after,'');
    assert.equal(get('he-lay-disciple').parameters.expected,'refused');
    assert.equal(get('miejue-no-family').parameters.teaching_expectations[0].contribution_spent,100);
    assert.equal(get('miejue-baseline').parameters.teaching_expectations[0].contribution_spent,0);
    const c=get('bei-lay-disciple'),r=fixture(c);r[0].after.recruitment.class='bonze';
    assert.throws(()=>validateTeachingObservation(r,c));
});

test('正气、经验、基本内功与大乘门槛逐项采集，周芷若有效悟性44与45分开', () => {
    for(const name of ['fengling','miejue']) {
        assert.equal(get(name+'-exact-threshold').parameters.expected,'observed');
        for(const v of ['shen29999','exp-low','mahayana-low','force-skill-low'])
            assert.equal(get(name+'-'+v).parameters.expected,'refused');
    }
    assert.equal(get('zhou-int44').parameters.expected,'refused');
    assert.equal(get('zhou-int45').parameters.expected,'observed');
    assert.equal(get('he-exact-threshold').parameters.actor.skills.mahayana,50);
    assert.equal(get('bei-zero-shen').parameters.expected,'observed');
    assert.equal(get('he-zero-shen').parameters.expected,'refused');
});

test('法名、门派头衔、完整师承和资源都必须对应真实结果', () => {
    assert.equal(get('fengling-baseline').parameters.teaching_expectations[0].name_after,'灭试');
    assert.equal(get('miejue-baseline').parameters.teaching_expectations[0].name_after,'静试');
    for(const mutate of [r=>r[0].after.recruitment.name='测试', r=>r[0].after.recruitment.title='少林派传人',
        r=>r[0].after.jing--,r=>r[0].after.recruitment.family.generation++,
        r=>r[0].before.recruitment.pending_apprentice=r[0].teacher,
        r=>r[1].before.recruitment.name='中途改名']) {
        const c=get('miejue-repeat'),r=fixture(c);mutate(r);assert.throws(()=>validateTeachingObservation(r,c));
    }
});

test('源码和教师范围漂移必须重新核对，采集模块进入冻结清单', () => {
    const read=p=>readFileSync(root+'/'+p,'utf8');
    assert.throws(()=>emeiRecruitConditions(relations,p=>read(p)+(p==='feature/apprentice.c'?'\n//changed':'')),/源码变化/);
    assert.throws(()=>emeiRecruitConditions({...relations,objects:relations.objects.filter(t=>t.path!=='kungfu/class/emei/bei.c')},read));
    assert.ok(read('tools/tests/martial_data/execution.mjs').includes("'emei_recruit_cases'"));
});
