import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const all = teachingConditions(schoolRelations(inventory, catalog), catalog)
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile))
    .filter(c => !c.id.startsWith('teaching-chen-learn-')
    && !['mingjiao', 'duan', 'tianlongsi', 'xueshan', 'xuedao', 'xingxiu', 'xuanming', 'tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => c.parameters.teacher.path.includes('/honghua/'));
const get = id => cases.find(c => c.id === 'teaching-' + id).parameters;

test('红花目录七位教师十六项询问另增 124 条条件，不冒充全门派采集完成', () => {
    assert.equal(cases.length, 124);
    assert.equal(all.length - cases.length, 1262);
    assert.equal(teachingEntries(cases).length, 16);
    assert.equal(teachingEntries(all).length, 160);
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 7);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 40);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 84);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.status, 'configured_not_executed');
        assert.equal(c.samples, 2); assert.equal(c.method, 'teaching');
        assert.equal(p.action, `ask ${p.teacher.id} about ${p.topic}`);
        assert.ok(!Object.keys(p.actor.properties).some(k => /^can_(perform|learn|exert)\//.test(k)));
        assert.ok(!p.actor.equipment && !p.target.equipment);
        assert.deepEqual(p.actor.mappings, {});
        assert.equal(p.actor.properties['family/master_id'], undefined, '询问不能强加普通学习师承');
        assert.ok(p.qualification_sources.includes('cmds/std/ask.c'));
        for (const entry of teachingEntries([c])) {
            const source = inventory.files.find(f => f.path === entry.path);
            assert.equal(source.sha256, entry.sha256);
            assert.ok(source.functions.some(f => f.name === entry.function && f.line === entry.line));
        }
    }
});

