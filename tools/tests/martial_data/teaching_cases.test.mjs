import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, parseArgs } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog);
// Preserve the historical inquiry/exchange assertions; real learn commands
// have independent source and state tests in hong_learning.test.mjs.
const historicalTeaching = c => !['feng', 'quanzhen', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-acquisition-learning', 'gumu-item-acquisition', 'gumu-recruit'].includes(c.parameters.teaching_profile) && c.parameters.teaching_kind !== 'ordinary_learning'
    && !['honghua', 'mingjiao', 'duan', 'tianlongsi', 'xueshan', 'xuedao', 'xingxiu', 'xuanming', 'tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/'));
const cases = teachingConditions(relations, catalog).filter(historicalTeaching);
const isDamoSword = c => c.parameters.teacher.path.endsWith('/da-mo')
    && c.parameters.teaching_entry.function !== 'accept_ask';
const isRenPalmChain = c => c.id.startsWith('teaching-ren-zhen-');
const isKunlunChain = c => c.id.startsWith('teaching-hezudao-ni-');
const isQuanzhenChain = c => c.id.startsWith('teaching-wangchongyang-dang-');
const isBookTeaching = c => c.parameters.teaching_kind === 'book_teaching';
const isGaibangChain = c => c.id.startsWith('teaching-hongqigong-tian-');

test('教学入口复用隔离执行器，只接受已核对条件，不任意覆盖等级或样本数', () => {
    const options = parseArgs(['teaching', '--smoke', '--case', 'teaching-chi-tui-grant']);
    assert.equal(options.command, 'teaching');
    assert.equal(options.smoke, true);
    assert.equal(options.case, 'teaching-chi-tui-grant');
    for (const arg of ['--level', '--samples', '--bouts']) {
        assert.throws(() => parseArgs(['teaching', arg, '5']), /无效参数/);
    }
});

test('教学准备使用原 NPC/ask 入口与实际门槛，不将配置当成实测', () => {
    assert.equal(cases.length, 1236);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed');
        assert.equal(c.samples, 2);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'teaching');
        assert.equal(c.parameters.action, `ask ${c.parameters.teacher.id} about ${c.parameters.topic}`);
        if (c.parameters.teaching_kind !== 'learning_permission') {
            assert.equal(c.parameters.actor.properties.combat_exp, 10000000);
        }
        assert.deepEqual(c.parameters.actor.mappings,
            c.id.startsWith('teaching-banshuxian-wu-') ? { dodge: 'chuanyun-bu' } : {});
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => /^can_(perform|exert|learn)\//.test(k)));
        assert.ok(!Object.hasOwn(c, 'result'));
        assert.ok(c.parameters.qualification_sources.includes('cmds/std/ask.c'));
        assert.ok(c.parameters.qualification_sources.every(s => typeof s === 'string'));
        assert.deepEqual(c.parameters.qualification_sources,
            c.parameters.qualification_evidence.map(s => s.path));
        for (const id of Object.keys(c.parameters.actor.skills)) {
            assert.ok(catalog.skills.some(s => s.id === id));
        }
    }
    const lei = cases.find(c => c.id === 'teaching-chi-lei-grant');
    assert.equal(lei.parameters.actor.skills['tie-zhang'], 120);
    assert.equal(lei.parameters.actor.properties.shen, -950000);
    assert.equal(lei.parameters.actor.skills.force, 0);
    // This is intentionally below the perform gates: learning is not casting.
    assert.equal(lei.parameters.teaching_expectations[0].contribution_spent, 600);
});

test('错误领悟原样观察，重复教学不注入标记，贡献不足不期望扣费', () => {
    const bad = cases.find(c => c.id === 'teaching-chi-tui-grant');
    assert.equal(bad.parameters.known_issue, 'MA-003');
    assert.deepEqual(bad.parameters.teaching_expectations, [{
        grant: 'can_perform/tiexian-quan/jia', value: 1, contribution_spent: 100,
        absent_grants: ['can_perform/tiexian-quan/tui'],
    }]);
    const missing = cases.find(c => c.id === 'teaching-chi-ying-grant');
    assert.equal(missing.parameters.known_issue, 'MA-004');
    assert.equal(missing.parameters.teaching_expectations[0].grant, 'can_perform/tie-zhang/ying');
    for (const c of cases.filter(c => c.id.endsWith('-repeat') && !c.parameters.grant_completion_value
        && !isRenPalmChain(c) && !isKunlunChain(c) && !isQuanzhenChain(c) && !isBookTeaching(c) && !isGaibangChain(c))) {
        assert.equal(c.parameters.teaching_expectations.length, 2);
        assert.equal(c.parameters.teaching_expectations[1].contribution_spent, 0);
        assert.equal(c.parameters.teaching_expectations[1].value, 1);
    }
    for (const c of cases.filter(c => c.id.endsWith('-contribution-low'))) {
        const last = c.parameters.teaching_expectations.at(-1);
        assert.equal(last.contribution_spent, 0);
        assert.equal(last.value, 0);
        assert.ok(last.response_contains);
    }
});

test('逐项教学边界仅改一个资格，不把原始内功等级当有效等级或创造原文没有的门槛', () => {
    const grants = cases.filter(c => c.id.endsWith('-grant') && !isDamoSword(c)
        && c.parameters.teaching_kind !== 'learning_permission');
    for (const source of grants) {
        const prefix = source.id.slice(0, -'grant'.length), base = source.parameters;
        const skill = Object.keys(base.actor.skills).find(key => key !== 'force');
        for (const [variant, change] of [
            ['skill-low', p => { p.actor.skills[skill]--; }],
            [base.actor.properties.shen < 0 ? 'shen-high' : 'shen-low', p => {
                p.actor.properties.shen += base.actor.properties.shen < 0 ? 1 : -1;
            }],
            ['contribution-low', p => { p.actor.properties.gongxian--; }],
            ['family-other', p => { p.actor.properties['family/family_name'] =
                base.actor.properties['family/family_name'] === '武当派' ? '华山派' : '武当派'; }],
        ]) {
            if (variant.startsWith('shen-') && base.actor.properties.shen === 0) {
                assert.ok(!cases.some(c => c.id === prefix + variant), '无神值门槛不能制造拒绝');
                continue;
            }
            const target = cases.find(c => c.id === prefix + variant);
            assert.ok(target, '缺少边界：' + prefix + variant);
            const expected = structuredClone(base), actual = structuredClone(target.parameters);
            change(expected); delete expected.expected; delete actual.expected;
            delete expected.teaching_expectations; delete actual.teaching_expectations;
            assert.deepEqual(actual, expected, '边界混入了其他资格变化：' + target.id);
            assert.equal(target.parameters.teaching_expectations[0].value, 0);
            assert.equal(target.parameters.teaching_expectations[0].contribution_spent, 0);
            assert.ok(target.parameters.teaching_expectations[0].response_contains);
        }
        const force = cases.find(c => c.id === prefix + 'force-low');
        if (base.actor.skills.force === 0 || cases.some(c => c.id === prefix + 'basic-force-low')) {
            assert.equal(force, undefined, '没有内功门槛的授课不构造失败分支');
        } else {
            assert.ok(force);
            assert.equal(force.parameters.actor.skills.force, base.actor.skills.force - 1);
            assert.equal(Math.trunc(force.parameters.actor.skills.force / 2), base.actor.skills.force / 2 - 1);
        }
    }
    assert.equal(cases.reduce((sum, c) => sum + c.samples, 0), 2472, '这是计划数，不是实测数');
});

test('丐帮八名教师的二十一项独立询问逐条核对原函数和门槛，不套用拜师限制', () => {
    const group = cases.filter(c => c.parameters.teacher.path.includes('/gaibang/'));
    const grants = group.filter(c => c.id.endsWith('-grant'));
    assert.equal(group.length, 167);
    assert.equal(grants.length, 21);
    assert.equal(new Set(group.map(c => c.parameters.teacher.path)).size, 8);
    assert.equal(teachingEntries(group).length, 22);
    for (const c of grants) {
        const p = c.parameters, source = inventory.files.find(f => f.path === p.teaching_entry.path);
        const fn = source.functions.find(f => f.name === p.teaching_entry.function).text;
        const [skill, level] = Object.entries(p.actor.skills)[0];
        assert.ok(source.functions.find(f => f.name === 'create').text
            .includes(`"${p.topic}": (: ${p.teaching_entry.function} :)`));
        assert.ok(fn.includes(`query_skill("${skill}", 1) < ${level}`));
        assert.ok(fn.includes(`query("gongxian") < ${p.actor.properties.gongxian}`));
        assert.ok(fn.includes(`set("${p.teaching_expectations[0].grant}", 1)`));
        if (p.actor.properties.shen) assert.ok(fn.includes(`query("shen") < ${p.actor.properties.shen}`));
        if (c.id === 'teaching-hongqigong-hui-grant') {
            assert.equal(p.actor.skills.force, 260);
            assert.ok(fn.includes('query_skill("force", 1) < 260'));
            assert.ok(!cases.some(c => c.id === 'teaching-hongqigong-hui-force-low'));
            assert.equal(cases.find(c => c.id === 'teaching-hongqigong-hui-basic-force-low')
                .parameters.actor.skills.force, 259);
        } else if (p.actor.skills.force) {
            assert.ok(fn.includes(`query_skill("force") < ${p.actor.skills.force / 2}`));
        } else assert.ok(!fn.includes('query_skill("force")'), '没有内功门槛不自行增加');
        assert.equal(p.actor.properties['family/beggarlvl'], 0);
    }
    // The older 1,069 conditions retain their original identities and scope.
    assert.equal(cases.length - group.length, 1069);
});

