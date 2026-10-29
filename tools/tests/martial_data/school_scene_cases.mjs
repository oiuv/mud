// Original room entry is a separate source identity, not a teaching/perform result.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';
import { validateMingjiaoRouteRecord } from './school_mingjiao_route_cases.mjs';
import { validateMiaoStudyRecord } from './school_miao_study_cases.mjs';

export const fumoSources = ['d/shaolin/fumoquan.c', 'd/shaolin/qyping.c',
    'kungfu/class/shaolin/du-nan.c', 'kungfu/class/shaolin/du-e.c',
    'kungfu/class/shaolin/du-jie.c', 'kungfu/class/shaolin/du.h',
    'adm/daemons/combatd.c', 'feature/move.c', 'cmds/std/go.c'];

export const fumoGifts = [
    { key: 'caojie', npc: 'du nan', topic: '神草结', id: 'shen caojie' },
    { key: 'jiuhuan', npc: 'du e', topic: '九环锡杖', id: 'jiuhuan xizhang' },
    { key: 'jinlan', npc: 'du jie', topic: '锦襕袈裟', id: 'jinlan jiasha' },
];

export function giftCommands(granted) {
    return fumoGifts.flatMap(g => {
        const ask = 'ask ' + g.npc + ' about ' + g.topic;
        const step = (command, owner) => ({ command, item: '/clone/lonely/' + g.key, owner });
        if (!granted) return [step(ask, g.npc)];
        return [step(ask, 'player'), step(ask, 'player'), step('drop ' + g.id, 'room'),
            step(ask, g.npc), step(ask, 'player'), step('give ' + g.id + ' to ' + g.npc, 'absent'),
            step(ask, 'player'), step('drop ' + g.id, 'room'), step('get ' + g.id, 'player'),
            step('give ' + g.id + ' to ' + g.npc, 'absent')];
    });
}

