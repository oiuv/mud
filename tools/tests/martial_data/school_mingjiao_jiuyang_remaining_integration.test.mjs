// Finite wiring gates only; source/synthetic checks are not native USER evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { collectionInput, createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import {
    mingjiaoJiuyangRemainingConditions, mingjiaoJiuyangRemainingSourcePaths,
    mingjiaoJiuyangRemainingReviewedSourceHash, mingjiaoJiuyangRemainingAbsentPaths,
    validateMingjiaoJiuyangRemainingCondition,
} from './school_mingjiao_jiuyang_remaining_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const group = 'mingjiao-jiuyang-remaining', prefix = 'school-mingjiao-remaining-jiuyang-';
const clone = value => structuredClone(value);
const total = rows => rows.reduce((sum, row) => sum + row.samples, 0);
const catalog = collectCatalog(root, buildInventory(root));
const conditions = mingjiaoJiuyangRemainingConditions(catalog, read);
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
    assert.throws(() => validateMingjiaoJiuyangRemainingCondition(altered));
    assert.throws(() => validateQualificationSources([altered], snapshot().files));
};
const lpcFunction = (source, name) => {
    const match = source.match(new RegExp(`^[\\w* ]+\\b${name}\\([^;]*?\\)\\s*\\{[\\s\\S]*?^\\}`, 'm'));
    assert.ok(match, `missing LPC function ${name}`);
    return match[0];
};

test('九阳余招只尾追加53条件，V4完整17254正式和烟雾有序指纹不变', () => {
    const formal = schoolCombatConditions(catalog).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-jiuyang-exert', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-capacity', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-research', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-fusion', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    const smoke = schoolCombatConditions(catalog, { smoke: true }).filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-jiuyang-exert', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-capacity', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-research', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-fusion', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    const smokeTail = mingjiaoJiuyangRemainingConditions(catalog, read, { smoke: true });
    assert.deepEqual(formal.slice(17254), conditions);
    assert.deepEqual(smoke.slice(17254), smokeTail);
    assert.equal(formal.length, 17307); assert.equal(total(formal), 458066);
    assert.equal(smoke.length, 17307); assert.equal(total(smoke), 28898);
    assert.equal(sha256(JSON.stringify(formal.slice(0, 17254))),
        'f091ab766028e63e8f528d4a32bb1e279ef4338bb15c8a38e0b92d75d920a084');
    assert.equal(sha256(JSON.stringify(smoke.slice(0, 17254))),
        '052bf0dcac84c5e4143f100a2b70d4fe3b0d4adeb080e7302e4ab9de9a647480');
    assert.equal(conditions.length, 53); assert.equal(total(conditions), 2556);
    assert.equal(smokeTail.length, 53); assert.equal(total(smokeTail), 106);
    assert.deepEqual(['jiu', 'ri'].map(a => conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.ability === a).length), [25, 28]);
    assert.equal(conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.random_effects).length, 25);
    assert.equal(new Set(conditions.map(c => c.id)).size, 53);
    for (const c of [...conditions, ...smokeTail]) {
        assert.ok(c.id.startsWith(prefix)); assert.equal(c.parameters.collection_group, group);
        assert.equal(c.method, 'perform'); assert.equal(validateMingjiaoJiuyangRemainingCondition(c), c.parameters);
    }
});

