// Unregistered preparation only. Real commands, natural NPC bouts and statistics remain separate.
import assert from 'node:assert/strict';
import { scanSource, sha256 } from './inventory.mjs';
import { mingjiaoRemainingBaseSourcePaths } from './school_mingjiao_remaining_base_cases.mjs';

export const mingjiaoCombinationGroup = 'mingjiao-combination';
export const mingjiaoNpcBoutGroup = 'mingjiao-npc-bout';
const copy = value => structuredClone(value);
const skillPath = skill => `kungfu/skill/${skill}.c`;
const npcs = ['daijisi', 'fanyao', 'lengqian', 'weiyixiao', 'xiaozhao', 'xiexun',
    'yangxiao', 'yintianzheng', 'zhangwuji'];
export const mingjiaoCombinationSkills = Object.freeze({
    'yinfeng-dao': 'strike', 'tougu-zhen': 'finger', 'nianhua-zhi': 'finger',
    'sanhua-zhang': 'strike', 'pili-quan': 'cuff', 'feihua-zhang': 'strike',
});
const pairs = [['yinfeng-dao', 'tougu-zhen'], ['nianhua-zhi', 'sanhua-zhang'],
    ['pili-quan', 'feihua-zhang']];
const combineLines = { 'yinfeng-dao': 58, 'tougu-zhen': 59, 'nianhua-zhi': 105,
    'sanhua-zhang': 46, 'pili-quan': 38, 'feihua-zhang': 38 };
const originalSkills = ['buddhism', 'claw', 'cuff', 'dodge', 'duoming-jinhua', 'feihua-zhang',
    'fengyun-shou', 'finger', 'force', 'hanbing-mianzhang', 'hand', 'jiuyang-shengong',
    'lingxu-bu', 'literate', 'longzhua-gong', 'martial-cognize', 'nianhua-zhi', 'parry',
    'pili-quan', 'pili-shou', 'pomopima-jian', 'qiankun-danuoyi', 'qingfu-shenfa', 'qishang-quan',
    'sanhua-zhang', 'shenghuo-bu', 'shenghuo-ling', 'shenghuo-shengong', 'shenghuo-xinfa',
    'sougu-yingzhua', 'staff', 'strike', 'sword', 'taiji-jian', 'taiji-quan', 'throwing',
    'tiyunzong', 'tougu-zhen', 'unarmed', 'xiaoyao-jian', 'yinfeng-dao', 'yinhu-zhang'];
const relatedFiles = ['duoming-jinhua/hua', 'feihua-zhang/fei', 'fengyun-shou/qinna',
    ...['dispel', 'heal', 'inspire', 'lifeheal', 'power', 'recover', 'regenerate', 'roar', 'shot', 'tianmo', 'xun']
        .map(id => 'force/' + id),
    'hanbing-mianzhang/jue', 'longzhua-gong/zhua', 'nianhua-zhi/fuxue', 'pili-quan/jin',
    'pili-shou/hun', 'pomopima-jian/zui', 'qiankun-danuoyi/nuoyi', 'qishang-quan/fei',
    'qishang-quan/shang', 'sanhua-zhang/san', 'shenghuo-ling/can', 'shenghuo-ling/hua',
    'shenghuo-ling/lian', 'shenghuo-ling/xi', 'shenghuo-shengong/powerup', 'shenghuo-shengong/shield',
    'shenghuo-xinfa/powerup', 'sougu-yingzhua/xue', 'sougu-yingzhua/ying', 'taiji-jian/chan',
    'taiji-jian/jia', 'taiji-jian/sui', 'taiji-jian/zhenwu', 'taiji-jian/zhuan', 'taiji-quan/ji',
    'taiji-quan/tu', 'taiji-quan/yin', 'taiji-quan/zhan', 'taiji-quan/zhen', 'tougu-zhen/feng',
    'xiaoyao-jian/fei', 'xiaoyao-jian/kuai', 'xiaoyao-jian/qi', 'yinfeng-dao/jue', 'yinhu-zhang/lao'];
