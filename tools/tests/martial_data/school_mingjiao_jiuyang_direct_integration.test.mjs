import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
// Finite wiring gates; synthetic acceptance is not native USER evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import {
    mingjiaoJiuyangDirectConditions, mingjiaoJiuyangDirectSourcePaths,
    mingjiaoJiuyangDirectReviewedSourceHash, mingjiaoJiuyangDirectAbsentPaths,
    validateMingjiaoJiuyangDirectCondition,
} from './school_mingjiao_jiuyang_direct_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const group = 'mingjiao-jiuyang-direct', prefix = 'school-mingjiao-direct-jiuyang-';
const clone = value => structuredClone(value);
const total = rows => rows.reduce((sum, row) => sum + row.samples, 0);
const catalog = collectCatalog(root, buildInventory(root));
const conditions = mingjiaoJiuyangDirectConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);
const pick = (ability, variant) => {
    const result = conditions.find(c => c.parameters.ability === ability && c.parameters.variant === variant);
    assert.ok(result, `${ability}/${variant}`);
    return result;
};
const deny = (condition, edit) => {
    const altered = clone(condition);
    edit(altered);
    assert.throws(() => validateMingjiaoJiuyangDirectCondition(altered));
    assert.throws(() => validateQualificationSources([altered], snapshot().files));
};
const lpcFunction = (source, name) => {
    const match = source.match(new RegExp(`^[\\w* ]+\\b${name}\\([^;]*?\\)\\s*\\{[\\s\\S]*?^\\}`, 'm'));
    assert.ok(match, `missing LPC function ${name}`);
    return match[0];
};

test('九阳直伤只尾追加54条件，保留V5完整17200正式与烟雾有序指纹', () => {
    const formal = preOctober29SchoolConditions(catalog).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-jiuyang-remaining', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-exert', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-capacity', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-research', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-fusion', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    const smoke = preOctober29SchoolConditions(catalog, { smoke: true }).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-jiuyang-remaining', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-exert', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-capacity', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-research', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-fusion', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    const smokeTail = mingjiaoJiuyangDirectConditions(catalog, read, { smoke: true });
    assert.deepEqual(formal.slice(17200, 17200 + conditions.length), conditions);
    assert.deepEqual(smoke.slice(17200, 17200 + smokeTail.length), smokeTail);
    assert.equal(formal.length, 17254); assert.equal(total(formal), 455510);
    assert.equal(smoke.length, 17254); assert.equal(total(smoke), 28792);
    assert.equal(sha256(JSON.stringify(formal.slice(0, 17200))),
        '02db088fa6b449fb4d0ec66259976cdba086845f7ffc328a477322fde5825f12');
    assert.equal(sha256(JSON.stringify(smoke.slice(0, 17200))),
        '87cde19c9fe36f83cf3774a3d0c1f45fb2d6c05867d4ef13a5a1eaa3fb520bda');
    assert.equal(conditions.length, 54); assert.equal(total(conditions), 1186);
    assert.equal(total(smokeTail), 108);
    assert.deepEqual(['hun', 'po', 'pi'].map(a => conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.ability === a).length), [16, 19, 19]);
    assert.equal(conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.random_effects).length, 11);
    assert.equal(new Set(conditions.map(c => c.id)).size, 54);
    for (const c of [...conditions, ...smokeTail]) {
        assert.ok(c.id.startsWith(prefix)); assert.equal(c.parameters.collection_group, group);
        assert.equal(c.method, 'perform'); assert.equal(validateMingjiaoJiuyangDirectCondition(c), c.parameters);
    }
});