test('十五项独立询问逐一绑定原函数、资格和原扣费，不套用施展或拜师条件', () => {
    const grants = cases.filter(c => c.id.endsWith('-grant'));
    assert.equal(grants.length, 15);
    for (const c of grants) {
        const p = c.parameters, source = inventory.files.find(f => f.path === p.teaching_entry.path);
        const fn = source.functions.find(f => f.name === p.teaching_entry.function).text;
        const [skill, level] = Object.entries(p.actor.skills)[0];
        assert.ok(source.functions.find(f => f.name === 'create').text
            .includes(`"${p.topic}": (: ${p.teaching_entry.function} :)`));
        for (const text of [`query_skill("${skill}", 1) < ${level}`,
            `query("gongxian") < ${p.actor.properties.gongxian}`,
            `query("shen") < ${p.actor.properties.shen}`,
            `add("gongxian", -${p.teaching_expectations[0].contribution_spent})`,
            `set("${p.monitored_grants[0]}", 1)`]) assert.ok(fn.includes(text), c.id + ': ' + text);
        assert.doesNotMatch(fn, /is_apprentice_of|permit_recruit|recognize_apprentice/);
        if (p.actor.skills.force) assert.ok(fn.includes(`query_skill("force") < ${p.actor.skills.force / 2}`));
        else assert.doesNotMatch(fn, /query_skill\("force"/);
        if (p.actor.properties.max_neili) assert.ok(fn.includes(`query("max_neili") < ${p.actor.properties.max_neili}`));
        else assert.doesNotMatch(fn, /query\("max_neili"/);
        const prefix = c.id.slice(0, -5);
        for (const [variant, change] of [
            ['skill-low', q => q.actor.skills[skill]--],
            ['contribution-low', q => q.actor.properties.gongxian--],
            ['shen-low', q => q.actor.properties.shen--],
            ['family-other', q => { q.actor.properties['family/family_name'] =
                p.teacher.id === 'lu feiqing' ? '华山派' : '武当派'; }],
        ]) {
            const expected = structuredClone(p), actual = structuredClone(cases.find(x => x.id === prefix + variant).parameters);
            change(expected);
            assert.equal(actual.teaching_expectations[0].value, 0);
            assert.equal(actual.teaching_expectations[0].contribution_spent, 0);
            assert.ok(actual.teaching_expectations[0].response_contains);
            delete actual.expected; delete expected.expected;
            delete actual.teaching_expectations; delete expected.teaching_expectations;
            assert.deepEqual(actual, expected);
        }
        const repeat = cases.find(x => x.id === prefix + 'repeat').parameters.teaching_expectations;
        assert.equal(repeat.length, 2); assert.equal(repeat[1].value, 1);
        assert.equal(repeat[1].contribution_spent, 0);
    }
});

test('陆菲青三项询问均接受红花和武当，拒绝第三门派；不套用普通学习的排除武当规则', () => {
    for (const suffix of ['xian', 'tao', 'xuan']) {
        assert.equal(get(`lufeiqing-${suffix}-grant`).actor.properties['family/family_name'], '红花会');
        const alternate = get(`lufeiqing-${suffix}-family-accepted-1`);
        assert.equal(alternate.actor.properties['family/family_name'], '武当派');
        assert.equal(alternate.expected, 'observed');
        assert.equal(get(`lufeiqing-${suffix}-family-other`).actor.properties['family/family_name'], '华山派');
        const source = inventory.files.find(f => f.path === 'kungfu/class/honghua/lu.c');
        const fn = source.functions.find(f => f.name === alternate.teaching_entry.function).text;
        assert.match(fn, /query\("family\/family_name"\) != "红花会"\s*&&\s*me->query\("family\/family_name"\) != "武当派"/);
    }
    assert.equal(get('lufeiqing-tao-grant').actor.skills.dodge, 360);
    assert.equal(get('lufeiqing-tao-dodge-low').actor.skills.dodge, 359);
});

test('陈家洛化蝶要求有效身法 32，轰天诀另查战神心经且没有有效内功门槛', () => {
    const hua = get('chenjialuo-hua-grant');
    assert.equal(hua.actor.properties.dex, 17); assert.equal(hua.actor.skills.dodge, 150);
    assert.equal(hua.actor.properties.dex + Math.trunc(hua.actor.skills.dodge / 10), 32);
    assert.equal(get('chenjialuo-hua-dex-low').actor.properties.dex, 16);
    const hong = get('chenjialuo-hong-grant');
    assert.equal(hong.actor.skills['zhanshen-xinjing'], 250);
    assert.equal(get('chenjialuo-hong-zhanshen-xinjing-low').actor.skills['zhanshen-xinjing'], 249);
    assert.equal(hong.actor.skills.force, 0);
    const source = inventory.files.find(f => f.path === 'kungfu/class/honghua/chen.c');
    assert.match(source.functions.find(f => f.name === 'ask_skill3').text, /query_dex\(\) < 32/);
    const fn = source.functions.find(f => f.name === 'ask_skill6').text;
    assert.ok(fn.includes('query_skill("zhanshen-xinjing", 1) < 250'));
    assert.equal(fn.split('improve_skill("baihua-cuoquan", 1500000)').length - 1, 3);
});

test('无尘先授追魂再授诛天，保留原等级增长、贡献及第二步拒绝', () => {
    const full = get('wuchen-zhu-complete'), repeat = get('wuchen-zhu-repeat');
    assert.deepEqual(full.teaching_expectations.map(e => e.contribution_spent), [300, 1200]);
    assert.deepEqual(full.teaching_expectations.map(e => e.skills_before['zhuihun-jian']), [159, 160]);
    assert.deepEqual(full.teaching_expectations.map(e => e.skills_after['zhuihun-jian']), [160, 161]);
    assert.deepEqual(repeat.teaching_expectations.map(e => e.contribution_spent), [300, 1200, 0]);
    assert.equal(repeat.teaching_expectations.at(-1).skills_before['zhuihun-jian'], 161);
    for (const variant of ['skill-low', 'force-low', 'contribution-low', 'shen-low', 'max-neili-low']) {
        const p = get('wuchen-zhu-' + variant);
        assert.equal(p.expected, 'observed', '前招已授不代表后招成功');
        assert.deepEqual(p.teaching_expectations.map(e => e.value), [1, 0]);
        assert.deepEqual(p.teaching_expectations.map(e => e.contribution_spent), [300, 0]);
    }
    assert.equal(get('wuchen-zhu-skill-low').teaching_expectations.at(-1).skills_before['zhuihun-jian'], 159);
    assert.equal(get('wuchen-zhu-contribution-low').actor.properties.gongxian, 1499);
    for (const variant of ['missing-zhui', 'family-other']) {
        const p = get('wuchen-zhu-' + variant);
        assert.equal(p.expected, 'refused'); assert.equal(p.teaching_expectations.length, 1);
    }
    const fn = inventory.files.find(f => f.path === 'kungfu/class/honghua/wuchen.c').functions
        .find(f => f.name === 'ask_skill3').text;
    for (const text of ['query("can_perform/zhuihun-jian/zhui")', 'query("gongxian") < 1200',
        'query("shen") < 80000', 'query("max_neili") < 1800', 'query_skill("force") < 200',
        'query_skill("zhuihun-jian", 1) < 160']) assert.ok(fn.includes(text));
});
