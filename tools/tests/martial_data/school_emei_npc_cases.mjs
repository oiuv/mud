// Original NPC create/equipment snapshots; callback probes are not heartbeat bouts.
import assert from 'node:assert/strict';

export const emeiNpcGroup = 'emei-npc';
export const zhouCallbacks = ['claw.duo', 'claw.jie', 'strike.cuixin', 'whip.jiao',
    'dodge.guiyuan', 'recover', 'powerup', 'shield'];

export function emeiNpcConditions(catalog, { smoke = false } = {}) {
    const teachers = catalog.teachers.filter(t => t.directory_group === 'emei');
    assert.equal(teachers.length, 28, '峨嵋 NPC 范围改变，须重新核查');
    const properties = { str: 36, int: 36, con: 36, dex: 36, combat_exp: 10000000,
        qi: 10000, eff_qi: 10000, max_qi: 10000, neili: 6000, max_neili: 6000, jiali: 0 };
    const actor = { skills: { force: 600, dodge: 600, parry: 600 }, mappings: {},
        preparations: {}, properties };
    return teachers.flatMap(t => {
        const id = t.path.split('/').at(-1).replace(/\.(c|lpc)$/, '');
        return [-1, ...(id === 'zhou' ? zhouCallbacks.map((_, i) => i) : [])].map(index => ({
            id: `school-emei-npc-${id}-${index < 0 ? 'loadout' : 'callback' + index}`,
            stage: 'school', entry_id: t.path, method: 'npc',
            samples: smoke ? 1 : index < 0 ? 2 : 20,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: emeiNpcGroup,
                skill: 'npc-' + id, usage: 'original', ability: index < 0 ? 'loadout' : zhouCallbacks[index],
                level: 0, combination: id, observation: 'original_npc_immediate',
                npc: { path: '/' + t.path.replace(/\.(c|lpc)$/, ''), callback_index: index,
                    source: { id: t.path, path: t.path, role: 'npc', sha256: t.sha256 } },
                actor: structuredClone(actor), target: structuredClone(actor),
                action: 'observe_npc', fighting: false, observe_seconds: 0,
                expected: 'observed', not_applicable: '',
                qualification_sources: [t.path, ...t.shared_headers.map(h => h.path),
                    'inherit/char/npc.c', 'inherit/skill/skill.c', 'feature/skill.c', 'feature/equip.c',
                    ...(id === 'zhou' ? ['kungfu/skill/jiuyin-baiguzhao.c',
                        'kungfu/skill/jiuyin-baiguzhao/duo.c', 'kungfu/skill/cuixin-zhang.c',
                        'kungfu/skill/yinlong-bian.c', 'kungfu/skill/shexing-lifan/guiyuan.c',
                        'kungfu/skill/yijin-duangu.c', 'kungfu/skill/yijin-duangu/powerup.c',
                        'kungfu/skill/yijin-duangu/shield.c'] : [])],
                qualification_note: '直接创建原 NPC，保留 create/setup 的属性、技能、激发、准备及携带装备，不替换为实验玩家。快照后销毁临时对象；周芷若的八条原战斗闭包逐条单独调用，唯一环境准备为与无映射、基本防御600的真实测试玩家互列敌对。不改闭包、补兵器、补技能、受伤或强制随机；返回0仅记该入口无进展，不等同编译错误。未运行 NPC 自然心跳，不推导自动选招频率、完整战斗或胜率。',
            },
        }));
    });
}

export function npcEntries(conditions) {
    return [...new Map(conditions.filter(c => [emeiNpcGroup, 'gumu-npc', 'gumu-npc-bout', 'emei-npc-bout'].includes(c.parameters.collection_group))
        .map(c => [c.entry_id, c.parameters.npc.source])).values()];
}