test('132资格源与四个基础入口缺席由实际原字节约束，假entry及来源漂移不能准入', () => {
    const files = snapshot().files, base = pick('jiu', '400');
    assert.equal(mingjiaoJiuyangRemainingSourcePaths.length, 132);
    assert.equal(new Set(mingjiaoJiuyangRemainingSourcePaths).size, 132);
    assert.equal(mingjiaoJiuyangRemainingReviewedSourceHash,
        'a5a433c4036c9b4fdf10b9d6f9e9e36a304bc06eb8381669d479db402a0c1ee2');
    assert.deepEqual(mingjiaoJiuyangRemainingAbsentPaths, [
        'kungfu/skill/unarmed/jiu.c', 'kungfu/skill/unarmed/jiu.lpc',
        'kungfu/skill/unarmed/ri.c', 'kungfu/skill/unarmed/ri.lpc',
    ]);
    assert.doesNotThrow(() => validateQualificationSources(conditions, files));
    for (const path of mingjiaoJiuyangRemainingSourcePaths) {
        assert.equal(files[path], sha256(readFileSync(join(root, path))));
        const missing = { ...files }; delete missing[path];
        assert.throws(() => validateQualificationSources([base], missing), undefined, path);
        assert.throws(() => validateQualificationSources([base], { ...files, [path]: '0'.repeat(64) }), undefined, path);
    }
    for (const path of mingjiaoJiuyangRemainingAbsentPaths)
        assert.throws(() => validateQualificationSources([base], { ...files, [path]: '1'.repeat(64) }));
    for (const edit of [
        c => { c.entry_id += '-other'; },
        c => { c.parameters.source_entry.path = 'kungfu/skill/unarmed/jiu.c'; },
        c => { c.parameters.source_entry.sha256 = '0'.repeat(64); },
        c => { delete c.parameters.source_evidence['cmds/skill/perform.c']; },
        c => { c.parameters.qualification_sources.reverse(); },
        c => { c.parameters.qualification_evidence.pop(); },
        c => { c.parameters.absent_sources.pop(); },
    ]) deny(base, edit);
    assert.throws(() => mingjiaoJiuyangRemainingConditions(catalog,
        path => read(path) + (path === 'kungfu/skill/jiuyang-shengong/perform/jiu.c' ? '\n' : '')));
    assert.throws(() => mingjiaoJiuyangRemainingConditions(catalog,
        path => path === mingjiaoJiuyangRemainingAbsentPaths[0] ? 'int perform(){return 1;}\n' : read(path)));
});

test('执行准入限定原命令和固定角色配置，不任意扩展装备、第三靶、许可或时钟', () => {
    const base = pick('jiu', '400');
    for (const edit of [
        c => { c.parameters.action = 'eval return 1'; },
        c => { c.method = 'interface'; },
        c => { c.parameters.ability = 'hun'; },
        c => { c.parameters.observe_seconds = 1; },
        c => { c.parameters.target_state = 'dead'; },
        c => { c.parameters.actor.busy = 1; },
        c => { c.parameters.actor.temp = { no_perform: 1 }; },
        c => { c.parameters.actor.properties['can_perform/jiuyang-shengong/ri'] = 1; },
        c => { c.parameters.actor.properties.reborn = { times: 1 }; },
        c => { c.parameters.actor.properties['can_learn/jiuyang-shengong/enable_weapon'] = 0; },
        c => { c.parameters.capture_skill_loads = true; },
        c => { c.parameters.extra_target_fighting = true; },
        c => { c.parameters.unknown = 1; },
    ]) deny(base, edit);
    for (const value of [1, -1, 23, null, '0'])
        deny(base, c => { c.parameters.actor.temp['apply/attack'] = value; });
    deny(base, c => { c.parameters.actor.temp = { 'apply/parry': 0 }; });
    deny(base, c => { c.parameters.actor.temp['apply/damage'] = 0; });
    deny(base, c => { c.parameters.target.temp = { 'apply/attack': 0 }; });
    for (const c of conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.actor.equipment)) {
        for (const edit of [
            x => { x.parameters.actor.equipment.program = '/tests/sword'; },
            x => { x.parameters.actor.equipment.hold = true; },
            x => { x.parameters.actor.equipment.weight = 6000; },
        ]) deny(c, edit);
    }
    for (const c of conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.extra_target)) {
        deny(c, x => { delete x.parameters.extra_target; });
        deny(c, x => { x.parameters.extra_target_fighting = !x.parameters.extra_target_fighting; });
        deny(c, x => { x.parameters.extra_target.properties.neili += 1; });
    }
});

test('五个新工具按实际文件冻结，既有15文件48探针可逆且无九阳技能新探针', () => {
    const { files, probes: allProbes } = snapshot();
    const fusion = allProbes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = allProbes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'integration.test.mjs', 'report.mjs', 'report.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_remaining_' + suffix;
        assert.equal(files[path], sha256(readFileSync(join(root, path))), path);
    }
    assert.equal(probes.length, 15); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(probes)), 'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.ok(!probes.some(p => p.path.startsWith('kungfu/skill/jiuyang-shengong/')));
    for (const probe of probes) {
        const original = read(probe.path);
        assert.equal(sha256(original), probe.before, probe.path);
        assert.equal(files[probe.path], probe.before, probe.path);
        const replacements = probe.sites.map(site => {
            if (Array.isArray(site)) return [site[0], site[1] + site[0]];
            if (Object.hasOwn(site, 'replacement')) return [site.anchor, site.replacement];
            return [site.anchor, site.position === 'before' ? site.insert + site.anchor : site.anchor + site.insert];
        });
        let instrumented = original;
        for (const [before, after] of replacements) {
            assert.equal(instrumented.split(before).length, 2, probe.path + ' original anchor');
            instrumented = instrumented.replace(before, after);
        }
        assert.equal(sha256(instrumented), probe.after, probe.path + ' generated probe');
        for (const [before, after] of [...replacements].reverse()) {
            assert.equal(instrumented.split(after).length, 2, probe.path + ' inverse anchor');
            instrumented = instrumented.replace(after, before);
        }
        assert.equal(instrumented, original, probe.path + ' inverse original bytes');
    }
});