export function schoolSceneConditions(_catalog, { smoke = false } = {},
    readSource = path => readFileSync(join(root, path), 'utf8')) {
    const evidence = fumoSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(evidence[0].sha256, 'd0b17253f64e79e0daf33fc9a613a6f59829b1e3c9312cbd4a03c665401b6b61',
        '伏魔圈入口变化，须重新核对条件');
    const entry = { id: 'd/shaolin/fumoquan.c:23:init', path: fumoSources[0], line: 23,
        function: 'init', role: 'scene', sha256: evidence[0].sha256 };
    const entryConditions = [
        { id: 'junior-exp99999', family: '少林派', generation: 37, exp: 99999, expelled: true, repeats: 2 },
        { id: 'junior-exp100000', family: '少林派', generation: 37, exp: 100000, repeats: 100 },
        { id: 'senior-exp99999', family: '少林派', generation: 36, exp: 99999, exempt: true, repeats: 2 },
        { id: 'foreign-exp100000', family: '武当派', generation: 99, exp: 100000, repeats: 100 },
    ].map(c => ({ id: 'school-scene-fumo-' + c.id, entry_id: entry.id,
        stage: 'school', method: 'scene', samples: smoke ? 1 : c.repeats,
        parameters: { collection_group: 'shaolin-fumo', source_entry: entry,
            qualification_sources: fumoSources, qualification_evidence: evidence,
            action: 'original room entry', expected: 'observed', fighting: false, observe_seconds: 0, not_applicable: '',
            actor: { skills: { force: 80, dodge: 80, parry: 80 }, mappings: {},
                properties: { family: { family_name: c.family, generation: c.generation },
                    combat_exp: c.exp, max_qi: 1000000, eff_qi: 1000000, qi: 1000000,
                    jiali: 0, neili: 6000, max_neili: 6000 } },
            target: { skills: {}, mappings: {}, properties: {} },
            scene_steps: c.expelled ? ['in', 'in', 'out', 'in'] : ['in', 'out', 'in', 'out'],
            expelled: !!c.expelled, exempt: !!c.exempt,
            note: '初始放置青云坪，此后只执行原go；每样本重新加载原房间和三渡，不改NPC装备、属性或武学。高气血仅保留九次攻击观察，不代表胜率；步骤内不补资源、不注入许可。同步入场调用不另开玩家心跳。',
        } }));
    const lifecycleSources = [...fumoSources, 'feature/damage.c', 'inherit/char/char.c',
        'd/death/gate.c', 'include/login.h'];
    const lifecycleEvidence = lifecycleSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    const lifecycle = ['junior', 'foreign'].flatMap(family => ['entry', 'followup'].map(mode => {
        const base = structuredClone(entryConditions.find(c => c.id === 'school-scene-fumo-' + family + '-exp100000'));
        base.id = 'school-scene-fumo-failure-' + family + '-' + mode;
        base.samples = smoke ? 1 : mode === 'entry' ? 100 : 2;
        const p = base.parameters;
        p.qualification_sources = lifecycleSources;
        p.qualification_evidence = lifecycleEvidence;
        p.lifecycle = true;
        p.observe_seconds = mode === 'entry' ? 0 : family === 'junior' ? 105 : 5;
        p.scene_steps = ['in'];
        Object.assign(p.actor.properties, {max_qi: 10000, eff_qi: 10000, qi: 1});
        p.note = '一次原go入场，低气血观察原失败分支；即时组100次。等待组2次，启用原玩家心跳，少林等105秒后原go out；外派等5秒后尝试原go out，不代表完整阴间返阳流程。不手动醒转、复活或补资源。';
        return base;
    }));
    const giftSources = [...fumoSources, ...fumoGifts.map(g => 'clone/lonely/' + g.key + '.c'),
        'cmds/std/ask.c', 'cmds/std/give.c', 'cmds/std/drop.c', 'cmds/std/get.c', 'feature/name.c'];
    const giftEvidence = giftSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    const gifts = [
        { id: 'senior-below', generation: 36, exp: 999999, granted: false, samples: 2 },
        { id: 'senior-threshold', generation: 36, exp: 1000000, granted: true, samples: 2 },
        { id: 'junior-threshold', generation: 37, exp: 1000000, granted: true, samples: 100 },
    ].map(c => {
        const base = structuredClone(entryConditions[1]);
        base.id = 'school-scene-fumo-gifts-' + c.id;
        base.samples = smoke ? 1 : c.samples;
        const p = base.parameters;
        p.gifts = true;
        p.named_participants = true;
        p.exempt = c.generation === 36;
        p.qualification_sources = giftSources;
        p.qualification_evidence = giftEvidence;
        p.scene_steps = ['in'];
        p.gift_commands = giftCommands(c.granted);
        Object.assign(p.actor.properties, { combat_exp: c.exp,
            family: { family_name: '少林派', generation: c.generation } });
        p.note = '原go取得许可后原ask/give/drop/get；三件原单例物品不克隆、不预交付、不补资源。低门槛2次，辈分豁免领取链2次，普通九击后领取链100次。每步记录归属、装备和物品是否仍存在；返回1不等同交付。';
        return base;
    });
    const specialSources = [...giftSources, 'adm/single/simul_efun/user.c', 'feature/damage.c'];
    const specialEvidence = specialSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    const specials = [
        ...['missing','unconscious'].flatMap(mode=>fumoGifts.map(g=>({
            id:mode+'-'+g.npc.replaceAll(' ','-'), guardian:{id:g.npc,mode}, permit:2 }))),
        {id:'ultra',ultra:true,permit:1},
        {id:'ultra-missing',ultra:true,guardian:{id:'du e',mode:'missing'},permit:2},
        {id:'senior-missing',senior:true,guardian:{id:'du e',mode:'missing'},permit:1},
        {id:'other-holder',senior:true,companion:true,permit:1},
    ].map(c=>{
        const base=structuredClone(gifts[1]),p=base.parameters;
        base.id='school-scene-fumo-special-'+c.id;
        base.samples=smoke?1:2;
        p.special_entry=true;p.entry_permit=c.permit;p.exempt=!!c.senior;
        p.qualification_sources=specialSources;p.qualification_evidence=specialEvidence;
        p.actor.properties.family.generation=c.senior?36:37;
        if(c.ultra)p.actor.properties['opinion/ultra']=1;
        if(c.guardian)p.guardian_state=c.guardian;
        p.gift_commands=giftCommands(c.permit===1).filter(s=>
            !c.guardian || s.item!=='/clone/lonely/'+fumoGifts.find(g=>g.npc===c.guardian.id).key);
        if(c.companion){
            p.companion=true;p.target=structuredClone(p.actor);
            p.gift_commands=fumoGifts.flatMap(g=>{
                const ask='ask '+g.npc+' about '+g.topic;
                const step=(command,owner,side=0)=>({command,item:'/clone/lonely/'+g.key,owner,side});
                return [step(ask,'player'),step('give '+g.id+' to right','other'),step(ask,'other'),
                    step('give '+g.id+' to left','player',1),step(ask,'player'),
                    step('give '+g.id+' to '+g.npc,'absent'),step(ask,'player'),
                    step('give '+g.id+' to '+g.npc,'absent')];
            });
        }
        p.note='明确临时场景条件：缺席用原NPC移出房间，昏迷调用原unconcious；大宗师字段及辈分是实验资格，不冒充自然养成。玩家均通过原go入场，不预写许可。双玩家用原give转交及归还，不直接改物品归属；只采同步分支，不等NPC自然醒转。';
        return base;
    });
    return [...entryConditions, ...lifecycle, ...gifts, ...specials];
}