export const mingjiaoCombinationSourcePaths = Object.freeze([...new Set([
    ...mingjiaoRemainingBaseSourcePaths, ...originalSkills.map(skillPath), ...relatedFiles.map(skillPath),
    'feature/guarder.c', 'feature/coagent.c', 'feature/unique.c', 'feature/master.c',
    'inherit/char/npc.c', 'adm/daemons/chard.c', 'cmds/skill/perform.c', 'cmds/skill/exert.c',
    'clone/misc/corpse.c', 'clone/misc/cloth.c', 'clone/weapon/gangjian.c',
    'd/items/cloth.lpc', 'd/items/cloth_data.h', 'd/items/staff.lpc', 'd/items/staff_data.h',
    'inherit/armor/cloth.c', 'include/armor.h',
])].sort());
export const mingjiaoCombinationReviewedSourceHash = '2996471557373c1dc4bbd9b6535a2bb560802eb39f2ef0b02903138bdc4b4828';

const callbacks = {
    daijisi: [['command', 'perform staff.lao'], ['command', 'perform cuff.jin']],
    fanyao: [['prepare_skill', 'finger', 'nianhua-zhi'], ['prepare_skill', 'strike', 'sanhua-zhang']],
    lengqian: [['command', 'perform cuff.jin']],
    weiyixiao: [['command', 'perform strike.jue']],
    xiaozhao: [],
    xiexun: [['command', 'perform cuff.shang'], ['command', 'perform cuff.fei']],
    yangxiao: [['command', 'perform sword.kuai'], ['command', 'perform sword.qi'],
        ['command', 'perform sword.fei'], ['command', 'perform cuff.jin']],
    yintianzheng: [['command', 'perform strike.jue'], ['command', 'perform finger.feng']],
    zhangwuji: [['command', 'perform sword.hua'], ['command', 'perform sword.xi'],
        ['command', 'perform sword.lian'], ['command', 'perform sword.can'],
        ['command', 'perform cuff.shang'], ['command', 'perform cuff.fei'],
        ['command', 'yun shield'], ['command', 'yun powerup'], ['command', 'yun recover']],
};
// Expectations are checked against pinned source below, never assigned to the NPC.
const identities = {
    daijisi: { name: '黛绮丝', str: 30, int: 30, con: 30, dex: 30, max_qi: 6500,
        max_jing: 2500, neili: 7000, max_neili: 7000, jiali: 210, combat_exp: 3500000,
        gender: '女性', chat_chance_combat: 120, wield: '/d/items/staff/muzhang' },
    fanyao: { name: '范遥', str: 30, int: 30, con: 30, dex: 30, max_qi: 6500,
        max_jing: 6500, neili: 8000, max_neili: 8000, jiali: 200, combat_exp: 3000000,
        gender: '男性', chat_chance_combat: 120, wield: '/clone/weapon/gangjian' },
    lengqian: { name: '冷谦', str: 25, int: 25, con: 25, dex: 25, max_qi: 2200,
        max_jing: 1200, neili: 3000, max_neili: 3000, jiali: 75, combat_exp: 600000,
        gender: '男性', chat_chance_combat: 120, wield: '' },
    weiyixiao: { name: '韦一笑', str: 28, int: 27, con: 33, dex: 38, max_qi: 4500,
        max_jing: 2200, neili: 5500, max_neili: 5500, jiali: 160, combat_exp: 1800000,
        gender: '男性', chat_chance_combat: 120, wield: '' },
    xiaozhao: { name: '小昭', str: 15, int: 25, con: 25, dex: 30, max_qi: 500,
        max_jing: 200, max_neili: 500, jiali: 50, gender: '女性', wield: '' },
    xiexun: { name: '谢逊', str: 40, int: 30, con: 40, dex: 30, max_qi: 6500,
        max_jing: 2500, neili: 7000, max_neili: 7000, jiali: 210, combat_exp: 3900000,
        gender: '男性', chat_chance_combat: 120, wield: '' },
    yangxiao: { name: '杨逍', str: 30, int: 30, con: 30, dex: 30, max_qi: 7500,
        max_jing: 2500, neili: 8000, max_neili: 8000, jiali: 150, combat_exp: 4000000,
        gender: '男性', chat_chance_combat: 20, wield: '/clone/weapon/gangjian' },
    yintianzheng: { name: '殷天正', str: 30, int: 30, con: 30, dex: 30, max_qi: 6500,
        max_jing: 2500, neili: 7000, max_neili: 7000, jiali: 210, combat_exp: 3900000,
        gender: '男性', chat_chance_combat: 120, wield: '' },
    zhangwuji: { name: '张无忌', str: 33, int: 35, con: 38, dex: 33, max_qi: 8800,
        max_jing: 3700, neili: 12000, max_neili: 12000, jiali: 200, combat_exp: 5000000,
        gender: '男性', chat_chance_combat: 120, wield: '/clone/weapon/gangjian' },
};
const properties = { str: 36, int: 36, con: 36, dex: 36, per: 36,
    combat_exp: 10000000, qi: 10000, eff_qi: 10000, max_qi: 10000,
    jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000,
    jiali: 0, shen: 0, gender: '男性', character: '国士无双', 'can_learn/yunv-xinjing/wall': 0 };
