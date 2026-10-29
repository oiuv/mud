import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { collectionInput, createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import {
    mingjiaoJiuyangExertConditions, mingjiaoJiuyangExertSourcePaths,
    mingjiaoJiuyangExertReviewedSourceHash, mingjiaoJiuyangExertAbsentPaths,
    validateMingjiaoJiuyangExertCondition, validateMingjiaoJiuyangExertRecord,
} from './school_mingjiao_jiuyang_exert_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const group = 'mingjiao-jiuyang-exert', prefix = 'school-mingjiao-exert-jiuyang-';
const clone = value => structuredClone(value);
const total = rows => rows.reduce((sum, row) => sum + row.samples, 0);
const catalog = collectCatalog(root, buildInventory(root));
const conditions = mingjiaoJiuyangExertConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);
const pick = (ability, variant, phase = 'immediate') => {
    const found = conditions.find(c => c.parameters.ability === ability &&
        c.parameters.variant === variant && c.parameters.phase === phase);
    assert.ok(found, `${ability}/${variant}/${phase}`);
    return found;
};
const deny = (condition, edit) => {
    const bad = clone(condition); edit(bad);
    assert.notDeepEqual(bad, condition, 'negative case must change the original condition');
    assert.throws(() => validateMingjiaoJiuyangExertCondition(bad));
    assert.throws(() => validateQualificationSources([bad], snapshot().files));
};
const lpcFunction = (source, name) => {
    const match = source.match(new RegExp(`^[\\w* ]+\\b${name}\\([^;]*?\\)\\s*\\{[\\s\\S]*?^\\}`, 'm'));
    assert.ok(match, `missing LPC definition ${name}`);
    return match[0];
};

test('九阳三运功仅追加61条件，旧17307完整正式与烟雾有序指纹不变', () => {
    for (const smoke of [false, true]) {
        const all = preOctober29SchoolConditions(catalog, { smoke })
            .filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['mingjiao-jiuyang-capacity', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-research', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-jiuyang-fusion', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-perform', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group) && !['mingjiao-remaining-base', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        const tail = mingjiaoJiuyangExertConditions(catalog, read, { smoke });
        assert.equal(all.length, 17368); assert.equal(total(all), smoke ? 29020 : 459854);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        assert.equal(sha256(JSON.stringify(all.slice(0, 17307))), smoke
            ? '578e5440ff061639f453de58568a2245e6e2052084656c070889d6d3cff25cfa'
            : '3d3cdc422968618bd8c58fde1d23176af6328df224a91bc2dcb637b91c1dedbd');
        assert.deepEqual(all.slice(17307, 17307 + tail.length), tail);
        assert.equal(tail.length, 61); assert.equal(total(tail), smoke ? 122 : 1788);
        assert.equal(tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.ability !== 'roar').length, 41);
        assert.equal(tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.ability === 'roar').length, 20);
        assert.equal(tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.phase === 'lifecycle').length, 12);
        const immediatePrefix = tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.id.startsWith(prefix + 'immediate-'));
        assert.equal(immediatePrefix.length, 52); assert.equal(total(immediatePrefix), smoke ? 104 : 1770);
        assert.equal(immediatePrefix.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.phase === 'lifecycle').length, 3);
        assert.equal(tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.id.startsWith(prefix + 'lifecycle-')).length, 9);
        for (const c of tail) {
            assert.equal(c.parameters.collection_group, group); assert.equal(c.method, 'exert');
            validateMingjiaoJiuyangExertCondition(c);
            const p = c.parameters, force = Math.trunc(p.actor.skills.force / 2) + p.actor.skills['jiuyang-shengong'];
            assert.equal(p.observe_seconds, p.phase === 'lifecycle'
                ? (p.ability === 'powerup' ? Math.trunc(force / 2) : force) + 2 : 0);
        }
    }
});