test('公共Record识别本组原钢剑，不能以测试剑或hand冒充原主手拒绝配置', () => {
    // Only the shared envelope here; own cases.test covers complete normal records for all 53 cases.
    const armed = conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.actor.equipment);
    assert.ok(armed.length > 0);
    for (const c of armed) {
        const equipment = c.parameters.actor.equipment;
        assert.equal(equipment.program, '/clone/weapon/gangjian');
        const before = [0, 1].map(side => ({ userp: 1, interactive: 1, playerp: 1, wizardp: 0,
            object: `/tests/actor#${side + 1}`, qi: 100, eff_qi: 100, jing: 100, eff_jing: 100, neili: 100 }));
        Object.assign(before[0], { weapon_flag: 4, weapon_damage: 25,
            weapon_details: { program: equipment.program, weight: 6000, flag: 4, damage: 25 } });
        const raw = { kind: 'sample', condition_id: c.id, method: c.method, outcome: 'refused',
            before, after: clone(before), metrics: [{}, {}], launches: [], elapsed: 0, command_accepted: 0 };
        assert.doesNotThrow(() => validateRecord(raw, c));
        const wrong = clone(raw); wrong.before[0].weapon_details.program = '/tests/sword';
        assert.throws(() => validateRecord(wrong, c));
        const held = clone(c); held.parameters.actor.equipment.hold = true;
        assert.throws(() => validateRecord(raw, held));
    }
});