const neutral = () => ({ skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
    mappings: {}, preparations: {}, properties: copy(properties), equipment: { type: 'sword', hold: false } });
const compatible = (a, b) => Number(a === 'feihua-zhang' ? b === 'piaofeng-quan'
    : pairs.some(([x, y]) => a === x && b === y || a === y && b === x));
const preparations = skills => Object.fromEntries(skills.map(s => [mingjiaoCombinationSkills[s], s]));
const step = (action, skills, accepted = 1) => ({ action, accepted, preparations: preparations(skills) });
const missing = ['collection_registration', 'case_dispatch', 'strict_raw_record_and_effect_validation',
    'source_copy_and_probe_validation', 'real_smoke_and_formal_collection', 'report_and_independent_review'];

function actor(pair) {
    const [a, b] = pair;
    return { skills: { unarmed: 200, strike: 200, finger: 200, cuff: 200,
        [a]: 200, [b]: 200, 'pili-quan': 200, force: 600, dodge: 600, parry: 200 },
    mappings: { [mingjiaoCombinationSkills[a]]: a, [mingjiaoCombinationSkills[b]]: b,
        ...(pair === pairs[0] ? { cuff: 'pili-quan' } : {}), parry: a }, preparations: {},
    properties: { ...copy(properties), 'family/family_name': '明教' } };
}