test('137资格源与四真实缺席逐一绑定，命令和exert入口不接受漂移或替身', () => {
    assert.equal(mingjiaoJiuyangExertSourcePaths.length, 137);
    assert.equal(mingjiaoJiuyangExertReviewedSourceHash,
        '2b25e7e41899f6432deef87f3631e3fc9840a02967c933e5b8ef9c714a5d500c');
    assert.deepEqual(mingjiaoJiuyangExertAbsentPaths, [
        'kungfu/skill/force/powerup.c', 'kungfu/skill/force/powerup.lpc',
        'kungfu/skill/force/shield.c', 'kungfu/skill/force/shield.lpc',
    ]);
    const files = snapshot().files, c = pick('roar', 'no-fight');
    validateQualificationSources(conditions, files);
    for (const path of mingjiaoJiuyangExertSourcePaths) {
        assert.equal(files[path], sha256(read(path)), path);
        const missing = { ...files }; delete missing[path];
        assert.throws(() => validateQualificationSources([c], missing), path);
        assert.throws(() => validateQualificationSources([c], { ...files, [path]: '0'.repeat(64) }), path);
    }
    for (const path of mingjiaoJiuyangExertAbsentPaths) {
        assert.equal(files[path], undefined);
        assert.throws(() => validateQualificationSources([c], { ...files, [path]: '0'.repeat(64) }));
        assert.throws(() => mingjiaoJiuyangExertConditions(catalog, p => p === path ? 'int exert() { return 1; }' : read(p)));
    }
    assert.ok(mingjiaoJiuyangExertSourcePaths.includes('kungfu/skill/force/roar.c'));
    for (const path of ['cmds/skill/exert.c', 'inherit/skill/skill.c', 'feature/action.c',
        'kungfu/skill/jiuyang-shengong/exert/powerup.c', 'kungfu/skill/jiuyang-shengong/exert/shield.c',
        'kungfu/skill/jiuyang-shengong/exert/roar.c'])
        assert.throws(() => mingjiaoJiuyangExertConditions(catalog, p => read(p) + (p === path ? '\n// drift\n' : '')));
    for (const edit of [
        x => { x.entry_id = x.entry_id.replace(':7:', ':8:'); },
        x => { x.method = 'perform'; },
        x => { x.parameters.source_entry.function = 'remove_effect'; },
        x => { x.parameters.source_entry.path = 'kungfu/skill/force/roar.c'; },
        x => { x.parameters.source_entry.sha256 = '0'.repeat(64); },
        x => { x.parameters.qualification_sources.pop(); },
        x => { delete x.parameters.source_evidence['cmds/skill/exert.c']; },
        x => { x.parameters.absent_sources = []; },
        x => { x.parameters.action = 'test_interface'; },
        x => { x.parameters.actions = ['exert recover']; },
    ]) deny(c, edit);
});

test('仅固定初态与2或3真实连接，非零apply基线、busy、条件和自然等待不可扩大', () => {
    const c = pick('powerup', '400-breakup0'), p = c.parameters;
    assert.deepEqual(p.actor.temp, { 'apply/attack': 7, 'apply/parry': 11, 'apply/dodge': 13, 'apply/armor': 107 });
    assert.equal(collectionInput([c]).connections, 2);
    assert.equal(collectionInput([pick('roar', 'three-users')]).connections, 3);
    for (const edit of [
        x => { x.parameters.actor.temp['apply/attack'] = 0; },
        x => { x.parameters.actor.temp['apply/parry'] = 12; },
        x => { x.parameters.actor.temp.powerup = 1; },
        x => { x.parameters.actor.temp.no_exert = 1; },
        x => { x.parameters.target.temp = { 'apply/armor': 107 }; },
        x => { x.parameters.actor.equipment = { type: 'sword', hold: false }; },
        x => { x.parameters.actor.properties.breakup = { attack: 1 }; },
        x => { x.parameters.room = { no_fight: 1 }; },
        x => { x.parameters.interface = { function: 'remove_effect' }; },
        x => { x.parameters.extra_target = clone(x.parameters.target); },
        x => { x.parameters.repeat_actions = ['exert powerup']; },
    ]) deny(c, edit);
    deny(pick('roar', 'three-users'), x => { x.parameters.extra_target_fighting = true; });
    deny(pick('roar', 'unconscious'), x => { x.parameters.target_state = 'dead'; });
    for (const ability of ['powerup', 'shield', 'roar']) {
        deny(pick(ability, 'busy1'), x => { x.parameters.actor.busy = 2; });
        deny(pick(ability, 'no-exert'), x => { x.parameters.actor.temp.no_exert = 0; });
        deny(pick(ability, 'exert-drug'), x => { x.parameters.actor.conditions.exert_drug = 2; });
    }
    deny(pick('roar', 'die-guard'), x => { x.parameters.target.conditions.die_guard = 0; });
    for (const c of conditions.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.phase === 'lifecycle')) {
        deny(c, x => { x.parameters.observe_seconds = 1; });
        deny(c, x => { x.parameters.phase = 'immediate'; });
    }
});