export function sceneEntries(conditions) {
    return [...new Map(conditions.map(c => [c.entry_id, c.parameters.source_entry])).values()];
}

export function validateSchoolSceneRecord(raw, condition) {
    if (condition.parameters.collection_group === 'miao-study')
        return validateMiaoStudyRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-route')
        return validateMingjiaoRouteRecord(raw, condition);
    if (raw.outcome === 'error') return;
    const p = condition.parameters;
    assert.equal(raw.outcome, 'observed');
    assert.equal(raw.method, 'scene');
    assert.equal(raw.scene_steps?.length, p.scene_steps.length, '场景步骤不完整');
    assert.ok(Array.isArray(raw.scene_attacks), '缺少攻击参数观察');
    assert.equal(raw.before[0].combat_exp, p.actor.properties.combat_exp);
    // Original combat can award one experience point on a dodge/parry.
    // include/combat.h: RESULT_DODGE=-1, RESULT_PARRY=-2 (not a boolean).
    // Preserve that gain instead of assuming the room is the only state writer.
    const expGain = raw.after[0].combat_exp - raw.before[0].combat_exp;
    if (!p.lifecycle) assert.ok(Number.isSafeInteger(expGain) && expGain >= 0
        && expGain <= (raw.attacks ?? []).filter(a => a.result === -1 || a.result === -2).length,
    '经验变化超出原闪避／招架收益范围');
    for (const [skill, level] of Object.entries(p.actor.skills)) assert.equal(raw.before[0].skills[skill], level);
    assert.deepEqual(raw.before[0].mappings, p.actor.mappings);
    let prior;
    for (const [i, step] of raw.scene_steps.entries()) {
        assert.equal(step.command, 'go ' + p.scene_steps[i]);
        assert.equal(step.accepted, 1, '原go未受理，不能伪装成完成行走');
        for (const s of [step.before, step.after]) {
            assert.equal(s.player.object, raw.before[0].object);
            assert.equal(s.player.interactive, 1); assert.equal(s.player.wizardp, 0);
            if (!p.lifecycle) { assert.equal(s.player.living, 1); assert.equal(s.player.ghost, 0); }
            assert.ok(Object.hasOwn(s, 'ultra') && Object.hasOwn(s, 'permit'), '缺少入场判定状态');
            assert.equal(s.ultra ?? 0, p.actor.properties['opinion/ultra']??0); assert.equal(s.monks.length, 3);
            assert([null, 0, 1, 2].includes(s.permit));
            assert.deepEqual(s.family, p.actor.properties.family, '师承初态不符');
            for (const [index,monk] of s.monks.entries()) {
                const altered=p.guardian_state?.id===fumoGifts[index].npc;
                if(altered&&p.guardian_state.mode==='missing'){
                    assert.deepEqual(monk,{id:p.guardian_state.id,missing:1});continue;
                }
                assert.equal(monk.room, '/d/shaolin/fumoquan');
                assert.equal(monk.state.living, altered&&p.guardian_state.mode==='unconscious'?0:1);
                assert.equal(monk.state.weapon, 'whip');
            }
        }
        if (prior) assert.deepEqual(step.before, prior, '原命令之间改变了场景状态');
        else {
            assert.equal(step.before.room, '/d/shaolin/qyping');
            assert.equal(step.before.permit ?? 0, 0, '不预写入场许可');
        }
        prior = step.after;
    }
    for (const a of raw.scene_attacks) {
        assert.ok(['enter', 'selected'].includes(a.phase));
        assert.ok(Number.isInteger(a.step) && a.step >= 0 && a.step < p.scene_steps.length);
        assert.equal(a.caller, '/d/shaolin/fumoquan');
        assert.equal(a.target, 0);
        assert.ok(['/kungfu/class/shaolin/du-nan', '/kungfu/class/shaolin/du-e',
            '/kungfu/class/shaolin/du-jie'].includes(a.actor_program));
        assert.equal(a.actual_weapon.skill_type, 'whip');
        assert.deepEqual(a.argument_weapon, {}, '观察原房间传入的空武器，不自行修正');
        if (a.phase === 'selected') assert.ok(['finger', 'strike'].includes(a.attack_skill));
    }
    // This reader verifies evidence completeness. Bug-specific route and attack
    // outcomes are asserted by the source-reviewed report, not rewritten here.
    if (p.lifecycle) validateSceneLifecycle(raw, condition);
    if (p.gifts) validateSceneGifts(raw, condition);
    if (p.special_entry) validateSceneSpecial(raw, condition);
}