function reviewed(catalog, readSource) {
    assert.equal(typeof readSource, 'function');
    const bytes = Object.fromEntries(mingjiaoCombinationSourcePaths.map(path => {
        const source = readSource(path);
        assert.ok((Buffer.isBuffer(source) || typeof source === 'string') && source.length, path);
        return [path, source];
    }));
    const evidence = Object.fromEntries(Object.entries(bytes).map(([p, b]) => [p, sha256(b)]));
    assert.equal(sha256(JSON.stringify(Object.entries(evidence))), mingjiaoCombinationReviewedSourceHash,
        'source drift: review original NPCs and combination sources');
    assert.ok(Array.isArray(catalog?.skills) && Array.isArray(catalog?.teachers));
    for (const id of originalSkills) {
        const found = catalog.skills.filter(s => s.id === id);
        assert.equal(found.length, 1, 'unique original skill: ' + id);
        assert.equal(found[0].path, skillPath(id));
        assert.equal(found[0].sha256, evidence[skillPath(id)]);
    }
    for (const [id, line] of Object.entries(combineLines)) {
        const s = catalog.skills.find(s => s.id === id);
        const entries = s.entries.filter(e => e.function === 'valid_combine');
        assert.equal(entries.length, 1, 'unique valid_combine: ' + id);
        const e = entries[0]; assert.equal(e.id, `${s.path}:${line}:valid_combine`);
        assert.equal(e.role, 'query_or_gate'); assert.equal(e.evidence.path, s.path);
        assert.equal(e.evidence.line, line); assert.equal(e.evidence.sha256, s.sha256);
    }
    const teachers = new Map();
    for (const id of npcs) {
        const path = `kungfu/class/mingjiao/${id}.c`;
        const found = catalog.teachers.filter(t => t.path === path);
        assert.equal(found.length, 1, 'unique original NPC: ' + path);
        const t = found[0]; assert.equal(t.directory_group, 'mingjiao'); assert.equal(t.sha256, evidence[path]);
        const source = bytes[path].toString(), scanned = scanSource(source);
        for (const [key, name] of [['npc_skills', 'set_skill'], ['mappings', 'map_skill'], ['preparations', 'prepare_skill']]) {
            const candidates = scanned.calls.filter(c => c.name === name && c.function === 'create');
            const actual = t[key].filter(c => c.function === 'create' && c.evidence.path === path);
            assert.equal(actual.length, candidates.length, 'catalog declarations: ' + id + '.' + key);
            for (const c of candidates) {
                const matches = actual.filter(d => d.evidence.line === c.line);
                assert.equal(matches.length, 1, 'unique declaration evidence');
                assert.equal(matches[0].evidence.sha256, evidence[path]);
                assert.equal(matches[0].name, name); assert.equal(matches[0].form, c.form);
                assert.deepEqual(matches[0].values, c.args.map(a => a.kind === 'string' || a.kind === 'integer' ? a.value : null));
            }
        }
        teachers.set(id, { teacher: t, source, scanned });
    }
    return { evidence, teachers };
}