test('阿大传授是两位师父或七袋资格三选一，并非必须同时满足', () => {
    for (const suffix of ['ao', 'fen', 'guan']) {
        const get = v => cases.find(c => c.id === `teaching-ada-${suffix}-${v}`).parameters;
        assert.equal(get('grant').actor.properties['family/master_id'], 'hong qigong');
        assert.equal(get('master-ma').actor.properties['family/master_id'], 'ma dayuan');
        assert.equal(get('rank-exact').actor.properties['family/master_id'], 'other teacher');
        assert.equal(get('rank-exact').actor.properties['family/beggarlvl'], 7);
        for (const variant of ['grant', 'master-ma', 'rank-exact']) assert.equal(get(variant).expected, 'observed');
        for (const variant of ['rank-low', 'master-other']) {
            assert.equal(get(variant).expected, 'refused');
            assert.equal(get(variant).teaching_expectations[0].contribution_spent, 0);
        }
        const fn = inventory.files.find(f => f.path === 'kungfu/class/gaibang/ada.c').functions
            .find(f => f.name === get('grant').teaching_entry.function).text;
        for (const text of ['"ma dayuan"', '"hong qigong"', 'query("family/beggarlvl") < 7']) assert.ok(fn.includes(text));
    }
});

test('天下无狗用四次真实前置询问衔接，计入技能奖励、袋数、贡献及重复请求', () => {
    const get = v => cases.find(c => c.id === `teaching-hongqigong-tian-${v}`).parameters;
    const full = get('complete');
    assert.deepEqual(full.teaching_expectations.map(s => s.contribution_spent), [300, 600, 1500, 1800, 2000]);
    assert.deepEqual(full.teaching_expectations.map(s => s.skills_before['dagou-bang']), [216, 217, 218, 219, 220]);
    assert.deepEqual(full.teaching_expectations.map(s => s.skills_after['dagou-bang']), [217, 218, 219, 220, 223]);
    assert.equal(full.actor.properties.gongxian, 6200);
    assert.equal(full.actor.properties['family/beggarlvl'], 9);
    assert.equal(get('repeat').teaching_expectations.at(-1).contribution_spent, 0);
    assert.equal(get('repeat').teaching_expectations.at(-1).skills_after['dagou-bang'], 223);
    for (const missing of ['all', 'chan', 'chuo', 'feng', 'ban']) {
        const p = get('missing-' + missing);
        assert.equal(p.teaching_expectations.at(-1).value, 0);
        assert.match(p.teaching_expectations.at(-1).response_contains, /四个棒诀/);
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_perform/')));
    }
    assert.equal(get('rank-low').actor.properties['family/beggarlvl'], 8);
    assert.equal(get('skill-low').teaching_expectations.at(-1).skills_before['dagou-bang'], 219);
    assert.deepEqual(get('shen-low').teaching_expectations.map(s => s.value), [1, 1, 1, 0, 0]);
    const fn = inventory.files.find(f => f.path === 'kungfu/class/gaibang/hong.c').functions
        .find(f => f.name === 'ask_skill7').text;
    for (const text of ['query("family/beggarlvl") < 9', 'query_skill("force") < 300',
        'query_skill("dagou-bang", 1) < 220', 'query("gongxian") < 2000']) assert.ok(fn.includes(text));
    for (const key of full.monitored_grants) assert.ok(fn.includes(`"${key}"`));
});