export function validateSceneGifts(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.scene_interactions?.length, p.gift_commands.length, '物品交互不完整');
    let prior;
    for (const [i, step] of raw.scene_interactions.entries()) {
        assert.equal(step.command, p.gift_commands[i].command);
        assert.ok([0, 1].includes(step.accepted), '原命令返回值缺失');
        for (const s of [step.before, step.after]) {
            assert.equal(s.player.object, raw.before[0].object);
            assert.equal(s.player.interactive, 1); assert.equal(s.player.wizardp, 0);
            assert.equal(s.player.living, 1); assert.equal(s.player.ghost, 0);
            assert.equal(s.room, '/d/shaolin/fumoquan'); assert.equal(s.permit, p.entry_permit??1);
            if(p.companion){
                assert.equal(step.side,p.gift_commands[i].side);
                assert.equal(s.other?.room,'/d/shaolin/fumoquan');assert.equal(s.other.permit,1);
                assert.equal(s.other.player.object,raw.before[1].object);
                assert.equal(s.other.player.interactive,1);assert.equal(s.other.player.wizardp,0);
                assert.equal(s.other.player.living,1);assert.equal(s.other.player.ghost,0);
            }
            assert.equal(s.gifts.length, 3);
            assert.deepEqual(s.gifts.map(g=>g.path), fumoGifts.map(g=>'/clone/lonely/'+g.key));
            for (const gift of s.gifts) {
                assert.ok([0, 1].includes(gift.exists));
                if (gift.exists) {
                    assert.equal(gift.object, gift.path, '原物品必须是唯一蓝图');
                    assert.equal(gift.clone, 0);
                    for(const field of ['environment', 'owner', 'equipped', 'name'])
                        assert.ok(Object.hasOwn(gift, field), '缺少物品状态 '+field);
                }
            }
        }
        if (prior) assert.deepEqual(step.before, prior, '交互步骤之间改写状态');
        else {
            const { gifts, other, ...before } = step.before;
            assert.deepEqual(before, raw.scene_steps.at(-1).after, '进入后改写资格');
            if(p.companion)assert.deepEqual(other.player,raw.scene_companion_entry.after.player);
        }
        prior = step.after;
    }
    assert.deepEqual(prior.player, raw.after[0], '交互终态与资源账不一致');
    if(p.companion)assert.deepEqual(prior.other.player,raw.after[1], '另一角色终态不一致');
}