export function mingjiaoCombinationConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(samples, 100, 'fixed formal distribution');
    const { evidence, teachers } = reviewed(catalog, readSource), rows = [];
    const note = '实验非巫师USER，相关基本及特殊技200，force/dodge600，零加力、空手、无特殊内功；'
        + '准备只经原玩家命令，不预填准备或动作旗标。霹雳/飞花仅外部资格对照，非原NPC组合。'
        + '每步返回、消息和准备分开；原fight守势、随机双击、反击保留，不保证每轮两击，不代替毒全生命周期或完整交锋。';
    function add(id, method, pair, steps = [], extra = {}) {
        const skill = extra.skill ?? pair[0], path = skillPath(skill);
        const p = { school: 'mingjiao', family: '明教', collection_group: mingjiaoCombinationGroup,
            skill, usage: mingjiaoCombinationSkills[skill], level: 200, ability: method,
            combination: id, actor: actor(pair), target: {
                skills: { unarmed: 600, force: 600, dodge: 600, parry: 600 }, mappings: {}, preparations: {},
                properties: copy(properties),
            }, named_participants: true,
            action: method === 'interface' ? 'test_interface' : method === 'round' ? 'fight_round' : 'prepare_sequence',
            observation: 'single_action_immediate', fighting: method === 'round', observe_seconds: 0,
            formal_samples: method === 'round' ? 100 : 2, randomized: method === 'round',
            expected: method === 'prepare' && !steps.some(s => s.accepted) ? 'refused' : 'observed',
            not_applicable: '', run_mode: smoke ? 'smoke' : 'formal',
            qualification_sources: [...mingjiaoCombinationSourcePaths], source_evidence: copy(evidence),
            reviewed_source_hash: mingjiaoCombinationReviewedSourceHash,
            qualification_note: note, integration: { registered: false, native_samples: 'not_collected', missing: [...missing] },
            ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + skill,
                function: 'valid_combine', combo: extra.combo }, combine_result: compatible(skill, extra.combo),
                source_entry: { function: 'valid_combine', line: combineLines[skill],
                    entry_id: `${path}:${combineLines[skill]}:valid_combine` } } : { prepare_commands: copy(steps),
                command_source: { path: 'cmds/skill/prepare.c', function: 'main', line: 14,
                    sha256: evidence['cmds/skill/prepare.c'] } }),
        };
        rows.push({ id: 'school-mingjiao-combination-' + id, stage: 'school', entry_id: path,
            method, samples: smoke ? 2 : p.formal_samples, status: 'prepared_not_sampled', parameters: p });
    }
    for (const pair of pairs) {
        for (const [a, b] of [pair, [...pair].reverse()]) {
            add(`${a}-allows-${b}`, 'interface', pair, [], { skill: a, combo: b });
            add(`${a}-${b}-names`, 'prepare', pair,
                [step(`prepare ${a} ${b}`, compatible(a, b) ? [a, b] : [], compatible(a, b))]);
            add(`${a}-${b}-sequential`, 'prepare', pair, [step('prepare ' + a, [a]),
                step('prepare ' + b, compatible(b, a) ? [a, b] : [a], compatible(b, a))]);
        }
    }
    const [a, b] = pairs[0], accepted = [step(`prepare ${a} ${b}`, [a, b])];
    add('cancel-and-replace', 'prepare', pairs[0], [...accepted, step('prepare none', []), step('prepare ' + a, [a])]);
    add('third-refused', 'prepare', pairs[0], [...accepted, step('prepare pili-quan', [a, b], 0)]);
    for (const pair of pairs.slice(0, 2)) {
        for (const first of pair) {
            const second = pair.find(s => s !== first);
            add(first + '-solo', 'round', pair, [step('prepare ' + first, [first])]);
            add(`${first}-${second}-pair`, 'round', pair, [step(`prepare ${first} ${second}`, [first, second])]);
        }
    }
    for (const id of npcs) {
        const { teacher, source, scanned } = teachers.get(id);
        const calls = name => scanned.calls.filter(c => c.function === 'create' && c.name === name);
        const declarations = name => Object.fromEntries(calls(name).map(c => c.args.slice(0, 2).map(a => a.value)));
        const skills = declarations('set_skill'), mappingDeclarations = declarations('map_skill');
        const { name, wield, ...props } = identities[id];
        const sourceLines = source.split('\n');
        const constructionEvidence = Object.entries(props).map(([key, value]) => {
            const text = `set(${JSON.stringify(key)}, ${JSON.stringify(value)})`;
            const matches = sourceLines.flatMap((line, index) => line.trim().startsWith(text + ';') ? [index + 1] : []);
            assert.equal(matches.length, 1, 'literal constructor expectation: ' + id + '.' + key);
            return { path: teacher.path, sha256: teacher.sha256, line: matches[0], key, value };
        });
        const actualWield = calls('carry_object').filter(c => sourceLines[c.line - 1].includes('->wield()'))
            .map(c => c.args[0].value);
        assert.deepEqual(actualWield, wield ? [wield] : [], 'original wield declaration');
        const callbackEvidence = callbacks[id].map(([entry, ...args]) => {
            const text = `${entry}(${args.map(a => JSON.stringify(a)).join(', ')})`;
            const matches = sourceLines.flatMap((line, index) => line.includes('(: ' + text + ' :)') ? [index + 1] : []);
            assert.equal(matches.length, 1, 'original natural closure source: ' + id + '.' + text);
            return { path: teacher.path, sha256: teacher.sha256, line: matches[0], entry, arguments: copy(args) };
        });
        // Expression closures inside create() are candidates, not constructor execution.
        const initialPrep = calls('prepare_skill').filter(c => /^\s*prepare_skill\s*\(/.test(source.split('\n')[c.line - 1]));
        const original = { name, props: copy(props), wield, construction_evidence: constructionEvidence,
            skills, mapping_declarations: mappingDeclarations,
            mappings: Object.fromEntries(Object.entries(mappingDeclarations).filter(([, s]) => skills[s] > 0)),
            preparations: Object.fromEntries(initialPrep.map(c => c.args.slice(0, 2).map(a => a.value))),
            gear: calls('carry_object').map(c => c.args[0].value),
            callbacks: copy(callbacks[id]), callback_evidence: callbackEvidence,
            construction: 'original_create_without_stat_or_equipment_overrides',
            combat_exp: id === 'xiaozhao' ? { observation: 'original_random', minimum: 50000, maximum: 59999 }
                : { observation: 'original_constructor' },
        };
        const p = { school: 'mingjiao', family: '明教', collection_group: mingjiaoNpcBoutGroup,
            skill: 'npc-' + id, usage: 'original', ability: 'bout', level: 0, combination: id,
            npc: { id, path: '/' + teacher.path.replace(/\.c$/, ''), callback_index: -1, callback: null,
                original, source: { id: teacher.path, path: teacher.path, role: 'npc', sha256: teacher.sha256 } },
            actor: neutral(), target: neutral(), actor_role: 'neutral_user_opponent', target_role: 'outside_arena_bystander',
            action: 'ordinary', strategy: 'original_npc_chat', observation: 'original_npc_heartbeat_bout',
            first: 'alternating_index', fighting: true, observe_seconds: smoke ? 3 : 30,
            formal_samples: 20, run_mode: smoke ? 'smoke' : 'formal', expected: 'observed', not_applicable: '',
            qualification_sources: [...mingjiaoCombinationSourcePaths], source_evidence: copy(evidence),
            reviewed_source_hash: mingjiaoCombinationReviewedSourceHash,
            capture_skill_loads: ['qishang-quan', 'shenghuo-ling'].map(skill => ({ skill,
                path: skillPath(skill), sha256: evidence[skillPath(skill)] })),
            requirements: { preserve_original_stats_maps_gear_chat_random: true,
                stored_and_effective_mappings_separate: true, preparation_keys_and_choice_snapshots: true,
                initializer_actor_without_observation: 'not_observed', npc_gross_resources: 'not_observed',
                native_outcome_policy: 'original_terminal_or_duration_no_replacement',
                public_fight_acceptance: 'not_covered', coagent_assistance: 'not_covered' },
            integration: { registered: false, native_samples: 'not_collected', missing: [...missing,
                'exact_nine_npc_allowlist', 'effective_mapping_and_choice_preparation_observation'] },
            qualification_note: '九原NPC直接create，原装备、加力、技能、映射和随机combat_exp不改；'
                + '按样本序号交替先手，正式20场30秒、独立烟雾2场3秒，原死亡终态可提前停止，不补采到成功。'
                + '范遥错误force映射不补、创建无准备而原对白可自然准备；黛绮丝缺阴风不补，张无忌存储无效映射另记。'
                + '中性USER作为对手，第二USER场外旁观；NPC净差与未观察毛费用分开，未选闭包不计已测，'
                + '1v1 kill路径不证明公开fight准入或协援，不更改startroom，不代替教学或单绝招窗口。',
        };
        rows.push({ id: 'school-mingjiao-npc-bout-' + id, stage: 'school', entry_id: teacher.path,
            method: 'bout', samples: smoke ? 2 : 20, status: 'prepared_not_sampled', parameters: p });
    }
    assert.equal(rows.length, 37); assert.equal(new Set(rows.map(c => c.id)).size, 37);
    return rows;
}

export function validateMingjiaoCombinationPlan(conditions, catalog, readSource, options = {}) {
    assert.deepEqual(conditions, mingjiaoCombinationConditions(catalog, readSource, options),
        'exact reviewed 37-condition plan, source references and run mode required');
    return conditions;
}