test('桃花岛十四项普通询问按原门槛采集，不给四招九阴绝技预写秘籍许可', () => {
    const group = cases.filter(c => c.parameters.teacher.path.includes('/taohua/') && !isBookTeaching(c));
    assert.equal(group.length, 95);
    assert.equal(teachingEntries(group).length, 14);
    assert.equal(new Set(group.map(c => c.parameters.teacher.path)).size, 4);
    assert.equal(cases.filter(c => !isBookTeaching(c) && !c.parameters.teacher.path.includes('/gaibang/')).length - group.length,
        929, '已执行的旧条件范围保留');
    for (const c of group.filter(c => c.id.endsWith('-grant'))) {
        const p = c.parameters, source = inventory.files.find(f => f.path === p.teaching_entry.path);
        const fn = source.functions.find(f => f.name === p.teaching_entry.function).text;
        const [skill, level] = Object.entries(p.actor.skills)[0];
        assert.ok(source.functions.find(f => f.name === 'create').text
            .includes(`"${p.topic}": (: ${p.teaching_entry.function} :)`));
        for (const text of [`query_skill("${skill}", 1) < ${level}`,
            `query("gongxian") < ${p.actor.properties.gongxian}`,
            `add("gongxian", -${p.teaching_expectations[0].contribution_spent})`,
            `set("${p.monitored_grants[0]}", 1)`]) assert.ok(fn.includes(text), c.id + ': ' + text);
        assert.equal(p.actor.properties.shen, 0);
        assert.doesNotMatch(fn, /query\("shen"|is_apprentice_of|permit_recruit|recognize_apprentice/);
        assert.ok(p.qualification_sources.includes('kungfu/class/taohua/taohua.h'));
        if (p.actor.skills.force) assert.ok(fn.includes(`query_skill("force") < ${p.actor.skills.force / 2}`));
        else assert.doesNotMatch(fn, /query_skill\("force"/);
        for (const [dependency, required] of Object.entries(p.actor.skills).slice(2)) {
            assert.ok(fn.includes(`query_skill("${dependency}", 1) < ${required}`));
            const low = group.find(x => x.id === c.id.replace(/grant$/, dependency + '-low'));
            assert.equal(low.parameters.actor.skills[dependency], required - 1);
        }
        if (p.actor.properties.max_neili) {
            assert.ok(fn.includes(`query("max_neili") < ${p.actor.properties.max_neili}`));
        } else assert.doesNotMatch(fn, /query\("max_neili"/);
        assert.ok(!p.actor.equipment, '授课叙述里的兵器不能被补成玩家的入场条件');
        assert.ok(!p.monitored_grants.some(g => g.includes('jiuyin-shengong')));
    }
    const huang = inventory.files.find(f => f.path === 'kungfu/class/taohua/huang.c');
    assert.ok(huang.functions.find(f => f.name === 'ask_skill7').text.includes('me->start_busy(15)'));
    const repeat = group.find(c => c.id === 'teaching-huangyaoshi-ding-repeat');
    assert.equal(repeat.parameters.teaching_expectations.length, 2,
        '重复询问保留前问造成的忙状态，不重置角色');
    assert.ok(group.every(c => c.status === 'configured_not_executed'));
});

test('全真十位教师十八项询问独立取证，贡献门槛和扣费不强行相等', () => {
    const group = cases.filter(c => c.parameters.teacher.path.includes('/quanzhen/'));
    const direct = group.filter(c => !isQuanzhenChain(c));
    assert.equal(group.length, 128);
    assert.equal(direct.length, 121);
    assert.equal(teachingEntries(group).length, 18);
    assert.equal(new Set(group.map(c => c.parameters.teacher.path)).size, 10);
    assert.equal(cases.filter(c => !/\/(taohua|gaibang)\//.test(c.parameters.teacher.path)).length - group.length,
        801, '前五组教学条件不变');
    for (const c of direct.filter(c => c.id.endsWith('-grant'))) {
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
        assert.ok(p.qualification_sources.includes('kungfu/class/quanzhen/quanzhen.h'));
        for (const field of ['class', 'gender', 'family/master_id']) {
            assert.ok(!Object.hasOwn(p.actor.properties, field));
        }
        assert.doesNotMatch(fn, /is_apprentice_of|permit_recruit|recognize_apprentice/);
        if (p.actor.skills.force) {
            assert.ok(fn.includes(`query_skill("force") < ${p.actor.skills.force / 2}`));
        } else assert.doesNotMatch(fn, /query_skill\("force"/);
        if (p.actor.properties.max_neili) {
            assert.ok(fn.includes(`query("max_neili") < ${p.actor.properties.max_neili}`));
        } else assert.doesNotMatch(fn, /query\("max_neili"/);
    }
    const yin = direct.find(c => c.id === 'teaching-yinzhiping-lian-grant').parameters;
    assert.equal(yin.actor.properties.gongxian, 1000);
    assert.equal(yin.teaching_expectations[0].contribution_spent, 800);
    assert.equal(yin.known_issue, null, '较高资格门槛和较低费用不单凭差值认定 BUG');
    const hua = direct.find(c => c.id === 'teaching-wangchongyang-hua-grant').parameters;
    assert.equal(hua.actor.skills['xiantian-gong'], 100);
    assert.equal(direct.find(c => c.id === 'teaching-wangchongyang-hua-xiantian-gong-low')
        .parameters.actor.skills['xiantian-gong'], 99);
    assert.ok(!group.some(c => c.parameters.teaching_kind === 'learning_permission'),
        '周伯通实际切磋后的互搏许可未包含在询问采集中');
});

test('神威浩荡连续取得前置招式，三次奖励与二次扣费原样保留', () => {
    const group = cases.filter(isQuanzhenChain);
    assert.equal(group.length, 7);
    const full = group.find(c => c.id.endsWith('-complete')).parameters;
    assert.equal(full.actor.skills['xiantian-gong'], 240);
    assert.equal(full.actor.properties.gongxian, 4500);
    assert.deepEqual(full.teaching_expectations.map(s => s.skills_after['xiantian-gong']), [243, 246]);
    assert.deepEqual(full.teaching_expectations.map(s => s.contribution_spent), [2000, 2500]);
    assert.deepEqual(full.teaching_expectations.map(s => s.teaching_entry.function), ['ask_skill4', 'ask_skill5']);
    assert.deepEqual(full.monitored_grants, ['can_perform/xiantian-gong/fen', 'can_perform/xiantian-gong/dang']);
    const again = group.find(c => c.id.endsWith('-repeat')).parameters;
    assert.equal(again.teaching_expectations.length, 3);
    assert.equal(again.teaching_expectations.at(-1).skills_before['xiantian-gong'], 246);
    assert.equal(again.teaching_expectations.at(-1).skills_after['xiantian-gong'], 246);
    assert.equal(again.teaching_expectations.at(-1).contribution_spent, 0);
    for (const suffix of ['contribution-low', 'shen-low', 'max-neili-low']) {
        const p = group.find(c => c.id.endsWith('-' + suffix)).parameters;
        assert.deepEqual(p.teaching_expectations.map(s => s.value), [1, 0]);
        assert.equal(p.expected, 'observed', '前招有进展但后招未学会，原样记录部分进展');
        assert.equal(p.teaching_expectations.at(-1).skills_after['xiantian-gong'], 243);
    }
    const missing = group.find(c => c.id.endsWith('-missing-fen')).parameters;
    assert.equal(missing.teaching_expectations.length, 1);
    assert.equal(missing.teaching_entry.function, 'ask_skill5');
    assert.equal(missing.expected, 'refused');
    const source = inventory.files.find(f => f.path === 'kungfu/class/quanzhen/wang.c');
    const fn = source.functions.find(f => f.name === 'ask_skill5').text;
    for (const text of ['query("can_perform/xiantian-gong/fen")', 'query("gongxian") < 2500',
        'query("shen") < 150000', 'query_skill("xiantian-gong", 1) < 240',
        'query("max_neili") < 5000']) assert.ok(fn.includes(text));
    assert.equal(fn.split('improve_skill("xiantian-gong", 1500000)').length - 1, 3);
});

test('峨嵋九招与古墓八招保留各自教学门槛，不混入拜师性别和装备要求', () => {
    const emei = cases.filter(c => c.id.startsWith('teaching-miejue-'));
    const gumu = cases.filter(c => c.id.startsWith('teaching-li-'));
    assert.equal(emei.length, 66);
    assert.equal(gumu.length, 54);
    assert.equal(cases.filter(c => !/\/(kunlun|wudu|quanzhen|taohua|gaibang)\//.test(c.parameters.teacher.path)).length
        - emei.length - gumu.length, 554, '旧批范围保留');
    for (const c of [...emei, ...gumu]) {
        const p = c.parameters;
        assert.ok(!Object.hasOwn(p.actor.properties, 'gender'));
        assert.ok(!Object.hasOwn(p.actor.properties, 'class'));
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.ok(!p.actor.equipment);
    }
    const source = inventory.files.find(f => f.path === 'kungfu/class/emei/miejue.c');
    for (const c of emei.filter(c => c.id.endsWith('-grant'))) {
        const p = c.parameters, fn = source.functions.find(f => f.name === p.teaching_entry.function).text;
        const [skill, level] = Object.entries(p.actor.skills)[0];
        assert.ok(fn.includes(`query_skill("${skill}", 1) < ${level}`));
        assert.ok(fn.includes(`query_skill("force") < ${p.actor.skills.force / 2}`));
        assert.ok(fn.includes(`query("gongxian") < ${p.actor.properties.gongxian}`));
        assert.ok(fn.includes(`add("gongxian", -${p.actor.properties.gongxian})`));
        assert.ok(fn.includes(`query("shen") < ${p.actor.properties.shen}`));
        assert.ok(source.functions.find(f => f.name === 'create').text
            .includes(`"${p.topic}": (: ${p.teaching_entry.function} :)`));
        if (p.actor.properties.max_neili) assert.ok(fn.includes(`query("max_neili") < ${p.actor.properties.max_neili}`));
    }
    for (const [id, level] of [['huan', 140], ['zhi', 100]]) {
        const p = gumu.find(c => c.id === `teaching-li-${id}-grant`).parameters;
        assert.equal(p.actor.skills.dodge, level * 2);
        assert.equal(p.actor.skills.force, 0);
        assert.equal(gumu.find(c => c.id === `teaching-li-${id}-dodge-low`).parameters.actor.skills.dodge, level * 2 - 1);
        assert.ok(!gumu.some(c => c.id === `teaching-li-${id}-force-low`));
        assert.equal(p.teaching_entry.function, 'accept_ask');
    }
    const li = relations.objects.find(o => o.path === 'kungfu/class/gumu/li.c');
    assert.equal(gumu.filter(c => c.id.endsWith('-grant')).length, 8);
    assert.equal(li.grants.filter(g => g.fields).length, 8);
});

test('五毒八项绝招沿用原询问，领悟键不强制等于施展文件名', () => {
    const selected = cases.filter(c => c.parameters.teacher.path.includes('/wudu/')
        && c.parameters.teaching_kind !== 'learning_permission');
    assert.equal(selected.length, 50);
    assert.equal(teachingEntries(selected).length, 8);
    const grants = selected.filter(c => c.id.endsWith('-grant'));
    assert.equal(grants.length, 8);
    for (const c of grants) {
        const p = c.parameters, [skill, level] = Object.entries(p.actor.skills)[0];
        const source = inventory.files.find(f => f.path === p.teaching_entry.path);
        const fn = source.functions.find(f => f.name === p.teaching_entry.function).text;
        assert.ok(fn.includes(`query_skill("${skill}", 1) < ${level}`));
        assert.ok(fn.includes(`query("gongxian") < ${p.actor.properties.gongxian}`));
        assert.ok(fn.includes(`add("gongxian", -${p.actor.properties.gongxian})`));
        assert.ok(fn.includes(`query("shen") > ${p.actor.properties.shen}`));
        assert.ok(fn.includes(`set("${p.monitored_grants[0]}", 1)`));
        assert.ok(source.functions.find(f => f.name === 'create').text
            .includes(`"${p.topic}": (: ${p.teaching_entry.function} :)`));
        assert.ok(p.qualification_sources.includes('kungfu/class/wudu/wudu.h'));
        assert.equal(p.actor.properties['family/family_name'], '五毒教');
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.ok(!p.actor.equipment);
        const force = p.actor.skills.force;
        if (force) assert.ok(fn.includes(`query_skill("force") < ${force / 2}`));
        else assert.ok(!fn.includes('query_skill("force")'));
        const skillLow = selected.find(s => s.id === c.id.replace(/grant$/, 'skill-low'));
        assert.equal(skillLow.parameters.actor.skills[skill], level - 1);
    }
    assert.equal(grants.filter(c => c.parameters.actor.skills.force === 0).length, 6);
    assert.deepEqual(grants.filter(c => c.parameters.actor.skills.force > 0)
        .map(c => c.parameters.actor.skills.force), [300, 300]);
    assert.ok(grants.some(c => c.parameters.monitored_grants[0] === 'can_perform/ruanhong-zhusuo/panying'));
    assert.ok(grants.some(c => c.parameters.monitored_grants[0] === 'can_perform/ruanhong-zhusuo/suolong'));
    assert.ok(grants.some(c => c.parameters.monitored_grants[0] === 'can_perform/xiewei-bian/tengshe'));
    assert.ok(!selected.some(c => c.parameters.topic === '千蛛万毒手'), '学习许可与绝招领悟分开采集');
});

test('千蛛询问只授予许可，验证真实经验阅历边界及外派不被注释条件拒绝', () => {
    const selected = cases.filter(c => c.parameters.teaching_kind === 'learning_permission');
    assert.equal(selected.length, 6);
    assert.equal(teachingEntries(selected).length, 1);
    const get = variant => selected.find(c => c.id === `teaching-hetieshou-permission-${variant}`).parameters;
    const base = get('grant');
    assert.equal(base.teaching_entry.function, 'ask_skill6');
    assert.equal(base.actor.properties.combat_exp, 1000000);
    assert.equal(base.actor.properties.score, 100000);
    assert.equal(base.actor.properties.shen, -200000);
    assert.equal(base.actor.properties.gongxian, 0);
    assert.deepEqual(base.unchanged_properties, ['combat_exp', 'score']);
    assert.equal(get('experience-low').actor.properties.combat_exp, 999999);
    assert.equal(get('score-low').actor.properties.score, 99999);
    assert.equal(get('shen-high').actor.properties.shen, -199999);
    for (const variant of ['experience-low', 'score-low', 'shen-high']) assert.equal(get(variant).expected, 'refused');
    assert.equal(get('family-other').actor.properties['family/family_name'], '武当派');
    assert.equal(get('family-other').expected, 'observed');
    assert.equal(get('repeat').teaching_expectations[1].may_improve_skills, false);
    for (const c of selected) for (const step of c.parameters.teaching_expectations) {
        assert.equal(step.contribution_spent, 0);
        assert.deepEqual(step.absent_skills, ['qianzhu-wandushou']);
    }
    const previous = structuredClone(relations);
    for (const teacher of previous.objects)
        if (!teacher.path.startsWith('kungfu/class/gumu/')) delete teacher.learning_permissions;
    assert.deepEqual(teachingConditions(previous, catalog).filter(historicalTeaching),
        cases.filter(c => !selected.includes(c) && !isBookTeaching(c)),
        '旧关系清单仍只生成原有条件，不能回写历史覆盖');
    const missing = structuredClone(relations);
    missing.objects.find(o => o.path.endsWith('/hetieshou.c')).learning_permissions = [];
    assert.throws(() => teachingConditions(missing, catalog), /许可来源改变/);
});

test('九阴四项传授经原交书取得许可，分别保留原始武学与内力上限门槛', () => {
    const selected = cases.filter(isBookTeaching);
    assert.equal(selected.length, 45);
    assert.equal(teachingEntries(selected).length, 6, '四个询问入口与两个交书入口');
    for (const [id, basic, level, basicLevel, force, maxNeili] of [
        ['zhi', 'finger', 250, 200, 240, 5000], ['shou', 'hand', 260, 200, 240, 5000],
        ['zhang', 'strike', 260, 220, 240, 5000], ['zhua', 'claw', 240, 240, 260, 5500],
    ]) {
        const get = variant => selected.find(c => c.id === `teaching-jiuyin-${id}-${variant}`).parameters;
        const full = get('complete'), upper = id !== 'zhua';
        assert.deepEqual(full.actor.skills, { 'jiuyin-shengong': level, [basic]: basicLevel,
            force, 'martial-cognize': 240 });
        assert.equal(full.actor.properties.max_neili, maxNeili);
        assert.equal(full.actor.properties.gongxian, 0);
        assert.equal(full.actor.properties.shen, 0);
        assert.ok(!Object.keys(full.actor.properties).some(key => key.startsWith('can_')));
        const [give, ask] = full.teaching_expectations;
        assert.equal(give.offer.path, '/clone/lonely/book/zhenjing' + (upper ? 1 : 2));
        assert.equal(give.teaching_entry.function, 'accept_object');
        assert.equal(give.grant, `can_learn/jiuyin-shengong/${id}`);
        assert.equal(ask.grant, `can_perform/jiuyin-shengong/${id}`);
        assert.equal(Object.keys(give.grants_after).length, upper ? 3 : 1);
        assert.equal(give.offer.consumed, true);
        assert.equal(give.may_improve_skills, false);
        assert.ok(full.qualification_sources.includes('cmds/std/give.c'));
        assert.ok(full.qualification_sources.includes(give.offer.path.slice(1) + '.c'));
        for (const [variant, field] of [['skill-low', 'jiuyin-shengong'], ['basic-low', basic],
            ['force-low', 'force'], ['cognize-low', 'martial-cognize']]) {
            const low = get(variant);
            assert.equal(low.actor.skills[field], full.actor.skills[field] - 1);
            assert.deepEqual(low.teaching_expectations.map(s => s.value), [1, 0]);
            assert.equal(low.expected, 'observed', '交书进展不等于后续授课成功');
        }
        assert.equal(get('max-neili-low').actor.properties.max_neili, maxNeili - 1);
        assert.equal(get('max-neili-low').actor.properties.neili, maxNeili);
        assert.equal(get('missing-book').teaching_expectations.length, 1);
        assert.equal(get('missing-book').expected, 'refused');
        assert.equal(get('wrong-book').expected, 'refused');
        assert.equal(get('wrong-book').teaching_expectations[0].offer.consumed, false);
        assert.notEqual(get('wrong-book').teaching_expectations[0].offer.path, give.offer.path);
        assert.equal(get('family-other').actor.properties['family/family_name'], '武当派');
        assert.equal(get('family-other').expected, 'observed');
        assert.deepEqual(get('repeat-book').teaching_expectations.map(s => Boolean(s.offer)), [true, true, false]);
        assert.equal(get('repeat').teaching_expectations.at(-1).response_contains, '你不是已经会了吗');
    }
    const chain = selected.find(c => c.id === 'teaching-jiuyin-upper-all').parameters;
    assert.equal(chain.teaching_expectations.filter(s => s.offer).length, 1);
    assert.deepEqual(chain.teaching_expectations.slice(1).map(s => s.grant),
        ['zhi', 'shou', 'zhang'].map(id => `can_perform/jiuyin-shengong/${id}`));
    const missing = structuredClone(relations);
    delete missing.objects.find(o => o.path.endsWith('/taohua/mei.c')).learning_permissions;
    assert.throws(() => teachingConditions(missing, catalog), /交书许可来源不完整/);
});

test('昆仑十项独立教学逐一对应原询问，不添加神值或拜师门槛', () => {
    const selected = cases.filter(c => c.parameters.teacher.path.includes('/kunlun/'));
    assert.equal(selected.length, 71);
    const grants = selected.filter(c => c.id.endsWith('-grant'));
    assert.equal(grants.length, 10);
    assert.ok(!selected.some(c => /-shen-(low|high)$/.test(c.id)));
    for (const c of grants) {
        const p = c.parameters, source = inventory.files.find(f => '/' + f.path.slice(0, -2) === p.teacher.path);
        const fn = source.functions.find(f => f.name === p.teaching_entry.function).text;
        const [skill, level] = Object.entries(p.actor.skills)[0];
        assert.ok(fn.includes(`query_skill("${skill}", 1) < ${level}`));
        assert.ok(fn.includes(`query("gongxian") < ${p.actor.properties.gongxian}`));
        assert.ok(fn.includes(`add("gongxian", -${p.actor.properties.gongxian})`));
        assert.ok(!fn.includes('query("shen")'));
        assert.ok(source.functions.find(f => f.name === 'create').text
            .includes(`"${p.topic}": (: ${p.teaching_entry.function} :)`));
        if (p.actor.skills.force) assert.ok(fn.includes(`query_skill("force") < ${p.actor.skills.force / 2}`));
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.ok(!Object.hasOwn(p.actor.properties, 'gender'));
        assert.ok(p.qualification_sources.includes('kungfu/class/kunlun/kunlun.h'));
    }
    const byId = id => selected.find(c => c.id === 'teaching-' + id).parameters;
    const music = byId('hetaichong-fanyin-grant');
    assert.equal(music.actor.skills['tanqin-jifa'], 120);
    assert.equal(byId('hetaichong-fanyin-tanqin-jifa-low').actor.skills['tanqin-jifa'], 119);
    const wu = byId('banshuxian-wu-grant');
    assert.deepEqual(wu.actor.mappings, { dodge: 'chuanyun-bu' });
    assert.equal(wu.actor.skills.dodge, 220);
    assert.equal(wu.actor.skills['chuanyun-bu'], 110);
    assert.equal(wu.actor.properties.dex, 23);
    const dodgeLow = byId('banshuxian-wu-dodge-low'), dexLow = byId('banshuxian-wu-dex-low');
    assert.equal(dodgeLow.actor.skills.dodge, 219);
    assert.equal(dodgeLow.teaching_expectations[0].response_contains, '轻功火候不足');
    assert.equal(dexLow.actor.properties.dex, 22);
    assert.equal(dexLow.actor.skills.dodge, 220);
    assert.equal(dexLow.teaching_expectations[0].response_contains, '身法实在太差');
    assert.equal(byId('hetaichong-shi-grant').actor.skills.force, 0);
});

test('逆转乾坤真实先学乾坤劲，资格边界按奖励后的等级和贡献核验', () => {
    const group = cases.filter(isKunlunChain), byId = id => group.find(c => c.id.endsWith('-' + id)).parameters;
    assert.equal(group.length, 8);
    const full = byId('complete'), repeated = byId('repeat');
    assert.equal(full.actor.properties.gongxian, 2100);
    assert.deepEqual(full.teaching_expectations.map(s => s.contribution_spent), [300, 1800]);
    assert.deepEqual(repeated.teaching_expectations.map(s => s.contribution_spent), [300, 1800, 0]);
    assert.deepEqual(full.teaching_expectations.map(s => s.skills_before['qiankun-jian']), [180, 181]);
    assert.deepEqual(full.teaching_expectations.map(s => s.skills_after['qiankun-jian']), [181, 182]);
    assert.deepEqual(byId('skill-exact').teaching_expectations.map(s => s.skills_before['qiankun-jian']), [179, 180]);
    const low = byId('skill-low');
    assert.equal(low.actor.skills['qiankun-jian'], 178);
    assert.deepEqual(low.teaching_expectations.map(s => s.skills_after['qiankun-jian']), [179, 179]);
    assert.equal(low.expected, 'observed', '前招有进展不等于末招完成');
    assert.equal(low.teaching_expectations.at(-1).value, 0);
    assert.equal(byId('contribution-low').actor.properties.gongxian, 2099);
    assert.deepEqual(byId('contribution-low').teaching_expectations.map(s => s.contribution_spent), [300, 0]);
    assert.equal(byId('force-low').actor.skills.force, 599);
    const missing = byId('missing-qian');
    assert.equal(missing.expected, 'refused');
    assert.equal(missing.teaching_expectations.length, 1);
    assert.equal(missing.teaching_expectations[0].response_contains, '必须先通晓');
    assert.equal(missing.teaching_entry.function, 'ask_skill3');
    for (const c of group) for (const s of c.parameters.teaching_expectations) {
        const source = inventory.files.find(f => f.path === s.teaching_entry.path);
        const fn = source.functions.find(f => f.name === s.teaching_entry.function);
        assert.equal(fn.line, s.teaching_entry.line);
        assert.ok(fn.text.includes(`set("${s.grant}", 1)`));
    }
});

test('胡家十二项询问保留原始内功、基本轻功与有效身法的不同门槛', () => {
    const selected = cases.filter(c => c.parameters.teacher.path.startsWith('/kungfu/class/hu/'));
    assert.equal(selected.length, 87);
    const original = inventory.files.find(f => f.path === 'kungfu/class/hu/hufei.c');
    for (const [id, number, skill, level, force, contribution, shen] of [
        ['juan', 1, 'hua-quan', 120, 180, 350, 5000],
        ['kuai', 2, 'hujia-quan', 80, 100, 100, 2000],
        ['tan', 3, 'liuhe-zhang', 60, 100, 50, 1500],
        ['jian', 4, 'chuncan-zhang', 80, 120, 400, 5000],
        ['fei', 5, 'sixiang-bufa', 150, 0, 1000, 12000],
        ['shan', 6, 'mantian-xing', 100, 100, 200, 3000],
        ['xiong', 7, 'chuangwang-dao', 40, 60, 50, 500],
        ['dao-shan', 8, 'liuhe-dao', 80, 100, 200, 3500],
        ['xian', 9, 'hujia-daofa', 120, 160, 900, 15000],
        ['zhui', 10, 'hujia-daofa', 140, 200, 1300, 22000],
        ['cang', 11, 'hujia-daofa', 180, 250, 2200, 30000],
    ]) {
        const group = selected.filter(c => c.id.startsWith(`teaching-hufei-${id}-`));
        assert.equal(group.length, id === 'fei' ? 10 : 7);
        const p = group.find(c => c.id.endsWith('-grant')).parameters;
        const fn = original.functions.find(f => f.name === `ask_skill${number}`).text;
        assert.equal(p.teaching_entry.function, `ask_skill${number}`);
        assert.equal(p.actor.skills[skill], level);
        assert.equal(p.actor.skills.force, id === 'fei' ? 150 : force * 2);
        assert.equal(p.actor.properties.gongxian, contribution);
        assert.equal(p.actor.properties.shen, shen);
        assert.ok(fn.includes(`me->query_skill("${skill}", 1) < ${level}`));
        assert.ok(fn.includes(`me->query("gongxian") < ${contribution}`));
        assert.ok(fn.includes(`me->add("gongxian", -${contribution})`));
        assert.ok(fn.includes(`me->query("shen") < ${shen}`));
        if (force) assert.ok(fn.includes(`me->query_skill("force") < ${force}`));
        assert.ok(!Object.hasOwn(p.actor.properties, 'born_family'));
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.ok(!p.actor.equipment);
        assert.ok(p.qualification_sources.includes('kungfu/class/hu/hu.h'));
    }
    const byId = id => selected.find(c => c.id === `teaching-hufei-fei-${id}`).parameters;
    const base = byId('grant');
    assert.equal(base.actor.skills.dodge, 150);
    assert.equal(base.actor.properties.dex, 18);
    assert.equal(base.actor.properties.dex + Math.trunc(base.actor.skills.dodge / 10), 33);
    assert.equal(base.actor.properties.max_neili, 1000);
    const flight = original.functions.find(f => f.name === 'ask_skill5').text;
    for (const text of ['query_skill("force", 1) < 150', 'query_skill("dodge", 1) < 150',
        'query_dex() < 33', 'query("max_neili") < 1000']) assert.ok(flight.includes(text));
    for (const [variant, field, value, message] of [
        ['basic-force-low', 'force', 149, '内功火候不足'],
        ['basic-dodge-low', 'dodge', 149, '基本轻功有待提高'],
    ]) {
        const p = byId(variant), expected = structuredClone(base.actor);
        expected.skills[field] = value;
        assert.deepEqual(p.actor, expected);
        assert.equal(p.teaching_expectations[0].response_contains, message);
    }
    assert.equal(byId('dex-low').actor.properties.dex, 17);
    assert.equal(byId('dex-low').actor.skills.dodge, 150);
    assert.equal(byId('max-neili-low').actor.properties.max_neili, 999);
    assert.equal(byId('max-neili-low').actor.properties.neili, 1000);
    assert.ok(base.qualification_sources.includes('feature/attribute.c'));
    const heng = selected.find(c => c.id === 'teaching-huyizhi-heng-grant').parameters;
    assert.equal(heng.teaching_entry.function, 'accept_ask');
    assert.equal(heng.actor.skills['baisheng-daofa'], 150);
    assert.equal(heng.actor.skills.force, 400);
    assert.equal(heng.actor.properties.shen, 8000);
    assert.equal(heng.teaching_expectations[0].contribution_spent, 600);
});

test('日月五位教师的六项原询问保留实际门槛，不混入拜师、普通学习或借兵器条件', () => {
    for (const [id, file, npc, skill, level, force, contribution, shen, grant, cost = contribution, func = 'ask_skill1'] of [
        ['fan-kai', 'fan', 'fan song', 'pangu-qishi', 180, 300, 1200, -120000, 'kai'],
        ['feng-qian', 'feng', 'zhang chengfeng', 'jinyuan-gun', 120, 180, 800, -100000, 'qian'],
        ['jia-jing', 'jia', 'jia bu', 'canghong-bifa', 100, 150, 400, -30000, 'jing'],
        ['qin-kou', 'qin', 'qin weibang', 'danding-dao', 80, 100, 80, -8000, 'kou', 100],
        ['xiang-chan', 'xiang', 'xiang wentian', 'panlong-suo', 120, 180, 500, -120000, 'chan'],
        ['xiang-sha', 'xiang', 'xiang wentian', 'panlong-suo', 180, 220, 1500, -160000, 'sha', 1500, 'ask_skill2'],
    ]) {
        const group = cases.filter(c => c.id.startsWith(`teaching-${id}-`));
        assert.equal(group.length, id === 'qin-kou' ? 9 : 7);
        const p = group.find(c => c.id.endsWith('-grant')).parameters;
        const source = inventory.files.find(f => f.path === `kungfu/class/riyue/${file}.c`);
        const fn = source.functions.find(f => f.name === func).text;
        const create = source.functions.find(f => f.name === 'create').text;
        assert.equal(p.teacher.id, npc);
        assert.equal(p.teaching_entry.function, func);
        assert.equal(p.teaching_entry.sha256, source.sha256);
        assert.ok(create.includes(`"${p.topic}": (: ${func} :)`));
        assert.equal(p.actor.skills[skill], level);
        assert.equal(p.actor.skills.force, force * 2);
        assert.equal(p.actor.properties.gongxian, contribution);
        assert.equal(p.actor.properties.shen, shen);
        assert.ok(fn.includes(`query_skill("${skill}", 1) < ${level}`));
        assert.ok(fn.includes(`query_skill("force") < ${force}`));
        assert.ok(fn.includes(`query("gongxian") < ${contribution}`));
        assert.ok(fn.includes(`query("shen") > ${shen}`));
        assert.ok(fn.includes(`set("can_perform/${skill}/${grant}", 1)`));
        assert.ok(fn.includes(`add("gongxian", -${cost})`));
        assert.equal(p.teaching_expectations[0].contribution_spent, cost);
        assert.doesNotMatch(fn, /family\/master_id|query\("str"|max_neili|permit_recruit/);
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.ok(!Object.hasOwn(p.actor.properties, 'max_neili'));
        assert.equal(p.actor.properties.str, 30);
        assert.ok(p.qualification_sources.includes('kungfu/class/riyue/riyue.h'));
        for (const suffix of ['contribution-low', 'skill-low', 'shen-high', 'family-other', 'force-low']) {
            const c = group.find(c => c.id.endsWith('-' + suffix));
            assert.ok(fn.includes(c.parameters.teaching_expectations[0].response_contains));
        }
    }
});

test('秦伟邦原门槛 80 与扣费 100 分别保留，不能在用例中修正负贡献', () => {
    const get = suffix => cases.find(c => c.id === `teaching-qin-kou-${suffix}`).parameters;
    for (const [suffix, initial, remaining] of [['grant', 80, -20], ['cost-minus-one', 99, -1], ['cost-exact', 100, 0]]) {
        const p = get(suffix), expected = p.teaching_expectations[0];
        assert.equal(p.known_issue, 'MA-020');
        assert.equal(p.actor.properties.gongxian, initial);
        assert.equal(expected.contribution_spent, 100);
        assert.equal(initial - expected.contribution_spent, remaining);
        assert.equal(expected.value, 1);
        if (suffix !== 'grant') {
            const a = structuredClone(get('grant')), b = structuredClone(p);
            a.actor.properties.gongxian = initial;
            assert.deepEqual(a, b, '只改变贡献余额，不改变其他授课条件');
        }
    }
    assert.equal(get('contribution-low').actor.properties.gongxian, 79);
    assert.equal(get('contribution-low').teaching_expectations[0].contribution_spent, 0);
    assert.equal(get('contribution-low').teaching_expectations[0].value, 0);
    assert.deepEqual(get('repeat').teaching_expectations.map(s => s.contribution_spent), [100, 0]);
});

test('任我行、桑三娘、上官云的十项传授保留实际内力与轻功差异', () => {
    const selected = cases.filter(c => /^teaching-(ren|sang|shangguan)-/.test(c.id) && !isRenPalmChain(c));
    assert.equal(selected.length, 73);
    assert.equal(teachingEntries(selected).length, 10);
    for (const [id, file, func, skill, level, force, shen, contribution, maxNeili, dodge] of [
        ['ren-gui', 'ren', 'ask_skill1', 'yuanshi-jian', 140, 200, -120000, 500],
        ['ren-xuan', 'ren', 'ask_skill2', 'yuanshi-jian', 180, 260, -130000, 1400],
        ['ren-zhuo', 'ren', 'ask_skill3', 'guzhuo-zhang', 150, 220, -120000, 600, 1800],
        ['ren-yu', 'ren', 'ask_skill4', 'guzhuo-zhang', 180, 260, -150000, 1200, 2800],
        ['sang-po', 'sang', 'ask_skill1', 'lansha-shou', 100, 150, -20000, 200],
        ['sang-luo', 'sang', 'ask_skill2', 'heixue-shenzhen', 140, 200, -35000, 400],
        ['sang-cang', 'sang', 'ask_skill3', 'jifeng-cixuefa', 100, 120, -15000, 200, undefined, 120],
        ['shangguan-sha', 'shangguan', 'ask_skill1', 'shiying-lianhuan', 150, 200, -40000, 600],
        ['shangguan-duan', 'shangguan', 'ask_skill2', 'poyue-zhao', 80, 100, -10000, 100],
        ['shangguan-tong', 'shangguan', 'ask_skill3', 'zhenyu-quan', 80, 120, -12000, 150],
    ]) {
        const group = selected.filter(c => c.id.startsWith(`teaching-${id}-`));
        assert.equal(group.length, 7 + Number(Boolean(maxNeili)) + Number(Boolean(dodge)));
        const p = group.find(c => c.id.endsWith('-grant')).parameters;
        const source = inventory.files.find(f => f.path === `kungfu/class/riyue/${file}.c`);
        const fn = source.functions.find(f => f.name === func).text;
        const create = source.functions.find(f => f.name === 'create').text;
        assert.equal(p.teaching_entry.sha256, source.sha256);
        assert.equal(p.teaching_entry.function, func);
        assert.ok(create.includes(`"${p.topic}": (: ${func} :)`));
        assert.equal(p.actor.skills[skill], level);
        assert.equal(p.actor.skills.force, force * 2);
        assert.equal(p.actor.properties.shen, shen);
        assert.equal(p.actor.properties.gongxian, contribution);
        assert.equal(p.actor.properties.max_neili, maxNeili);
        assert.equal(p.actor.properties.neili, maxNeili);
        assert.equal(p.actor.skills.dodge, dodge ? dodge * 2 : undefined);
        for (const text of [`query_skill("${skill}", 1) < ${level}`, `query_skill("force") < ${force}`,
            `query("shen") > ${shen}`, `query("gongxian") < ${contribution}`,
            `set("${p.monitored_grants[0]}", 1)`, `add("gongxian", -${contribution})`]) {
            assert.ok(fn.includes(text), id + ': ' + text);
        }
        assert.doesNotMatch(fn, /family\/master_id|is_apprentice_of|permit_recruit|query\("str"/);
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.ok(p.qualification_sources.includes('kungfu/class/riyue/riyue.h'));
        for (const c of group.filter(c => c.parameters.expected === 'refused')) {
            assert.ok(fn.includes(c.parameters.teaching_expectations[0].response_contains));
        }
        for (const [variant, field, threshold] of [
            ['max-neili-low', 'max_neili', maxNeili], ['dodge-low', 'dodge', dodge],
        ]) {
            const lower = group.find(c => c.id.endsWith('-' + variant));
            if (!threshold) {
                assert.equal(lower, undefined);
                assert.ok(!fn.includes(field === 'dodge' ? 'query_skill("dodge")' : 'query("max_neili")'));
                continue;
            }
            const expected = structuredClone(p), actual = structuredClone(lower.parameters);
            if (field === 'dodge') {
                assert.ok(fn.includes(`query_skill("dodge") < ${threshold}`));
                expected.actor.skills.dodge--;
                assert.equal(Math.trunc(actual.actor.skills.dodge / 2), threshold - 1);
            } else {
                assert.ok(fn.includes(`query("max_neili") < ${threshold}`));
                expected.actor.properties.max_neili--;
            }
            delete expected.expected; delete actual.expected;
            delete expected.teaching_expectations; delete actual.teaching_expectations;
            assert.deepEqual(actual, expected, '只改变该资格，不改变当前资源或其他门槛');
        }
    }
    // The fifth Ren inquiry needs two prior real grants and is not falsely
    // represented by a pre-seeded can_perform flag in this ordinary group.
    assert.ok(!selected.some(c => c.parameters.topic === '反璞归真'));
});

test('反璞归真从零领悟连续授课，累计扣费和奖励不被前置配置掩盖', () => {
    const selected = cases.filter(isRenPalmChain);
    assert.equal(selected.length, 13);
    assert.equal(teachingEntries(selected).length, 3);
    const get = id => selected.find(c => c.id === `teaching-ren-zhen-${id}`).parameters;
    const complete = get('complete');
    assert.equal(complete.actor.properties.gongxian, 4000);
    assert.equal(complete.actor.skills['guzhuo-zhang'], 220);
    assert.equal(complete.actor.skills.strike, 220);
    assert.equal(complete.actor.skills['martial-cognize'], 0);
    assert.deepEqual(complete.teaching_expectations.map(e => e.contribution_spent), [600, 1200, 2200]);
    assert.deepEqual(complete.teaching_expectations.map(e => e.skills_before['guzhuo-zhang']), [220, 221, 222]);
    assert.deepEqual(complete.teaching_expectations.map(e => e.skills_after['guzhuo-zhang']), [221, 222, 225]);
    assert.deepEqual(complete.teaching_expectations.map(e => e.skills_after['martial-cognize']), [1, 2, 3]);
    assert.deepEqual(complete.teaching_expectations.map(e => e.teaching_entry.function),
        ['ask_skill3', 'ask_skill4', 'ask_skill5']);
    const repeat = get('repeat').teaching_expectations;
    assert.deepEqual(repeat.map(e => e.contribution_spent), [600, 1200, 2200, 0]);
    assert.deepEqual(repeat[3].skills_before, repeat[2].skills_after);
    assert.deepEqual(repeat[3].skills_after, repeat[2].skills_after);
    assert.equal(repeat[3].learned_after, undefined);
    assert.deepEqual(get('reverse').teaching_expectations.map(e => e.teaching_entry.function),
        ['ask_skill4', 'ask_skill3', 'ask_skill5']);
    for (const id of ['missing-both', 'missing-zhuo', 'missing-yu']) {
        const p = get(id), last = p.teaching_expectations.at(-1);
        assert.equal(last.value, 0);
        assert.equal(last.contribution_spent, 0);
        assert.equal(last.response_contains, '前两招都未练成');
        assert.equal(p.expected, id === 'missing-both' ? 'refused' : 'observed',
            '前置有所进展并不等于最后一招已学会');
    }
    const lowContribution = get('contribution-low');
    assert.equal(lowContribution.actor.properties.gongxian, 3999);
    assert.deepEqual(lowContribution.teaching_expectations.map(e => e.contribution_spent), [600, 1200, 0]);
    assert.equal(3999 - 600 - 1200, 2199);
    for (const [id, initial, finalBefore, grant] of [
        ['skill-exact', 218, 220, 1], ['skill-low', 217, 219, 0],
    ]) {
        const p = get(id), last = p.teaching_expectations.at(-1);
        assert.equal(p.actor.skills['guzhuo-zhang'], initial);
        assert.equal(last.skills_before['guzhuo-zhang'], finalBefore);
        assert.equal(last.value, grant);
        assert.equal(last.contribution_spent, grant ? 2200 : 0);
    }
    const source = inventory.files.find(f => f.path === 'kungfu/class/riyue/ren.c');
    const fn = source.functions.find(f => f.name === 'ask_skill5').text;
    for (const text of ['query("gongxian") < 2200', 'query("shen") > -200000',
        'query("can_perform/guzhuo-zhang/zhuo")', 'query("can_perform/guzhuo-zhang/yu")',
        'query("max_neili") < 3600', 'query_skill("force") < 300',
        'query_skill("guzhuo-zhang", 1) < 220', 'add("gongxian", -2200)']) assert.ok(fn.includes(text));
    assert.equal(fn.split('improve_skill("guzhuo-zhang", 1500000)').length - 1, 3);
    assert.equal(fn.split('improve_skill("strike", 1500000)').length - 1, 3);
    for (const p of selected.map(c => c.parameters)) {
        for (const file of ['feature/skill.c', 'inherit/skill/skill.c', 'kungfu/skill/guzhuo-zhang.c',
            'kungfu/skill/strike.c', 'kungfu/skill/martial-cognize.c']) {
            assert.ok(p.qualification_sources.includes(file));
        }
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_perform/')));
        assert.ok(p.teaching_expectations.every(e => e.teaching_entry.path === source.path));
    }
});

test('岳不群正神、基本内功与内力上限按原教学字段分别观察', () => {
    const yue = cases.filter(c => c.id.startsWith('teaching-yue-'));
    assert.equal(yue.length, 36);
    for (const [id, rawForce, maxNeili] of [['san', 140, 2000], ['wuji', 120, 1400], ['po', 120, undefined]]) {
        const base = yue.find(c => c.id === `teaching-yue-${id}-grant`).parameters;
        const lower = yue.find(c => c.id === `teaching-yue-${id}-basic-force-low`).parameters;
        assert.equal(base.actor.skills.force, rawForce);
        assert.equal(lower.actor.skills.force, rawForce - 1);
        assert.equal(base.actor.properties.max_neili, maxNeili);
        assert.ok(!Object.hasOwn(base.actor.properties, 'family/master_id'), '教学没有亲传要求，不附加拜师条件');
        const expected = structuredClone(base), actual = structuredClone(lower);
        expected.actor.skills.force--; delete expected.expected; delete actual.expected;
        delete expected.teaching_expectations; delete actual.teaching_expectations;
        assert.deepEqual(actual, expected);
        if (maxNeili) {
            const below = yue.find(c => c.id === `teaching-yue-${id}-max-neili-low`).parameters;
            const a = structuredClone(base), b = structuredClone(below);
            a.actor.properties.max_neili--; delete a.expected; delete b.expected;
            delete a.teaching_expectations; delete b.teaching_expectations;
            assert.deepEqual(b, a);
            assert.equal(b.actor.properties.neili, maxNeili, '内力上限门槛不是当前内力门槛');
        }
    }
    assert.equal(yue.find(c => c.id === 'teaching-yue-feng-grant').parameters.actor.skills.force, 300);
    for (const c of yue.filter(c => c.id.endsWith('-shen-low'))) {
        assert.match(c.parameters.teaching_expectations[0].response_contains, /侠义/);
        assert.equal(c.parameters.teaching_expectations[0].value, 0);
    }
    assert.ok(!yue.some(c => c.id.endsWith('-shen-high')));
});

test('张三丰十项询问走原闭包，不把太极图逐层领悟混入一次授予', () => {
    const source = inventory.files.find(f => f.path === 'kungfu/class/wudang/zhang.c');
    const create = source.functions.find(f => f.name === 'create').text;
    const zhang = cases.filter(c => c.id.startsWith('teaching-zhang-') && !c.parameters.grant_completion_value);
    assert.equal(zhang.length, 65);
    const grants = zhang.filter(c => c.id.endsWith('-grant'));
    assert.equal(grants.length, 10);
    assert.deepEqual(grants.map(c => c.parameters.teaching_entry.function),
        [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].map(i => `ask_skill${i}`));
    for (const c of grants) {
        const p = c.parameters;
        const fn = source.functions.find(f => f.name === p.teaching_entry.function);
        const skill = Object.keys(p.actor.skills).find(s => s !== 'force');
        assert.ok(create.includes(`"${p.topic}": (: ${fn.name} :)`));
        assert.ok(fn.text.includes(`query_skill("${skill}", 1) < ${p.actor.skills[skill]}`));
        assert.ok(fn.text.includes(`query("gongxian") < ${p.actor.properties.gongxian}`));
        assert.ok(fn.text.includes(`query("shen") < ${p.actor.properties.shen}`));
        assert.ok(fn.text.includes(`set("${p.monitored_grants[0]}", 1)`));
        assert.ok(fn.text.includes(`add("gongxian", -${p.actor.properties.gongxian})`));
        assert.equal(p.actor.skills.force, 0);
        assert.ok(!Object.hasOwn(p.actor.properties, 'family/master_id'));
        assert.doesNotMatch(fn.text, /query_skill\("force"|family\/master_id/);
        const below = zhang.find(x => x.id === c.id.replace(/grant$/, 'max-neili-low'));
        if (Object.hasOwn(p.actor.properties, 'max_neili')) {
            assert.ok(fn.text.includes(`query("max_neili") < ${p.actor.properties.max_neili}`));
            const expected = structuredClone(p), actual = structuredClone(below.parameters);
            expected.actor.properties.max_neili--;
            delete expected.expected; delete actual.expected;
            delete expected.teaching_expectations; delete actual.teaching_expectations;
            assert.deepEqual(actual, expected, '最大内力边界不得同时改变当前内力或其他门槛');
        } else {
            assert.equal(below, undefined);
            assert.doesNotMatch(fn.text, /query\("max_neili"/);
        }
    }
    assert.ok(!zhang.some(c => c.parameters.topic === '太极图'));
    const progressive = source.functions.find(f => f.name === 'ask_skill6').text;
    assert.match(progressive, /add\("can_perform\/taiji-quan\/tu", 1\)/);
    assert.match(progressive, /query\("can_perform\/taiji-quan\/tu"\) >= 10/);
});

test('太极图使用连续十次原询问；潜能按总值与已用之差、贡献仅完成时扣除', () => {
    const diagram = cases.filter(c => c.id.startsWith('teaching-zhang-tu-'));
    assert.equal(diagram.length, 12);
    const p = diagram.find(c => c.id.endsWith('-complete')).parameters;
    assert.equal(p.grant_completion_value, 10);
    assert.equal(p.teaching_entry.function, 'ask_skill6');
    assert.equal(p.actor.properties.potential - p.actor.properties.learned_points, 1000);
    assert.deepEqual(p.teaching_expectations.map(e => e.value), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(p.teaching_expectations.map(e => e.contribution_spent),
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 3000]);
    assert.equal(p.teaching_expectations.reduce((sum, e) => sum + e.learned_points_spent, 0), 1000);
    assert.deepEqual(p.teaching_expectations.map(e => e.may_improve_skills),
        [false, false, false, false, false, false, false, false, false, true]);
    const repeat = diagram.find(c => c.id.endsWith('-repeat')).parameters;
    assert.equal(repeat.teaching_expectations.length, 11);
    assert.equal(repeat.teaching_expectations.at(-1).value, 10);
    assert.equal(repeat.teaching_expectations.at(-1).learned_points_spent, 0);
    assert.equal(repeat.teaching_expectations.at(-1).contribution_spent, 0);
    const partial = diagram.find(c => c.id.endsWith('-potential-partial')).parameters;
    assert.equal(partial.actor.properties.potential - partial.actor.properties.learned_points, 900);
    assert.deepEqual(partial.teaching_expectations.map(e => e.value), [1, 2, 3, 4, 5, 6, 7, 8, 9, 9]);
    assert.ok(partial.teaching_expectations.every(e => e.contribution_spent === 0));
    assert.equal(partial.expected, 'observed', '有进展但未完成，不能把九层当十层');
    for (const [variant, field, value, skill] of [
        ['contribution-low', 'gongxian', 2999], ['shen-low', 'shen', 249999],
        ['max-jingli-low', 'max_jingli', 999], ['family-other', 'family/family_name', '华山派'],
        ['potential-low', 'potential', 299], ['quan-low', 'taiji-quan', 249, true],
        ['force-skill-low', 'taiji-shengong', 299, true], ['taoism-low', 'taoism', 299, true],
    ]) {
        const lower = diagram.find(c => c.id === `teaching-zhang-tu-${variant}`).parameters;
        const expected = structuredClone(p), actual = structuredClone(lower);
        expected.actor[skill ? 'skills' : 'properties'][field] = value;
        delete expected.expected; delete actual.expected;
        delete expected.teaching_expectations; delete actual.teaching_expectations;
        assert.deepEqual(actual, expected, '资格边界混入其他变化：' + variant);
        assert.equal(lower.expected, 'refused');
        assert.equal(lower.teaching_expectations[0].value, 0);
        assert.equal(lower.teaching_expectations[0].learned_points_spent, 0);
    }
    const source = inventory.files.find(f => f.path === 'kungfu/class/wudang/zhang.c');
    const fn = source.functions.find(f => f.name === 'ask_skill6').text;
    for (const text of ['query("gongxian") < 3000', 'query("shen") < 250000',
        'query_skill("taiji-quan", 1) < 250', 'query_skill("taiji-shengong", 1) < 300',
        'query_skill("taoism", 1) < 300', 'query("max_jingli") < 1000',
        'query("potential") < me->query("learned_points") + 100',
        'add("learned_points", 100)', 'add("gongxian", -3000)']) assert.ok(fn.includes(text), text);
    const perform = inventory.files.find(f => f.path === 'kungfu/skill/taiji-quan/tu.c')
        .functions.find(f => f.name === 'perform').text;
    assert.ok(perform.includes('query("can_perform/taiji-quan/tu") < 10'),
        '原玩家施展按十层检查，但仍有其他施展条件，不以学习完成冒充施展已验收');
});

test('三渡共用头文件声明但各自走真实 NPC，来源去重不代替三份运行条件', () => {
    const shared = cases.filter(c => c.id.startsWith('teaching-du-'));
    assert.equal(shared.length, 48);
    assert.equal(new Set(shared.map(c => c.parameters.teacher.path)).size, 3);
    assert.equal(new Set(shared.map(c => c.entry_id)).size, 1);
    assert.equal(teachingEntries(shared)[0].path, 'kungfu/class/shaolin/du.h');
    for (const id of ['du-e', 'du-jie', 'du-nan']) {
        const teacherCases = shared.filter(c => c.id.startsWith(`teaching-${id}-`));
        assert.equal(teacherCases.length, 16);
        for (const c of teacherCases) {
            const p = c.parameters, teacherSource = `kungfu/class/shaolin/${id}.c`;
            assert.equal(p.teacher.path, '/' + teacherSource.slice(0, -2));
            assert.equal(p.teacher.sha256, inventory.files.find(f => f.path === teacherSource).sha256);
            assert.equal(p.teaching_entry.path, 'kungfu/class/shaolin/du.h');
            assert.equal(p.teaching_evidence.path, 'kungfu/class/shaolin/du.h');
            assert.ok(p.qualification_sources.includes(teacherSource));
            assert.ok(p.qualification_sources.includes('kungfu/class/shaolin/du.h'));
            assert.ok(p.qualification_sources.includes('kungfu/class/shaolin/shaolin.h'));
            assert.equal(p.qualification_sources.filter(s => /shaolin\/du-.*\.c$/.test(s)).length, 1);
            for (const key of ['class', 'family/master_id', 'family/generation']) {
                assert.ok(!Object.hasOwn(p.actor.properties, key), '不附加原询问没有的拜师条件：' + key);
            }
            assert.ok(!Object.hasOwn(p.actor, 'temp'));
        }
        for (const [suffix, skill, force, maxNeili, shen, contribution] of [
            ['he', 120, 150, 1000, 20000, 800], ['shang', 180, 250, 3000, 50000, 1200],
        ]) {
            const p = teacherCases.find(c => c.id === `teaching-${id}-${suffix}-grant`).parameters;
            assert.equal(p.actor.skills['riyue-bian'], skill);
            assert.equal(p.actor.skills.force, force * 2);
            assert.equal(p.actor.properties.max_neili, maxNeili);
            assert.equal(p.actor.properties.shen, shen);
            assert.equal(p.teaching_expectations[0].contribution_spent, contribution);
        }
    }
    const changed = structuredClone(relations);
    changed.objects.find(o => o.path === 'kungfu/class/shaolin/du-e.c')
        .grants[0].enclosing_function.path = 'kungfu/class/shaolin/du-e.c';
    assert.throws(() => teachingConditions(changed, catalog), /教学函数来源/);
});

test('赵鹤自己的师承/膂力门槛不由公共教学表代替，有效与原始内功分开', () => {
    const base = cases.find(c => c.id === 'teaching-zhao-zhen-grant').parameters;
    assert.equal(base.actor.properties['family/master_id'], 'ren woxing');
    assert.equal(base.actor.properties.str, 32);
    assert.equal(base.actor.properties.shen, -120000);
    assert.equal(base.actor.skills.force / 2, 300);
    assert.equal(base.actor.skills['hanshan-chuifa'], 180);
    assert.equal(base.actor.properties.gongxian, 1200);
    for (const variant of ['family-other', 'master-other', 'strength-low', 'force-low']) {
        const c = cases.find(c => c.id === `teaching-zhao-zhen-${variant}`);
        assert.equal(c.parameters.teaching_expectations[0].value, 0);
        assert.equal(c.parameters.teaching_expectations[0].contribution_spent, 0);
        assert.ok(c.parameters.teaching_expectations[0].response_contains);
    }
    const lower = cases.find(c => c.id.endsWith('zhao-zhen-force-low'));
    assert.equal(Math.trunc(lower.parameters.actor.skills.force / 2), 299);
    assert.equal(base.actor.skills.force, 600, '其他条件不可被派生用例改写');
});

test('少林三位教师的十二项传授按入口分别核对，不混入拜师或普通学习条件', () => {
    const selected = cases.filter(c => /^teaching-(xuanci|wuming|damo)-/.test(c.id) && !isDamoSword(c));
    assert.equal(selected.length, 95);
    const grants = selected.filter(c => c.id.endsWith('-grant'));
    assert.equal(grants.length, 12);
    assert.equal(teachingEntries(selected).length, 4);
    for (const c of grants) {
        const p = c.parameters;
        const source = inventory.files.find(f => f.path === p.teaching_entry.path);
        const fn = source.functions.find(f => f.name === p.teaching_entry.function);
        assert.equal(p.teacher.sha256, source.sha256);
        assert.equal(p.actor.properties['family/family_name'], '少林派');
        for (const key of ['class', 'family/master_id', 'family/generation', 'WPK']) {
            assert.ok(!Object.hasOwn(p.actor.properties, key), '不添加询问之外的条件：' + key);
        }
        assert.ok(!Object.hasOwn(p.actor.skills, 'buddhism'));
        assert.doesNotMatch(fn.text, /is_apprentice_of|permit_recruit|recognize_apprentice/);
        if (p.teacher.path.endsWith('/xuan-ci')) {
            assert.ok(p.qualification_sources.includes('kungfu/class/shaolin/xuan.h'));
            assert.ok(p.qualification_sources.includes('kungfu/class/shaolin/shaolin.h'));
        }
        if (c.id === 'teaching-wuming-zong-grant') {
            assert.equal(fn.name, 'ask_skill1');
            assert.equal(p.actor.skills['rulai-zhang'], 220);
            assert.equal(p.actor.skills.force, 700);
            assert.equal(p.actor.properties.max_neili, undefined);
            const create = source.functions.find(f => f.name === 'create').text;
            assert.ok(create.includes('"万佛朝宗": (: ask_skill1 :)'));
            for (const text of ['query_skill("rulai-zhang", 1) < 220', 'query_skill("force") < 350',
                'query("shen") < 150000', 'query("gongxian") < 800',
                'set("can_perform/rulai-zhang/zong", 1)', 'add("gongxian", -800)']) {
                assert.ok(fn.text.includes(text), text);
            }
        } else {
            assert.equal(fn.name, 'accept_ask');
            assert.ok(fn.text.includes(`case "${p.topic}":`));
            assert.ok(fn.text.includes(`"perform": "${p.monitored_grants[0]}"`));
        }
    }
    assert.ok(!selected.some(c => /清心剑|乱气剑|伤神剑|折元剑/.test(c.parameters.topic)),
        '达摩私有剑招使用独立条件，不能与六项公共教学混为一组');
});

test('达摩四项私有剑招保留错位领悟和实际师承判断，不按提示名称纠正源码', () => {
    const selected = cases.filter(isDamoSword);
    assert.equal(selected.length, 38);
    assert.equal(teachingEntries(selected).length, 4);
    const source = inventory.files.find(f => f.path === 'kungfu/class/shaolin/da-mo.c');
    for (const [id, actual, reward] of [
        ['qingxin', 'luan', 'force'], ['luan', 'qingxin', 'sword'],
        ['shang', 'shang', 'force'], ['zhe', 'zhe', 'force'],
    ]) {
        const prefix = `teaching-damo-${id}-`;
        const base = selected.find(c => c.id === prefix + 'grant').parameters;
        const fn = source.functions.find(f => f.name === `ask_${id}`);
        assert.equal(base.teaching_entry.function, fn.name);
        assert.equal(base.actor.properties.gongxian, 0);
        assert.equal(base.actor.properties['family/master_id'], 'da mo');
        assert.equal(base.actor.properties['family/master_name'], '达摩老祖');
        assert.equal(base.actor.properties['reborn/family_name'], 0);
        assert.ok(base.qualification_sources.includes('feature/apprentice.c'));
        assert.ok(fn.text.includes('is_apprentice_of(this_object())'));
        assert.ok(fn.text.includes('query("shen") < 120000'));
        assert.ok(fn.text.includes('query_skill("damo-jian", 1) < 200'));
        assert.ok(fn.text.includes(`set("can_perform/damo-jian/${actual}", 1)`));
        assert.ok(fn.text.includes(`improve_skill("${reward}", 160000)`));
        assert.doesNotMatch(fn.text, /gongxian|max_neili|permit_recruit/);
        assert.equal(base.teaching_expectations[0].grant, `can_perform/damo-jian/${actual}`);
        assert.equal(base.teaching_expectations[0].reward_skill, reward);
        const repeat = selected.find(c => c.id === prefix + 'repeat').parameters.teaching_expectations[1];
        assert.equal(repeat.may_improve_skills, id === 'qingxin');
        assert.equal(repeat.reward_skill, id === 'qingxin' ? 'force' : undefined);
        for (const variant of ['master-other', 'master-name-other', 'reborn-other', 'family-other', 'skill-low', 'shen-low']) {
            const c = selected.find(c => c.id === prefix + variant);
            assert.equal(c.parameters.expected, 'refused');
            assert.equal(c.parameters.teaching_expectations[0].contribution_spent, 0);
        }
        const reborn = selected.find(c => c.id === prefix + 'reborn-same').parameters;
        assert.equal(reborn.actor.properties['family/master_id'], 'other teacher');
        assert.equal(reborn.actor.properties['reborn/family_name'], '少林派');
        assert.equal(reborn.expected, 'observed', '按当前公开判断保留转世分支，不按注释猜测其已停用');
    }
    for (const [order, values] of [['qingxin-luan', [1, 1]], ['luan-qingxin', [1, 0]]]) {
        const p = selected.find(c => c.id === `teaching-damo-order-${order}`).parameters;
        assert.deepEqual(p.teaching_expectations.map(e => e.value), values);
        const next = p.teaching_expectations[1];
        assert.equal(next.action, `ask da mo about 达摩${order.startsWith('qingxin') ? '乱气' : '清心'}剑`);
        assert.equal(next.teaching_entry.function, `ask_${order.split('-')[1]}`);
        assert.equal(next.absent_grants, undefined, '第二问不能把第一问已取得的标记再当未学');
        assert.equal(p.known_issue, 'MA-017');
    }
    const sequential = selected.find(c => c.id === 'teaching-damo-order-qingxin-luan');
    assert.equal(teachingEntries([sequential]).length, 2, '顺序用例的第二入口不能丢失来源');
    const tampered = structuredClone(sequential);
    tampered.parameters.teaching_expectations[1].teaching_entry.sha256 = '0'.repeat(64);
    assert.throws(() => teachingEntries([tampered]), /来源 hash/);
});

test('源码或教学声明变化必须重新核对，旧来源与新文件不能拼成计划', () => {
    assert.throws(() => teachingConditions(relations, { ...catalog, source_fingerprint: 'changed' }), /同一源码/);
    assert.throws(() => teachingConditions(relations, catalog,
        path => readFileSync(join(root, path), 'utf8') + '\n'), /教学依赖变化/);
    const changed = structuredClone(relations);
    changed.objects.find(o => o.path.endsWith('/jueqing/chi.c')).grants
        .find(g => g.grant === 'can_perform/tiexian-quan/jia').fields.gongxian.value = 999;
    assert.throws(() => teachingConditions(changed, catalog), /教学字段改变/);
});

test('教学覆盖指向真实教师函数，不把传授或错误领悟写成绝招已施展', () => {
    const entries = teachingEntries(cases);
    assert.equal(entries.length, 142);
    assert.equal(cases.length, 1236);
    for (const entry of entries) {
        const source = inventory.files.find(f => f.path === entry.path);
        assert.equal(source.sha256, entry.sha256);
        assert.ok(source.functions.some(f => f.name === entry.function && f.line === entry.line));
        assert.equal(entry.id, `${entry.path}:${entry.line}:${entry.function}`);
        assert.equal(entry.role, 'teaching');
    }
    assert.ok(!entries.some(e => e.path.startsWith('kungfu/skill/')));
    const changed = structuredClone(cases);
    changed[0].entry_id = 'kungfu/skill/tiexian-quan/tui.c:1:perform';
    assert.throws(() => teachingEntries(changed), /入口身份/);
    changed[0] = structuredClone(cases[0]);
    changed[0].parameters.teaching_entry.sha256 = '0'.repeat(64);
    assert.throws(() => teachingEntries(changed), /来源 hash/);
});

test('通用样本终态与逐步教学预期分开，准备参数可用于原顺序执行器', () => {
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.expected, p.teaching_expectations[0].value ? 'observed' : 'refused');
        assert.equal(p.fighting, false);
        assert.equal(p.observe_seconds, 0);
        assert.equal(p.not_applicable, '');
        assert.deepEqual(p.target, { skills: { force: 1 }, mappings: {}, properties: {} });
        assert.ok(!p.actor.equipment && !p.target.equipment);
        assert.ok(c.entry_id.startsWith('kungfu/class/'));
        assert.equal(c.status, 'configured_not_executed');
    }
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 408);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 828);
    // A known wrong grant is still an observed original behavior, not a
    // corrected skill result or evidence that the player can perform it.
    const bad = cases.find(c => c.id === 'teaching-chi-tui-grant');
    assert.equal(bad.parameters.expected, 'observed');
    assert.equal(bad.parameters.known_issue, 'MA-003');
});
