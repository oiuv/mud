// Original public xun uses quest/id, not the explicit exert target. No live quests or accounts.
import assert from 'node:assert/strict';
import { wudangPublicForceConditions } from './school_wudang_public_force_cases.mjs';

export function wudangLookupConditions(catalog) {
    const base = wudangPublicForceConditions(catalog), source = catalog.skills.find(s => s.id === 'force/xun');
    const entry = source?.entries.find(e => e.role === 'exert')?.id;
    assert.ok(entry);
    return ['taiji-shengong', 'wudang-xinfa', 'wudang-jiuyang'].flatMap(force => [
        'by-player', 'by-living', 'by-object', 'west', 'far', 'ordinary-place',
        'no-permission', 'no-quest', 'not-found', 'no-environment', 'busy', 'no-force-map',
        'explicit-other', 'zero-neili',
    ].map(mode => {
        const c = structuredClone(base.find(c => c.id === `school-wudang-public-force-${force}-power-l200`));
        c.id = `school-wudang-lookup-${force}-${mode}`; c.entry_id = entry; c.samples = 2;
        const p = c.parameters;
        p.collection_group = 'wudang-lookup'; p.combination = mode; p.lookup_mode = mode;
        p.ability = 'xun'; p.action = mode === 'explicit-other' ? 'exert xun left' : 'exert xun';
        p.expected = ['no-permission', 'no-quest', 'not-found', 'no-environment', 'busy', 'no-force-map'].includes(mode)
            ? 'refused' : 'observed';
        delete p.power_selected; delete p.effect_expected;
        p.actor.properties['can_perform/wiz_test'] = mode === 'no-permission' ? 0 : 1;
        if (mode === 'busy') p.actor.busy = 2;
        if (mode === 'no-force-map') p.actor.mappings = {};
        if (mode === 'zero-neili') p.actor.properties.neili = 0;
        if (mode === 'west') p.target.properties.place = '西域';
        if (mode === 'far') p.target.properties.place = '很远的地方';
        if (mode === 'ordinary-place') p.target.properties.place = '中原';
        p.qualification_sources = [...new Set(p.qualification_sources.filter(s => !s.endsWith('/power.c')).concat([
            source.path, 'adm/single/simul_efun/user.c', 'adm/single/simul_efun/message.c',
            'feature/command.c', 'feature/message.c', 'd/foshan/street3.c', 'd/city/npc/liumangtou.c',
        ]))];
        p.qualification_note = '非巫师真实USER调用原exert xun，wiz_test及quest/id仅隔离实验赋值，不证明普通玩家可获此特殊权限。find_player/find_living/find_object均用原接口，入口前记录解析结果。by-living及无环境用从未连接的临时USER；其余用真实连接目标。西域/远地移动到副本中的真实佛山街道，保留原move和write，不替换地图或任务精灵。只测单次寻人，不代表整个任务系统。';
        return c;
    }));
}

const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
export function validateWudangLookupRecord(raw, condition) {
    const p = condition.parameters, l = raw.lookup;
    assert.equal(raw.outcome, p.expected); assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    assert.deepEqual(raw.after, raw.immediate); assert.equal(raw.attacks.length, 0); assert.equal(raw.callbacks.length, 0);
    assert.ok(l && Array.isArray(raw.lookup_messages));
    assert.equal(l.permission, p.actor.properties['can_perform/wiz_test']);
    for (const [i, cfg] of [[0, p.actor], [1, p.target]]) {
        assert.deepEqual(raw.before[i].mappings, cfg.mappings);
        for (const [k, v] of Object.entries(cfg.skills)) assert.equal(raw.before[i].skills[k], v);
        for (const key of resources) {
            assert.equal(raw.before[i][key], cfg.properties[key]);
            assert.equal(raw.after[i][key], raw.before[i][key]);
            assert.equal(raw.metrics[i][key + '_cost'] ?? 0, 0);
        }
        assert.equal(raw.after[i].busy, raw.before[i].busy);
        assert.equal(raw.before[i].wizardp, 0);
    }
    const mode = p.lookup_mode, subject = l.before.state.object;
    for (const key of resources) assert.equal(l.after.state[key], l.before.state[key]);
    assert.equal(l.after.state.object, subject);
    if (mode === 'by-player') assert.equal(l.find_player, subject);
    else if (mode === 'by-living') { assert.ok(!l.find_player); assert.equal(l.find_living, subject); }
    else if (['no-quest', 'not-found'].includes(mode)) assert.ok(!l.find_player && !l.find_living && !l.find_object);
    else { assert.ok(!l.find_player && !l.find_living); assert.equal(l.find_object, subject); }
    if (['by-living', 'no-environment'].includes(mode)) assert.equal(l.before.state.interactive, 0);
    else assert.equal(l.before.state.interactive, 1);
    if (p.expected === 'refused') {
        assert.equal(raw.launches.length, 0); assert.ok(raw.reason);
        assert.equal(l.after.room, l.before.room);
        assert.equal(raw.lookup_messages.filter(m => m.includes('现在在')).length, 0);
        const reasons = { 'no-permission': /没有这种功能/, 'no-quest': /没有这种功能/,
            'not-found': /没有找到这个人物/, 'no-environment': /不知道在那里/, 'busy': /上一个动作/,
            'no-force-map': /enable/ };
        assert.match(raw.reason, reasons[mode]); return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, 'force');
    const output = raw.lookup_messages.filter(m => m.includes('现在在'));
    assert.deepEqual(output, [`${l.before.name}(${l.before.state.id})现在在${l.before.room_short}(${l.before.room}).\n`]);
    assert.equal(l.after.room, ['west', 'far'].includes(mode) ? '/d/foshan/street3' : l.before.room);
    if (['west', 'far'].includes(mode)) assert.notEqual(l.after.room, l.before.room, '记录旧位置错误，不视为正常定位');
}

export function lookupEffects(rows) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    const located = raw.filter(r => r.lookup_messages?.some(m => m.includes('现在在')));
    return { attempts: raw.length, located: located.length,
        moved: located.filter(r => r.lookup.before.room !== r.lookup.after.room).length,
        stale_reports: located.filter(r => r.lookup.before.room !== r.lookup.after.room
            && r.lookup_messages.some(m => m.includes(`(${r.lookup.before.room}).`))).length,
        unknown: rows.length - raw.length };
}