test('129资格源及六个缺席基础入口均绑定实际字节，拒绝漂移、假entry和缺源', () => {
    const files = snapshot().files, base = pick('hun', '400');
    assert.equal(mingjiaoJiuyangDirectSourcePaths.length, 129);
    assert.equal(new Set(mingjiaoJiuyangDirectSourcePaths).size, 129);
    assert.equal(mingjiaoJiuyangDirectReviewedSourceHash,
        '37ebf7815967281065dfe4a47123a47e1c84d24515ef176d96cfe2a283e3fdcd');
    assert.deepEqual(mingjiaoJiuyangDirectAbsentPaths, [
        'kungfu/skill/unarmed/hun.c', 'kungfu/skill/unarmed/hun.lpc',
        'kungfu/skill/sword/po.c', 'kungfu/skill/sword/po.lpc',
        'kungfu/skill/blade/pi.c', 'kungfu/skill/blade/pi.lpc',
    ]);
    assert.doesNotThrow(() => validateQualificationSources(conditions, files));
    for (const path of mingjiaoJiuyangDirectSourcePaths) {
        assert.equal(files[path], sha256(readFileSync(join(root, path))));
        const missing = { ...files }; delete missing[path];
        assert.throws(() => validateQualificationSources([base], missing), undefined, path);
        assert.throws(() => validateQualificationSources([base], { ...files, [path]: '0'.repeat(64) }), undefined, path);
    }
    for (const path of mingjiaoJiuyangDirectAbsentPaths)
        assert.throws(() => validateQualificationSources([base], { ...files, [path]: '1'.repeat(64) }));
    for (const edit of [
        c => { c.entry_id += '-other'; },
        c => { c.parameters.source_entry.path = 'kungfu/skill/unarmed/hun.c'; },
        c => { c.parameters.source_entry.sha256 = '0'.repeat(64); },
        c => { delete c.parameters.source_evidence['cmds/skill/perform.c']; },
        c => { c.parameters.qualification_sources.reverse(); },
        c => { c.parameters.qualification_evidence.pop(); },
        c => { c.parameters.absent_sources.pop(); },
    ]) deny(base, edit);
    assert.throws(() => mingjiaoJiuyangDirectConditions(catalog,
        path => read(path) + (path === 'kungfu/skill/jiuyang-shengong/perform/hun.c' ? '\n' : '')));
    assert.throws(() => mingjiaoJiuyangDirectConditions(catalog,
        path => path === mingjiaoJiuyangDirectAbsentPaths[0] ? 'int perform(){return 1;}\n' : read(path)));
});

test('执行准入不扩充命令、装备、靶状态、busy、no_perform或资格赋值', () => {
    const hun = pick('hun', '400'), sword = pick('po', '400'), dual = pick('hun', 'dual');
    for (const edit of [
        c => { c.parameters.action = 'eval return 1'; },
        c => { c.method = 'interface'; },
        c => { c.parameters.ability = 'jiu'; },
        c => { c.parameters.observe_seconds = 1; },
        c => { c.parameters.target_state = 'dead'; },
        c => { c.parameters.target_state = 'unconscious'; },
        c => { c.parameters.target.equipment = { program: '/clone/weapon/gangjian', type: 'sword' }; },
        c => { c.parameters.target.busy = 1; },
        c => { c.parameters.actor.busy = 1; },
        c => { c.parameters.actor.temp = { no_perform: 1 }; },
        c => { c.parameters.actor.properties['can_perform/jiuyang-shengong/po'] = 1; },
        c => { c.parameters.actor.properties.reborn = { times: 1 }; },
        c => { c.parameters.actor.properties['can_learn/jiuyang-shengong/enable_weapon'] = 0; },
        c => { c.parameters.capture_skill_loads = true; },
        c => { c.parameters.unknown = 1; },
    ]) deny(hun, edit);
    for (const edit of [
        c => { c.parameters.actor.equipment.program = '/tests/sword'; },
        c => { c.parameters.actor.equipment.type = 'blade'; },
        c => { c.parameters.actor.equipment.hold = true; },
        c => { c.parameters.actor.equipment.weight = 6000; },
        c => { c.parameters.actor.equipment.item_make = true; },
    ]) deny(sword, edit);
    deny(dual, c => { c.parameters.actor.secondary_equipment.program = '/clone/weapon/gangdao'; });
    deny(dual, c => { c.parameters.actor.secondary_equipment.type = 'sword'; });
    for (const a of ['hun', 'po', 'pi']) {
        deny(pick(a, 'unconscious'), c => { c.parameters.target_state = 'living'; });
        deny(pick(a, 'busy1'), c => { c.parameters.actor.busy = 2; });
        deny(pick(a, 'no-perform'), c => { c.parameters.actor.temp.no_perform = 2; });
        deny(pick(a, 'no-perform'), c => { c.parameters.target.temp = { no_perform: 1 }; });
        deny(pick(a, 'grant0'), c => { c.parameters.actor.properties['can_perform/jiuyang-shengong/' + a] = 1; });
    }
});

test('五个新工具确实冻结；既有15文件48探针完整指纹保持且不新增原技能探针', () => {
    const { files, probes: allProbes } = snapshot();
    const fusion = allProbes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = allProbes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'integration.test.mjs', 'report.mjs', 'report.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_direct_' + suffix;
        assert.equal(files[path], sha256(readFileSync(join(root, path))), path);
    }
    assert.equal(probes.length, 15); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(probes)), 'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.ok(!probes.some(p => p.path.startsWith('kungfu/skill/jiuyang-shengong/')));
});