export function validateSceneSpecial(raw, condition) {
    const p=condition.parameters;
    assert.equal(raw.scene_steps[0].after.permit,p.entry_permit);
    assert.equal(raw.scene_attacks.length,0,'特殊豁免不应执行九击');
    assert.equal(raw.attacks.length,0);
    if(p.guardian_state){
        const setup=raw.scene_setup;
        assert.equal(setup?.id,p.guardian_state.id);assert.equal(setup.mode,p.guardian_state.mode);
        assert.equal(setup.before.object,setup.object);assert.equal(setup.after.object,setup.object);
        assert.equal(setup.before_room,'/d/shaolin/fumoquan');assert.equal(setup.before.living,1);
        assert.equal(setup.after_room,setup.mode==='missing'?'/tests/runner':'/d/shaolin/fumoquan');
        assert.equal(setup.after.living,setup.mode==='missing'?1:0);
        assert.equal(setup.after.ghost,0);
    } else assert(!raw.scene_setup);
    if(p.companion){
        const entry=raw.scene_companion_entry;
        assert.equal(entry?.command,'go in');assert.equal(entry.accepted,1);
        for(const s of [entry.before,entry.after]){
            assert.equal(s.player.object,raw.before[1].object);assert.equal(s.player.interactive,1);
            assert.equal(s.player.wizardp,0);assert.deepEqual(s.family,p.target.properties.family);
        }
        assert.equal(entry.before.room,'/d/shaolin/qyping');assert.equal(entry.before.permit??0,0);
        assert.equal(entry.after.room,'/d/shaolin/fumoquan');assert.equal(entry.after.permit,1);
    } else assert(!raw.scene_companion_entry);
}

export function validateSceneLifecycle(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.before[0].qi, 1);
    assert.equal(raw.before[0].ghost, 0);
    assert.equal(raw.before[0].living, 1);
    assert.ok(Array.isArray(raw.scene_lifecycle) && raw.scene_lifecycle.length >= 2, '缺少原生命周期事件');
    const stack = [];
    let elapsed = 0;
    for (const e of raw.scene_lifecycle) {
        assert.ok(['unconscious', 'death', 'revive'].includes(e.event));
        assert.ok(['before', 'after'].includes(e.phase));
        assert.ok(Number.isFinite(e.elapsed) && e.elapsed >= elapsed && e.elapsed <= raw.elapsed);
        elapsed = e.elapsed;
        assert.equal(e.state.object, raw.before[0].object);
        assert.equal(e.state.interactive, 1); assert.equal(e.state.wizardp, 0);
        assert.equal(typeof e.room, 'string');
        assert.ok(Object.hasOwn(e, 'deaths') && Object.hasOwn(e, 'reason'));
        if (e.phase === 'before') stack.push(e.event);
        else assert.equal(stack.pop(), e.event, '生命周期前后不配对');
    }
    assert.equal(stack.length, 0, '生命周期未返回');
    if (p.observe_seconds) {
        assert.ok(raw.elapsed >= p.observe_seconds, '没有等待原时钟');
        assert.ok(raw.metrics[0].heartbeats > 0, '未执行原玩家心跳');
        const step = raw.scene_followup;
        assert.equal(step?.command, 'go out');
        assert.ok([0, 1].includes(step.accepted));
        for (const s of [step.before, step.after]) {
            assert.equal(s.player.object, raw.before[0].object);
            assert.equal(s.player.interactive, 1); assert.equal(s.player.wizardp, 0);
        }
        assert.deepEqual(step.after.player, raw.after[0]);
    } else {
        assert.ok(!raw.scene_followup);
        assert.deepEqual(raw.scene_steps[0].after.player, raw.after[0]);
    }
}
