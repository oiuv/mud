import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildCatalog, categoryCandidates, collectCatalog, readDictionary } from './catalog.mjs';
import { buildInventory, scanSource, sha256 } from './inventory.mjs';
import { root } from '../../collect_martial_data.mjs';

const file = (path, scope, source) => ({ path, scope, sha256: sha256(source), ...scanSource(source) });

test('适用类别保留直接比较和数组声明出处，不声称控制流已执行', () => {
    const direct = file('kungfu/skill/a.c', 'skill', 'int valid_enable(string usage) { return usage == "axe" || "parry" == usage; }');
    assert.deepEqual(categoryCandidates(direct)[0].candidates.map(c => c.value), ['axe', 'parry']);
    const array = file('kungfu/skill/b.c', 'skill', `string *usage_skills = ({ "sword", "force", CATEGORY });
        int valid_enable(string usage) { return member_array(usage, usage_skills) != -1; }`);
    const result = categoryCandidates(array)[0];
    assert.deepEqual(result.candidates.map(c => c.value), ['sword', 'force']);
    assert.equal(result.status, 'runtime_unverified');
    assert.ok(result.unresolved.includes('control_flow_and_macros_not_evaluated'));
    assert.ok(result.candidates[0].declaration.text.includes('CATEGORY'));
    const unresolved = categoryCandidates(file('a.c', 'skill', 'int valid_enable(string usage) { return test(usage, CATEGORY); }'))[0];
    assert.ok(unresolved.unresolved.includes('no_literal_candidate'));
    const negated = categoryCandidates(file('b.c', 'skill', 'int valid_enable(string usage) { return !(usage == "axe"); }'))[0];
    assert.equal(negated.status, 'runtime_unverified');
});

test('公共字典保持原文/行列/hash；重复和意外格式不静默覆盖', () => {
    const source = '#/adm/daemons/chinesed.c\ndict (["spear":"基本枪法","count":"阴阳八卦",])\n';
    const entries = readDictionary(source);
    assert.equal(entries[0].name, '基本枪法');
    assert.equal(entries[1].name, '阴阳八卦');
    assert.equal(entries[0].line, 2);
    assert.equal(entries[0].sha256, sha256(source));
    assert.equal(source.slice(entries[0].start, entries[0].end), entries[0].text);
    assert.throws(() => readDictionary('dict (["a":"甲","a":"乙",])'), /重复/);
    assert.throws(() => readDictionary('other (["a":"甲",])'), /格式/);
});

test('共享头文件和宏保留来源，NPC 自用、领悟候选、公共分组严格分开', () => {
    const header = file('kungfu/class/misc/common.h', 'class', 'void teach() { me->set("can_perform/foo/bar", 1); }');
    const teacher = file('kungfu/class/misc/a.c', 'class', `#include "common.h"
        inherit F_MASTER;
        void create() { set_name("甲", ({"jia"})); set_skill("foo", 300); map_skill("spear", "foo"); create_family(FAMILY, 2, "弟子"); }
        mixed ask_bar() { return MASTER_D->teach_pfm(me, this_object(), (["skill": "foo"])); }`);
    teacher.directives[0].resolved = header.path;
    const globals = file('include/globals.h', 'header_dependency', '#define F_MASTER "/feature/master"\n#define FAMILY "某门派"\n');
    const weapon = file('include/weapon.h', 'header_dependency', '#define SPEAR "/inherit/weapon/spear"\n');
    const inventory = { source_fingerprint: 'fixture', files: [teacher, header, globals, weapon] };
    const catalog = buildCatalog(inventory, 'dict ([])');
    const record = catalog.teachers[0];
    assert.equal(record.directory_group, 'misc');
    assert.equal(record.npc_skills[0].values[0], 'foo');
    assert.equal(record.teaching_candidates.length, 2);
    assert.equal(record.teaching_candidates[1].evidence.path, header.path);
    assert.equal(record.families[0].values[0], null);
    assert.equal(record.families[0].args[0].raw, 'FAMILY');
    assert.equal(record.eligibility, 'not_verified');
    assert.equal(record.inherits[0].macro_candidates[0].value, '"/feature/master"');
    assert.equal(catalog.weapon_types[0].macro, 'SPEAR');
});

test('真实库十二类、数组式葵花、少林头文件及赵鹤传授都可追到原文', () => {
    const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
    assert.equal(catalog.weapon_types.length, 12);
    assert.equal(catalog.teachers.length, 418);
    assert.equal(catalog.skills.length, 1451);
    assert.deepEqual(catalog.skills.find(s => s.id === 'kuihua-mogong').categories[0].candidates.map(c => c.value),
        ['unarmed', 'sword', 'dodge', 'parry', 'force']);
    assert.equal(catalog.skills.find(s => s.id === 'hanshan-chuifa').dictionary_name.name, '撼山锤法');
    const zhao = catalog.teachers.find(t => t.path.endsWith('/riyue/zhao.c'));
    assert.ok(zhao.teaching_candidates.some(c => c.values[0] === 'can_perform/hanshan-chuifa/zhen'));
    const xuanci = catalog.teachers.find(t => t.path.endsWith('/shaolin/xuan-ci.c'));
    assert.ok(xuanci.shared_headers.some(h => h.path.endsWith('/shaolin/xuan.h')));
    assert.ok(xuanci.qualification_functions.some(q => q.evidence.path.endsWith('/shaolin/xuan.h')));
    assert.ok(catalog.teachers.some(t => t.directory_group === 'generate'));
    for (const type of catalog.weapon_types) {
        const text = readFileSync(join(root, type.evidence.path), 'utf8');
        assert.equal(text.slice(type.evidence.start, type.evidence.end), type.evidence.text);
    }
});