test('五新工具冻结真实字节且沿既有15文件48点探针，无新增运功或随机探针', () => {
    const { files, probes: allProbes } = snapshot();
    const fusion = allProbes.filter(p => p.path === 'cmds/skill/yanlian.c');
    assert.equal(fusion.length, 1); assert.equal(fusion[0].sites.length, 17);
    assert.equal(fusion[0].before, 'd434aebcd23144b26e47309526113734f50298d4f53ace0f5ae4f3f9e042e436');
    assert.equal(fusion[0].after, '56876cbe4096940d431bf7b6c93648e048b462b41d832b28ac8f401c567ff5f8');
    const probes = allProbes.filter(p => p.path !== 'cmds/skill/yanlian.c');
    for (const suffix of ['cases.mjs', 'cases.test.mjs', 'integration.test.mjs', 'report.mjs', 'report.test.mjs']) {
        const path = 'tools/tests/martial_data/school_mingjiao_jiuyang_exert_' + suffix;
        assert.equal(files[path], sha256(readFileSync(join(root, path))), path);
    }
    assert.equal(probes.length, 15); assert.equal(probes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(probes)), 'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.ok(!probes.some(p => p.path.startsWith('kungfu/skill/jiuyang-shengong/')));
    for (const probe of probes) {
        const original = read(probe.path);
        assert.equal(sha256(original), probe.before); assert.equal(files[probe.path], probe.before);
        const replacements = probe.sites.map(site => Array.isArray(site) ? [site[0], site[1] + site[0]]
            : Object.hasOwn(site, 'replacement') ? [site.anchor, site.replacement]
                : [site.anchor, site.position === 'before' ? site.insert + site.anchor : site.anchor + site.insert]);
        let instrumented = original;
        for (const [before, after] of replacements) {
            assert.equal(instrumented.split(before).length, 2); instrumented = instrumented.replace(before, after);
        }
        assert.equal(sha256(instrumented), probe.after);
        for (const [before, after] of [...replacements].reverse()) {
            assert.equal(instrumented.split(after).length, 2); instrumented = instrumented.replace(after, before);
        }
        assert.equal(instrumented, original);
    }
});

