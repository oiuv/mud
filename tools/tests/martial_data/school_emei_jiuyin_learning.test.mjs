import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';
import { emeiJiuyinLearningConditions, jiuyinLearningGroup, clawSkill, whiteClawGains, jiuyinLearningEffects } from './school_emei_jiuyin_learning_cases.mjs';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = emeiJiuyinLearningConditions(catalog);
const pick = suffix => { const c = cases.find(c => c.id === 'school-emei-jiuyin-learning-' + suffix); assert.ok(c, suffix); return c; };
// Synthetic records only test validators; they are never imported as real evidence.
function record(c) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        neili: 10000, max_neili: 10000, jingli: null, ...cfg.properties,
        weapon: cfg.equipment?.type ?? 'none', skills: structuredClone(cfg.skills),
        mappings: structuredClone(cfg.mappings), learned: {},
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        interfaces: [], launches: [], attacks: [], reason: '原提示',
        practice_room: { no_fight: p.room.no_fight ?? 0, sleep_room: p.room.sleep_room ?? 0 },
        practice_materials_before: p.materials.map((m, i) => ({ object: 'original#' + i,
            program: '/clone/misc/' + m.kind, location: m.carried ? 'actor' : 'room',
            used: Number(!!m.used), cut: Number(!!m.cut), long: '原材料正文\n' })),
    };
    const n = p.completed, a = r.immediate[0];
    a.qi -= n * 80; a.neili -= n * (p.skill === clawSkill ? p.level : 120);
    const gain = n * ((p.skill === clawSkill ? whiteClawGains(p.level)[0] : 0)
        + (c.method === 'practice' ? practiceGain(p.level, before[0].skills[p.usage], before[0].int) : 0));
    if (gain) a.learned[p.skill] = gain;
    if (c.method === 'practice') r.command_accepted = Number(n > 0 && n === p.repetitions);
    else r.interfaces.push({ ...p.interface, result: Number(p.expected === 'observed') });
    r.practice_materials_after = structuredClone(r.practice_materials_before);
    let remaining = p.skill === clawSkill ? n : 0;
    for (const m of r.practice_materials_after) if (remaining && !m.used && !m.cut && m.location === 'room') {
        remaining--; m.used = 1;
        if (m.program.endsWith('/head')) m.long += '上面赫然有五个小洞，伸手一探，刚好可以插入。\n';
    }
    return r;
}

test('追加独立条件，不改变旧11334条件的内容及样本计划', () => {
    const all = schoolCombatConditions(catalog);
    const historical = all.filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin', 'emei'].includes(c.parameters.school));
    const old = historical.filter(c => ![jiuyinLearningGroup, 'emei-jiuyin-passive', 'emei-npc', 'emei-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 11334); assert.equal(old.reduce((n, c) => n + c.samples, 0), 282812);
    assert.equal(createHash('sha256').update(JSON.stringify(old)).digest('hex'), '2a097823c67c52bd34909caa4cfafc4dadecdc7a9eb750bfb2f49c82282d10c2');
    assert.deepEqual(all.filter(c => c.parameters.collection_group === jiuyinLearningGroup), cases);
    assert.equal(new Set(all.map(c => c.id)).size, all.length); validateSchoolCombatPlan(cases, catalog);
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    assert.throws(() => emeiJiuyinLearningConditions({ skills: [] }));
    assert.throws(() => emeiJiuyinLearningConditions(catalog, { samples: 0 }));
});

test('全部合成边界经过同一校验，随机烟雾和正式100次不混用', () => {
    const smoke = emeiJiuyinLearningConditions(catalog, { smoke: true });
    assert.equal(smoke.length, cases.length);
    for (let i = 0; i < cases.length; i++) {
        validateSchoolCombatRecord(record(cases[i]), cases[i]);
        assert.equal(smoke[i].samples, cases[i].samples === 100 ? 2 : 1);
    }
});

test('白骨爪500内力门槛与按等级扣费保留，负值不钳制', () => {
    for (const [level, final] of [[499, 1], [500, 0], [501, -1], [800, -300]]) {
        const c = pick(clawSkill + '-practice-l' + level + '-neili500'), r = record(c);
        assert.equal(r.immediate[0].neili, final); validateSchoolCombatRecord(r, c);
        assert.equal(jiuyinLearningEffects([{ raw: r }]).negative_neili, Number(final < 0));
    }
});

test('原材料消耗资格与部分练习保留，不把命令返回0视作无进度', () => {
    const c = pick(clawSkill + '-practice-l200-one-head-times3'), r = record(c);
    assert.equal(c.parameters.completed, 1); assert.equal(r.command_accepted, 0);
    assert.equal(r.outcome, 'observed'); assert.equal(r.practice_materials_after[0].used, 1);
    for (const suffix of ['no-material', 'cut-corpse', 'used-head', 'used-corpse', 'carried-head'])
        assert.equal(pick(clawSkill + '-practice-l200-' + suffix).parameters.expected, 'refused');
    assert.equal(pick(clawSkill + '-practice-l200-three-heads').parameters.completed, 3);
});

test('学习与练习接口不混同，催心须两类基本功，银龙检查实际持鞭', () => {
    assert.equal(pick('cuixin-zhang-valid_learn-l200-unarmed199').parameters.expected, 'refused');
    assert.equal(pick('cuixin-zhang-valid_learn-l200-strike199').parameters.expected, 'refused');
    assert.equal(pick('cuixin-zhang-practice_skill-l200-weapon-sword').parameters.expected, 'observed');
    assert.equal(pick('cuixin-zhang-practice-l200-weapon-sword').parameters.expected, 'refused');
    for (const ability of ['valid_learn', 'practice', 'practice_skill'])
        assert.equal(pick('yinlong-bian-' + ability + '-l200-weapon-none').parameters.expected, 'refused');
});

test('丢失材料、虚构增益、复用标记或更改原费用必须拒绝', () => {
    const c = pick(clawSkill + '-practice-l200');
    for (const mutate of [r => delete r.practice_materials_after,
        r => r.practice_materials_after[0].used = 0, r => r.practice_materials_after[0].object = 'other',
        r => r.immediate[0].neili++, r => r.immediate[0].learned[clawSkill]++,
        r => r.before[0].wizardp = 1, r => r.outcome = 'refused']) {
        const r = record(c); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const blocked = pick(clawSkill + '-practice-l200-used-head'), r = record(blocked);
    r.practice_materials_after[0].used = 0; assert.throws(() => validateSchoolCombatRecord(r, blocked));
});