test('公共Record接受实际钢剑钢刀而不把测试剑或持物身份冒充主手原物件', () => {
    // This small envelope exercises only the shared gate; own cases.test covers all 54 complete records.
    for (const ability of ['po', 'pi']) {
        const c = pick(ability, 'grant0'), equipment = c.parameters.actor.equipment;
        const before = [0, 1].map(side => ({ userp: 1, interactive: 1, playerp: 1, wizardp: 0,
            object: `/tests/actor#${side + 1}`, qi: 100, eff_qi: 100, jing: 100, eff_jing: 100, neili: 100 }));
        Object.assign(before[0], { weapon_flag: 4, weapon_damage: 25,
            weapon_details: { program: equipment.program, weight: ability === 'pi' ? 7000 : 6000, flag: 4, damage: 25 } });
        const raw = { kind: 'sample', condition_id: c.id, method: c.method, outcome: 'refused',
            before, after: clone(before), metrics: [{}, {}], launches: [], elapsed: 0, command_accepted: 0 };
        assert.doesNotThrow(() => validateRecord(raw, c));
        const wrong = clone(raw); wrong.before[0].weapon_details.program = '/tests/' + equipment.type;
        assert.throws(() => validateRecord(wrong, c));
        const held = clone(c); held.parameters.actor.equipment.hold = true;
        assert.throws(() => validateRecord(raw, held));
        const fake = clone(c); fake.parameters.actor.equipment.program = '/tests/' + equipment.type;
        assert.throws(() => validateRecord(raw, fake));
    }
});

test('Runner保留原USER别名与真实原物件槽，受限准备不代写有效激发或昏迷结果', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    const prepare = lpcFunction(source, 'prepare_actor'), snap = lpcFunction(source, 'snapshot');
    assert.match(prepare, /present\(side \? "right" : "left", this_object\(\)\) == ob/);
    assert.match(prepare, /"mingjiao-jiuyang-direct"[\s\S]*?require\(side == 0 && !config\["equipment"\]\["hold"\]/);
    assert.match(prepare, /\(\{ "\/clone\/weapon\/gangjian", "\/clone\/weapon\/gangdao" \}\)/);
    assert.match(prepare, /weapon = new\(config\["equipment"\]\["program"\]\)/);
    assert.match(prepare, /config\["secondary_equipment"\]\["program"\] == "\/clone\/weapon\/dagger"/);
    assert.match(prepare, /ob->query_temp\("weapon"\) == weapon && !ob->query_temp\("secondary_weapon"\)/);
    assert.match(prepare, /current\["parameters"\]\["variant"\] == "no-perform" && key == "no_perform" && value == 1/);
    assert.match(prepare, /else ob->start_busy\(config\["busy"\]\)/);
    assert.match(prepare, /ob->query_skill_map\(\)\[key\] == value && !ob->query_skill_mapped\(key\)/);
    assert.match(prepare, /!ob->query\("can_learn\/jiuyang-shengong\/enable_weapon"\)/);
    const start = snap.indexOf('({ "mingjiao-jiuyang-direct", "mingjiao-jiuyang-remaining" })) != -1)');
    assert.ok(start >= 0);
    const dedicated = snap.slice(start, snap.indexOf('\n    }', start));
    for (const key of ['fighting_opponent', 'killing_opponent', 'effective_int', 'effective_dex', 'craze', 'max_craze',
        'no_perform', 'secondary_weapon', 'secondary_weapon_details', 'can_learn/jiuyang-shengong/enable_weapon',
        'can_perform/jiuyang-shengong/hun', 'can_perform/jiuyang-shengong/po', 'can_perform/jiuyang-shengong/pi'])
        assert.ok(dedicated.includes('"' + key + '"'), key);
    const perform = lpcFunction(source, 'perform_sample');
    const prep = perform.slice(perform.indexOf('if (parameters["target_state"]'));
    assert.ok((prep.slice(0, prep.indexOf('current["before"]')).match(/"mingjiao-jiuyang-direct"/g) ?? []).length >= 3);
    assert.match(prep, /players\[1\]->unconcious\(\)/);
    assert.match(prep, /current\["preparation"\]\["terminals"\] = copy\(current\["terminals"\]\);\s*current\["terminals"\] = \(\{\}\)/);
});