export function validateEmeiNpcRecord(raw, condition) {
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, 'observed');
    const p = condition.parameters, n = raw.npc_observation;
    assert.ok(n, '缺少原 NPC 观察');
    assert.equal(n.before.program, p.npc.path);
    assert.equal(n.before.clone, 1); assert.equal(n.before.userp, 0);
    // Host playerp() returns an unset value for NPCs (JSON null), not efun bool 0.
    assert.ok(n.before.playerp === null || n.before.playerp === 0);
    assert.equal(n.before.living, 1);
    assert.equal(n.destroyed, 1, '原 NPC 必须在样本结束前清理');
    assert.equal(n.before.name.length > 0, true);
    assert.ok(Object.keys(n.before.skills).length > 0);
    assert.deepEqual(n.after.skills, n.before.skills);
    assert.deepEqual(n.after.mappings, n.before.mappings);
    assert.deepEqual(n.after.preparations, n.before.preparations);
    assert.deepEqual(n.after.inventory, n.before.inventory);
    if (p.npc.callback_index < 0) {
        assert.equal(n.called, 0); assert.deepEqual(n.after, n.before);
    } else {
        const index = p.npc.callback_index;
        assert.equal(n.called, 1); assert.equal(n.callback_index, index);
        assert.equal(n.before.combat_callbacks.length, 8);
        assert.ok(n.before.combat_callbacks[index].includes('"' + zhouCallbacks[index] + '"'),
            '原闭包参数与已审查配置不符');
        assert.equal(n.after.program, n.before.program);
        assert.ok([0, 1].includes(n.result));
        // Three missing paths are the finding being observed, never repaired here.
        if ([1, 2, 3].includes(index)) {
            assert.equal(n.result, 0);
            assert.deepEqual(n.after.properties, n.before.properties);
        }
        if ([5, 7].includes(index)) {
            assert.equal(n.result, 0);
            assert.deepEqual(n.after.properties, n.before.properties);
        }
        if ([0, 4, 6].includes(index)) {
            assert.equal(n.result, 1);
            const cost = n.before.properties.neili - n.after.properties.neili;
            if (index === 0) {
                assert.ok([2, 3].includes(n.after.busy));
                const direct = raw.npc_direct;
                assert.ok(Array.isArray(direct) && direct.length <= 1);
                for (const e of direct) {
                    assert.equal(e.actor_program, p.npc.path); assert.equal(e.target, 0);
                }
                if (n.after.busy === 2) assert.equal(direct.length, 1);
                // Unlike the previous player test (jiali=0), the original NPC
                // also pays jiali=200 inside COMBAT_D->do_damage on a hit.
                assert.equal(cost, (n.after.busy === 2 ? 100 : 250) + direct.length * 200);
            } else assert.equal(cost, index === 4 ? 200 : 100);
        }
        if (index === 4) {
            assert.equal(n.after.temp.gui_yuan, 1);
            assert.equal(n.after.temp.dex, 5); assert.equal(n.after.temp.str, 5);
            assert.equal(n.after.effective_dex, n.before.effective_dex);
            assert.equal(n.after.effective_str, n.before.effective_str);
        }
        if (index === 6) {
            assert.equal(n.after.temp.powerup, 1);
            assert.equal((n.after.temp.apply?.attack ?? 0) - (n.before.temp.apply?.attack ?? 0), 130);
        }
    }
    if (p.npc.path.endsWith('/zhou')) {
        assert.equal(n.before.weapon, 'none');
        assert.equal(n.before.mappings.parry, 'yinlong-bian');
        assert.deepEqual(n.before.preparations, { strike: 'cuixin-zhang', claw: 'jiuyin-baiguzhao' });
        assert.equal(n.before.skills['jiuyin-baiguzhao'], 260);
        assert.equal(n.before.properties.neili, 6000);
        assert.equal(n.before.skills['dafumo-quan'], undefined);
        assert.equal(n.before.mappings.unarmed, undefined);
    }
}

export function npcEffects(rows) {
    const data = rows.map(r => r.raw.npc_observation);
    return { snapshots: data.length, callbacks: data.filter(n => n.called).length,
        returned_one: data.filter(n => n.called && n.result === 1).length,
        returned_zero: data.filter(n => n.called && n.result === 0).length,
        neili_spent: data.map(n => n.before.properties.neili - n.after.properties.neili),
        loadouts: data.map(n => n.before) };
}