test('原USER命令逐步保成本和最终notify_fail，第三角色与准备昏迷不串入测量', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const run = lpcFunction(runner, 'perform_jiuyang_exert_steps');
    assert.match(run, /current\["method"\] == "exert" && arrayp\(parameters\["actions"\]\)/);
    assert.match(run, /foreach \(action in parameters\["actions"\]\)/);
    assert.match(run, /result = players\[0\]->force_me\(action\);\s*step\["accepted"\] = result;/);
    assert.match(run, /current\["command_accepted"\] \+= result;/);
    assert.match(run, /if \(!result\) \{\s*reason = players\[0\]->query_temp\("notify_fail"\);\s*require\(stringp\(reason\) && reason != ""/);
    for (const key of ['before', 'after', 'extra_before', 'extra_after', 'launch_start', 'launch_end', 'refusal_start', 'refusal_end'])
        assert.ok(run.includes('"' + key + '"'), key);
    assert.doesNotMatch(run, /->(?:exert_function|exert|receive_damage|receive_wound|start_busy|improve_skill|kill_ob|fight_ob)\(/);
    const perform = lpcFunction(runner, 'perform_sample');
    const remainingBystander = 'if ((parameters["collection_group"] == "mingjiao-jiuyang-exert" ||\n'
        + '        is_mingjiao_remaining_perform()) && sizeof(players) == 3 &&';
    assert.equal(perform.split(remainingBystander).length, 2, 'one exact additional third-USER cleanup scope');
    assert.match(perform.replace(remainingBystander,
        'if (parameters["collection_group"] == "mingjiao-jiuyang-exert" && sizeof(players) == 3 &&'),
    /"mingjiao-jiuyang-exert"[^\n]*sizeof\(players\) == 3 &&\s*!mapp\(parameters\["extra_target"\]\)\)\s*require\(players\[2\]->move\("\/tests\/bystander_room"\)/);
    assert.match(perform, /prepare_actor\(2, parameters\["extra_target"\]\)/);
    assert.match(perform, /"mingjiao-jiuyang-exert" && mapp\(parameters\["extra_target"\]\)\)\s*players\[2\]->start_observation\(2\)/);
    assert.match(perform, /"mingjiao-jiuyang-exert"\) \{\s*perform_jiuyang_exert_steps\(parameters\);\s*return;/);
    assert.ok(perform.indexOf('players[1]->unconcious();') < perform.indexOf('current["before"] ='));
    assert.match(perform, /"mingjiao-jiuyang-exert"[\s\S]*?current\["preparation"\]\["terminals"\] = copy\(current\["terminals"\]\);\s*current\["terminals"\] = \(\{\}\)/);
    assert.match(perform, /current\["relation_context"\] = \(\[ "before": jiuyang_exert_relations\(\) \]\)/);
    const relations = lpcFunction(runner, 'jiuyang_exert_relations');
    assert.match(relations, /mapp\(current\["parameters"\]\["extra_target"\]\) \? 3 : 2/);
    for (const method of ['query_enemy', 'query_want', 'query_killer', 'is_fighting', 'is_want_kill', 'is_killing'])
        assert.ok(relations.includes('->' + method + '('), method);
    assert.doesNotMatch(relations, /->(?:kill_ob|want_kill|fight_ob|remove_enemy|remove_killer)\(/);
    const final = lpcFunction(runner, 'finish_sample');
    assert.ok(final.indexOf('current["extra_target_metrics"]') < final.indexOf('ob->stop_observation()'));
});

test('强化前后只读字段及原自然解除时钟均保留，不直调效果或重抽随机', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const state = lpcFunction(runner, 'snapshot'), callbacks = lpcFunction(runner, 'observe_callback');
    const prepare = lpcFunction(runner, 'prepare_actor'), advance = lpcFunction(runner, 'advance');
    for (const key of ['hostility', 'last_damage_from', 'no_exert', 'die_guard', 'not_living', 'effective_int',
        'effective_dex', 'breakup', 'family/family_name', 'character', 'temp', 'conditions', 'learned', 'effective_skills'])
        assert.ok(state.includes('"' + key + '"'), key);
    assert.match(state, /result\["temp"\] = serializable\(ob->query_entire_temp_dbase\(\)\)/);
    for (const [key, value] of [['attack', 7], ['parry', 11], ['dodge', 13], ['armor', 107]])
        assert.ok(prepare.includes(`key == "apply/${key}" && value == ${value}`));
    assert.match(prepare, /"mingjiao-jiuyang-exert" &&\s*intp\(value\) && value == 1 && \(\(!side && key == "exert_drug"\) \|\|\s*\(side && key == "die_guard"\)\)/);
    assert.match(callbacks, /"mingjiao-jiuyang-exert"\) \{\s*owner = previous_object\(\);\s*frames = call_stack\(2\);/);
    assert.match(callbacks, /require\(side == 0 && owner == me && base_name\(me\) == "\/tests\/actor" &&\s*sizeof\(frames\) > 1 && frames\[1\] == "eval_function"/);
    assert.match(callbacks, /\["owner"\] = file_name\(owner\);\s*current\[key\]\[<1\]\["function"\] = frames\[1\]/);
    assert.match(read('tools/tests/martial_data/actor.lpc'), /observe_callback\(this_object\(\), "before"\);\s*::eval_function\(fun\);\s*"\/tests\/runner"->observe_callback\(this_object\(\), "after"\)/);
    assert.match(advance, /delay = current\["parameters"\]\["observe_seconds"\];/);
    assert.match(advance, /if \(delay > 0 && current\["outcome"\] == "observed"\) call_out\("finish_sample", delay\)/);
    assert.match(read('feature/action.c'), /call_out\("eval_function", delay, bind\(fun, this_object\(\)\)\)/);
    assert.match(read('kungfu/skill/jiuyang-shengong/exert/powerup.c'), /"remove_effect", me, skill :\), skill \/ 2\)/);
    assert.match(read('kungfu/skill/jiuyang-shengong/exert/shield.c'), /"remove_effect", me, skill \/ 2 :\), skill\)/);
    for (const source of [state, callbacks, lpcFunction(runner, 'observe_lookup_message')])
        assert.doesNotMatch(source, /->(?:exert|remove_effect|start_call_out|receive_damage|receive_wound|set_skill|start_busy)\(|\brandom\(/);
    assert.doesNotMatch(runner, /\b(?:seed_random|set_random_seed)\s*\(/);
});

test('诊断保留三层真实consumer身份，专用报表接收原condition而非通用伤害行', () => {
    const c = pick('powerup', '400-breakup0');
    const raw = { kind: 'sample', condition_id: c.id, method: 'exert', outcome: 'error',
        index: 0, elapsed: 0, reason: 'synthetic diagnostic; no game success claimed' };
    validateRecord(raw, c); validateSchoolCombatRecord(raw, c); validateMingjiaoJiuyangExertRecord(raw, c);
    for (const edit of [
        x => { x.condition_id = 'other'; }, x => { x.method = 'perform'; },
        x => { delete x.index; }, x => { x.index = -1; }, x => { x.index = c.samples; },
        x => { x.elapsed = null; }, x => { x.elapsed = -1; },
        x => { x.reason = ''; }, x => { delete x.reason; },
    ]) {
        const bad = clone(raw); edit(bad);
        assert.throws(() => validateSchoolCombatRecord(bad, c));
        assert.throws(() => validateMingjiaoJiuyangExertRecord(bad, c));
    }
    const registry = read('tools/tests/martial_data/school_combat_cases.mjs');
    assert.match(registry, /collection_group === 'mingjiao-jiuyang-exert'\) return validateMingjiaoJiuyangExertRecord\(raw, condition\)/);
    const shared = read('tools/tests/martial_data/school_combat_report.mjs');
    assert.match(shared, /mingjiaoJiuyangExertReport/);
    assert.match(shared, /mingjiaoJiuyangExertMarkdown/);
    assert.match(shared, /!c\.mingjiao_jiuyang_exert/);
});