test('Runner只接原命令cost、忙乱调用、原消息与COMBAT直伤，未替换RNG或主动追加攻击', () => {
    const source = read('tools/tests/martial_data/runner.lpc');
    const direct = lpcFunction(source, 'observe_direct');
    const busy = lpcFunction(source, 'observe_hubo_busy');
    const messages = lpcFunction(source, 'observe_lookup_message');
    const perform = lpcFunction(source, 'perform_sample');
    for (const text of [direct, busy, messages]) assert.ok(text.includes('"mingjiao-jiuyang-direct"'));
    for (const key of ['actor', 'target', 'type', 'damage', 'percent', 'weapon_object']) assert.ok(direct.includes('"' + key + '"'));
    assert.match(busy, /!arrayp\(current\["before"\]\) \|\| !intp\(requested\)/);
    assert.match(busy, /require\(previous_object\(\) == me/);
    assert.match(busy, /"requested": requested, "before": serializable\(me->query_busy\(\)\)/);
    assert.match(busy, /call\["after"\] = serializable\(me->query_busy\(\)\)/);
    assert.match(messages, /arrayp\(current\["skill_messages"\]\) && member_array\(me, players\) != -1/);
    assert.match(messages, /"type": type, "text": text/);
    assert.match(perform, /result = players\[0\]->force_me\(action\);\s*current\["command_accepted"\] = result;/);
    const earlyRefusal = body => {
        const matches = [...body.matchAll(/if \(\(is_taohua_ding\(\)[\s\S]*?^ {8}\}/gm)];
        assert.equal(matches.length, 1);
        const addedScope = ' ||\n            is_mingjiao_remaining_perform()';
        assert.equal(matches[0][0].split(addedScope).length, 2, 'one exact additional early-refusal scope');
        assert.equal(matches[0][0].replace(addedScope, '').replace(/\s+/g, ' '),
            'if ((is_taohua_ding() || is_taohua_zhuan() || ' +
            'current["parameters"]["collection_group"] == "s1-duan-perform" || ' +
            'current["parameters"]["collection_group"] == "s1-piaoxu" || ' +
            'current["parameters"]["collection_group"] == "s1-panlong-tan" || ' +
            'current["parameters"]["collection_group"] == "mingjiao-shenghuo" || ' +
            'current["parameters"]["collection_group"] == "mingjiao-ling-perform" || ' +
            'current["parameters"]["collection_group"] == "mingjiao-jiuyang-direct" || ' +
            'current["parameters"]["collection_group"] == "mingjiao-jiuyang-remaining") && ' +
            '!result && !sizeof(current["refusals"])) { ' +
            'reason = players[0]->query_temp("notify_fail"); ' +
            'require(stringp(reason) && reason != "", "actual early DING command refusal"); ' +
            'current["refusals"] += ({ ([ "actor": file_name(players[0]), "reason": reason ]) }); }');
        assert.ok(matches[0].index > body.indexOf('current["command_accepted"] = result;'));
        return matches[0][0];
    };
    const actualEarly = earlyRefusal(perform);
    for (const [before, after] of [
        ['"mingjiao-jiuyang-direct" ||', '"other-group" ||'],
        ['"mingjiao-jiuyang-remaining" ||', '"other-group" ||'],
        ['!result && !sizeof(current["refusals"])', 'result && !sizeof(current["refusals"])'],
        ['!result && !sizeof(current["refusals"])', '!result && sizeof(current["refusals"])'],
        ['reason = players[0]->query_temp("notify_fail");', 'reason = parameters["refusal"];'],
        ['reason = players[0]->query_temp("notify_fail");', 'reason = players[1]->query_temp("notify_fail");'],
    ]) {
        const altered = actualEarly.replace(before, after);
        assert.notEqual(altered, actualEarly);
        assert.throws(() => earlyRefusal(perform.replace(actualEarly, altered)));
    }
    assert.match(perform, /member_array\(parameters\["collection_group"\],\s*\(\{ "mingjiao-jiuyang-direct", "mingjiao-jiuyang-remaining" \}\)\) != -1\)\s*current\["skill_messages"\] = \(\{\}\)/);
    for (const observed of [direct, busy, messages]) assert.doesNotMatch(observed, /->(?:do_attack|do_damage|query_action|hit_ob|start_busy|set_skill)\(/);
    assert.doesNotMatch(source, /\b(?:seed_random|set_random_seed)\s*\(/);
    const actor = read('tools/tests/martial_data/actor.lpc');
    assert.match(actor, /observe_lookup_message\(this_object\(\), type, text\);\s*::receive_message\(type, text\);/);
});