test('第三USER复用原连接与别名，仅明示敌人参战，前后对象和昏迷准备独立记账', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const prepare = lpcFunction(runner, 'prepare_actor'), perform = lpcFunction(runner, 'perform_sample');
    const finish = lpcFunction(runner, 'finish_sample'), state = lpcFunction(runner, 'snapshot');
    const project = (body, added, original) => {
        assert.equal(body.split(added).length, 2, 'one exact remaining-perform-only addition');
        return body.replace(added, original);
    };
    const extra = conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !c.parameters?.collection_group?.startsWith('b30-') && c.parameters.extra_target);
    assert.equal(extra.length, 3);
    assert.deepEqual(extra.map(c => [c.parameters.variant, c.parameters.extra_target_fighting]), [
        ['two-enemies', true], ['mixed-enemies', true], ['nonenemy-bystander', false],
    ]);
    for (const c of extra) {
        const request = collectionInput([c]);
        assert.equal(request.connections, 3);
        assert.equal(JSON.parse(request.text).connections, 3);
        assert.deepEqual(JSON.parse(request.text).jobs, [c]);
    }
    assert.equal(collectionInput([pick('jiu', '400')]).connections, 2);
    assert.match(prepare, /require\(efun::exec\(ob, old\), "transfer connection"\)/);
    assert.match(prepare, /ob->set_name\(side == 2 \? "旁试弟子"[\s\S]*?side == 2 \? "third" : side \? "right" : "left"/);
    assert.match(prepare, /"mingjiao-jiuyang-remaining"[\s\S]*?present\(side == 2 \? "third" : side \? "right" : "left", this_object\(\)\) == ob/);
    assert.match(prepare, /"mingjiao-jiuyang-remaining"[\s\S]*?weapon = new\(config\["equipment"\]\["program"\]\)/);
    assert.match(prepare, /"mingjiao-jiuyang-remaining"[\s\S]*?config\["secondary_equipment"\]\["program"\] == "\/clone\/weapon\/dagger"/);
    assert.match(prepare, /item->move\(ob\) && item->wield\(\) && ob->query_temp\("weapon"\) == weapon &&\s+ob->query_temp\("secondary_weapon"\) == item && item != weapon/);
    const exertTempPrefix = `(current["parameters"]["collection_group"] == "mingjiao-jiuyang-exert" &&
            ((!side && ((key == "apply/attack" && value == 7) ||
                (key == "apply/parry" && value == 11) || (key == "apply/dodge" && value == 13) ||
                (key == "apply/armor" && value == 107) ||
                (key == "no_exert" && value == 1))) ||
                (side && key == "die_guard" && value == 1))) ||
            `;
    const remainingTempPrefix = '(is_mingjiao_remaining_perform() && !side && '
        + 'current["parameters"]["variant"] == "no-perform" && key == "no_perform" && value == 1) || ';
    const baseTempPrefix = '(is_mingjiao_remaining_base() && side == 1 && key == "nopoison" && value == 1) || ';
    const forceTempPrefix = '(is_mingjiao_force_remaining() && !side && '
        + 'current["parameters"]["panel"] == "expiry" && '
        + '((key == "apply/attack" && value == 7) || (key == "apply/dodge" && value == 11) || '
        + '(key == "apply/parry" && value == 13) || (key == "apply/armor" && value == 107))) || ';
    const normalizedPrepare = prepare.replace(/\s+/g, ' ');
    assert.equal(normalizedPrepare.split(baseTempPrefix).length, 2, 'one exact remaining-base-only target nopoison guard');
    const legacyPrepare = project(normalizedPrepare, forceTempPrefix, '');
    const oldPrepare = project(legacyPrepare.replace(baseTempPrefix, ''), remainingTempPrefix, '');
    const exertTempNormalized = exertTempPrefix.replace(/\s+/g, ' ');
    assert.equal(oldPrepare.split(exertTempNormalized).length, 2, 'only the exact added exert temp guard');
    assert.match(oldPrepare.replace(exertTempNormalized, ''), /current\["parameters"\]\["collection_group"\] == "mingjiao-jiuyang-remaining" &&\s+key == "apply\/attack" && value == 0/);
    const oldThirdScope = project(perform,
        '"mingjiao-jiuyang-exert"\n                , "mingjiao-remaining-perform"\n                , "b30-perform"\n            })) != -1 && sizeof(players) == 3',
        '"mingjiao-jiuyang-exert"\n            })) != -1 && sizeof(players) == 3');
    assert.match(oldThirdScope, /"mingjiao-jiuyang-remaining"\s*,\s*"mingjiao-jiuyang-exert"\s*\}\)\) != -1 && sizeof\(players\) == 3/);
    assert.match(perform, /prepare_actor\(2, parameters\["extra_target"\]\)/);
    const oldFighting = project(perform,
        '((parameters["collection_group"] == "mingjiao-jiuyang-remaining" ||\n'
            + '            is_mingjiao_remaining_perform()) &&',
        '(parameters["collection_group"] == "mingjiao-jiuyang-remaining" &&');
    assert.match(oldFighting, /parameters\["collection_group"\] == "mingjiao-jiuyang-remaining" &&\s+parameters\["extra_target_fighting"\]\)\) \{\s+players\[0\]->kill_ob\(players\[2\]\);\s+players\[2\]->kill_ob\(players\[0\]\);/);
    const oldBefore = project(perform, '    if (is_mingjiao_remaining_perform()) {\n'
        + '        current["skill_messages"] = ({});\n'
        + '        current["enemy_context"] = ([ "before": map(players[0]->query_enemy(),\n'
        + '            (: member_array($1, players) :)) ]);\n'
        + '        observe_remaining_perform_flower("before");\n    }\n', '');
    const before = oldBefore.indexOf('current["enemy_context"] = ([ "before": map(players[0]->query_enemy(),');
    assert.ok(before > perform.indexOf('players[0]->kill_ob(players[1]);'));
    assert.match(oldBefore.slice(before), /member_array\(\$1, players\)[\s\S]*?current\["extra_target_before"\] = snapshot\(players\[2\]\);\s+players\[2\]->start_observation\(2\);/);
    assert.match(finish, /current\["extra_target_after"\] = snapshot\(players\[2\]\);\s+current\["extra_target_metrics"\] = players\[2\]->query_observation\(\)/);
    const oldFinish = project(finish,
        'if ((current["parameters"]["collection_group"] == "mingjiao-jiuyang-remaining" ||\n'
            + '        is_mingjiao_remaining_perform()) && mapp(current["enemy_context"]))',
        'if (current["parameters"]["collection_group"] == "mingjiao-jiuyang-remaining")');
    assert.match(oldFinish, /"mingjiao-jiuyang-remaining"\)\s+current\["enemy_context"\]\["after"\] = map\(players\[0\]->query_enemy\(\),\s+\(: member_array\(\$1, players\) :\)\)/);
    assert.ok(finish.indexOf('current["extra_target_metrics"]') < finish.indexOf('ob->stop_observation()'));
    for (const key of ['effective_int', 'effective_dex', 'craze', 'max_craze', 'no_perform',
        'secondary_weapon', 'secondary_weapon_details', 'fighting_opponent', 'killing_opponent'])
        assert.ok(state.includes(`result["${key}"]`), key);
    for (const ability of ['hun', 'po', 'pi', 'jiu', 'ri'])
        assert.ok(state.includes(`"can_perform/jiuyang-shengong/${ability}"`), ability);
    assert.match(state, /result\["cultivation"\]\[key\] = ob->query\(key\)/);
    assert.match(perform, /players\[1\]->unconcious\(\);[\s\S]*?"mingjiao-jiuyang-remaining"[\s\S]*?current\["preparation"\]\["terminals"\] = copy\(current\["terminals"\]\);\s+current\["terminals"\] = \(\{\}\);/);
});

test('原九击前后和附伤序号只读，RI消息与三侧busy不伪造命中，早拒绝读取真实notify_fail', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const selected = lpcFunction(runner, 'observe_selected_action'), attack = lpcFunction(runner, 'observe_attack');
    const passive = lpcFunction(runner, 'observe_passive'), dodge = lpcFunction(runner, 'observe_dodge');
    const busy = lpcFunction(runner, 'observe_hubo_busy'), messages = lpcFunction(runner, 'observe_lookup_message');
    const perform = lpcFunction(runner, 'perform_sample');
    assert.match(selected, /"mingjiao-jiuyang-remaining"[\s\S]*?me == players\[0\] && target == players\[1\][\s\S]*?\["ability"\] == "jiu"/);
    assert.match(selected, /"attack_id": sizeof\(current\["actions"\]\) \+ 1,[\s\S]*?"action": serializable\(action\), "before": \(\{ snapshot\(me\), snapshot\(target\) \}\)/);
    assert.match(attack, /"mingjiao-jiuyang-remaining"[\s\S]*?\["ability"\] == "jiu" && sizeof\(current\["actions"\]\)[\s\S]*?value\["attack_id"\] = sizeof\(current\["actions"\]\);\s+value\["after"\] = \(\{ snapshot\(me\), snapshot\(target\) \}\)/);
    assert.match(passive, /"mingjiao-jiuyang-remaining"\)\s+current\["passives"\]\[<1\]\["attack_id"\] = sizeof\(current\["actions"\]\)/);
    assert.match(dodge, /"mingjiao-jiuyang-remaining"\)\s+current\["dodge_checks"\]\[<1\]\["attack_id"\] = sizeof\(current\["actions"\]\)/);
    assert.match(busy, /"mingjiao-jiuyang-remaining"[\s\S]*?side = member_array\(me, players\)/);
    assert.match(busy, /require\(previous_object\(\) == me, "original actor busy observation"\)/);
    assert.match(busy, /"requested": requested, "before": serializable\(me->query_busy\(\)\)/);
    assert.match(busy, /call\["after"\] = serializable\(me->query_busy\(\)\)/);
    assert.match(messages, /"mingjiao-jiuyang-remaining"[\s\S]*?member_array\(me, players\) != -1[\s\S]*?"side": member_array\(me, players\),\s+"type": type, "text": text/);
    for (const body of [selected, attack, passive, dodge, busy, messages])
        assert.doesNotMatch(body, /\b(?:random|set_skill|force_me|do_attack|do_damage|start_busy|receive_damage|receive_wound)\s*\(/);
    assert.match(perform, /result = players\[0\]->force_me\(action\);\s+current\["command_accepted"\] = result;/);
    const early = perform.match(/if \(\(is_taohua_ding\(\)[\s\S]*?\n        \}/)?.[0];
    assert.ok(early, 'original early-refusal block');
    const remainingEarly = ' ||\n            is_mingjiao_remaining_perform()';
    assert.equal(early.split(remainingEarly).length, 2, 'one exact remaining-perform early-refusal scope');
    assert.match(early.replace(remainingEarly, ''), /\["collection_group"\] == "mingjiao-jiuyang-remaining"\) &&\s+!result && !sizeof\(current\["refusals"\]\)/);
    assert.match(early, /reason = players\[0\]->query_temp\("notify_fail"\);/);
    assert.match(early, /require\(stringp\(reason\) && reason != "", "actual early DING command refusal"\)/);
    assert.match(early, /current\["refusals"\] \+= \(\{ \(\[ "actor": file_name\(players\[0\]\), "reason": reason \]\) \}\)/);
    assert.doesNotMatch(early, /parameters.*refusal|reason\s*=\s*"/);
});
