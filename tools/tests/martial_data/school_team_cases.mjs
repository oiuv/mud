// Original multiplayer commands, observed without artificial array cleanup.
import assert from 'node:assert/strict';

const fields = ['attack', 'defense', 'damage', 'armor'];
const command = (side, action, sizes = [2, 2], rooms = ['runner', 'runner']) =>
    ({ side, action, team_sizes: sizes, rooms });
const joinTeam = () => [command(0, 'team with right', [0, 0]), command(1, 'team with left')];
const form = () => command(0, 'perform blade.makearray');

function actor(level) {
    return { skills: { blade: level, 'fanliangyi-dao': level, force: 200, dodge: 200, parry: 200 },
        mappings: { blade: 'fanliangyi-dao', parry: 'fanliangyi-dao' },
        properties: { jiali: 0, neili: 6000, max_neili: 6000, 'family/family_name': '华山派' },
        equipment: { type: 'blade', hold: false } };
}

export function schoolTeamConditions(catalog, { smoke = false } = {}) {
    const skill = catalog.skills.find(s => s.id === 'fanliangyi-dao/makearray');
    assert.ok(skill, '缺少反两仪刀阵入口');
    const entry = skill.entries.find(e => e.role === 'perform')?.id;
    assert.ok(entry);
    const result = [];
    function add(id, left = 200, right = left, configure = () => {}) {
        const p = { school: 'huashan', ability: 'makearray', actor: actor(left), target: actor(right),
            action: 'perform blade.makearray', fighting: false, observe_seconds: 0, not_applicable: '',
            steps: [...joinTeam(), form()], expected: 'observed',
            qualification_note: '两个真实非巫师 USER，实验赋予技能与资源；经原 team/perform/go 命令，不手动解除刀阵，不代表教学或实战收益。',
            qualification_sources: ['kungfu/skill/fanliangyi-dao.c', skill.path,
                'kungfu/class/huashan/yue-buqun.c', 'cmds/std/team.c', 'cmds/std/team/with.c',
                'cmds/std/team/form.c', 'cmds/std/team/dismiss.c', 'cmds/std/go.c',
                'feature/team.c', 'feature/move.c', 'mudcore/inherit/team.c', 'cmds/skill/perform.c'] };
        configure(p);
        result.push({ id: 'school-team-fanliangyi-' + id, stage: 'school', method: 'team',
            entry_id: id === 'team-form' ? 'kungfu/skill/fanliangyi-dao.c' : entry,
            samples: smoke ? 1 : 2, parameters: p });
    }
    for (const level of [30, 200, 400, 800]) add('equal-' + level, level);
    for (const [left, right] of [[200, 201], [200, 400], [400, 200]]) add(`unequal-${left}-${right}`, left, right);
    add('max-neili50', 200, 200, p => { p.target.properties.max_neili = 50; p.target.properties.neili = 50; });
    add('neili0', 200, 200, p => { p.actor.properties.neili = 0; p.target.properties.neili = 0; });
    add('no-team', 200, 200, p => { p.steps = [command(0, 'perform blade.makearray', [0, 0])]; p.expected = 'refused'; });
    add('skill29', 200, 29, p => { p.expected = 'refused'; });
    add('max-neili49', 200, 200, p => {
        p.target.properties.max_neili = 49; p.target.properties.neili = 49; p.expected = 'refused';
    });
    add('unarmed', 200, 200, p => { delete p.target.equipment; p.expected = 'refused'; });
    add('unmapped', 200, 200, p => { delete p.target.mappings.blade; p.expected = 'refused'; });
    add('apart', 200, 200, p => {
        p.steps = [...joinTeam(), command(1, 'go east', [2, 2], ['runner', 'team_room']),
            command(0, 'perform blade.makearray', [2, 2], ['runner', 'team_room'])]; p.expected = 'refused';
    });
    add('team-form', 200, 200, p => {
        p.steps = [...joinTeam(), command(0, 'team form fanliangyi-dao')]; p.expected = 'refused';
    });
    add('leader-move', 200, 200, p => p.steps.push(command(0, 'go east', [2, 2], ['team_room', 'team_room'])));
    add('member-move', 200, 200, p => p.steps.push(command(1, 'go east', [2, 2], ['runner', 'team_room'])));
    add('leader-dismiss', 200, 200, p => p.steps.push(command(0, 'team dismiss', [0, 0])));
    add('member-dismiss', 200, 200, p => p.steps.push(command(1, 'team dismiss', [1, 0])));
    add('repeat', 200, 200, p => p.steps.push(form()));
    return result;
}

export function arrayBonus(left, right) {
    return Math.floor((Math.floor((left + right) / 2) + left * 5) / (Math.abs(left - right) + 1));
}

export function validateSchoolTeamRecord(raw, condition) {
    if (raw.outcome === 'error') return;
    const p = condition.parameters;
    assert.equal(raw.outcome, p.expected);
    assert.equal(raw.team_steps.length, p.steps.length);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        assert.deepEqual(raw.before[side].mappings, config.mappings);
        for (const [skill, value] of Object.entries(config.skills)) assert.equal(raw.before[side].skills[skill], value);
        for (const resource of ['neili', 'max_neili']) assert.equal(raw.before[side][resource], config.properties[resource]);
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            assert.equal(raw.metrics[side][resource + '_cost'] ?? 0, 0);
            assert.equal(raw.metrics[side][resource + '_recovery'] ?? 0, 0);
        }
    }
    let formed = 0;
    for (const [index, step] of raw.team_steps.entries()) {
        const expected = p.steps[index];
        assert.equal(step.side, expected.side); assert.equal(step.action, expected.action);
        assert.equal(typeof step.accepted, 'number');
        assert.equal(step.before.length, 2); assert.equal(step.after.length, 2);
        assert.equal(step.launches_before, index ? raw.team_steps[index - 1].launches_after : 0);
        for (const side of [0, 1]) {
            const before = step.before[side], after = step.after[side];
            assert.equal(before.object, raw.before[side].object); assert.equal(after.object, before.object);
            assert.ok(before.userp && before.interactive && before.playerp && !before.wizardp);
            assert.ok(after.userp && after.interactive && after.playerp && !after.wizardp);
            if (index) assert.deepEqual(before, raw.team_steps[index - 1].after[side], '步骤间未经命令修改状态');
            assert.equal(after.team.length, expected.team_sizes[side]);
            assert.equal(after.environment, '/tests/' + expected.rooms[side]);
            for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(after[resource], before[resource]);
        }
        if (step.launches_after > step.launches_before) {
            assert.equal(step.action, 'perform blade.makearray');
            assert.equal(step.launches_after - step.launches_before, 1);
            formed++;
            const bonus = arrayBonus(p.actor.skills['fanliangyi-dao'], p.target.skills['fanliangyi-dao']);
            for (const side of [0, 1]) {
                const before = step.before[side], after = step.after[side];
                assert.equal(after.temp.array.name, 'fanliangyi-dao');
                assert.equal(after.temp.array.level, bonus); assert.equal(after.temp.no_quit, 1);
                for (const field of fields) assert.equal((after.temp.apply?.[field] ?? 0)
                    - (before.temp.apply?.[field] ?? 0), bonus);
            }
        }
    }
    assert.equal(raw.launches.length, formed);
    assert.equal(formed, p.expected === 'observed' ? 1 : 0);
    for (const side of [0, 1]) {
        assert.deepEqual(raw.after[side].temp, raw.team_steps.at(-1).after[side].temp);
        if (!formed) assert.ok(!raw.after[side].temp.array && !raw.after[side].temp.no_quit);
    }
    // Do not assert successful cleanup: defects remain observable report data.
}

export function teamEffects(raw) {
    return raw.team_steps.map(step => ({ action: step.action, side: step.side, accepted: step.accepted,
        launches: step.launches_after - step.launches_before,
        actors: step.after.map((state, side) => ({ team_size: state.team.length,
            environment: state.environment, array: state.temp.array ?? null, no_quit: state.temp.no_quit ?? 0,
            apply_delta: Object.fromEntries(fields.map(field => [field,
                (state.temp.apply?.[field] ?? 0) - (raw.before[side].temp.apply?.[field] ?? 0)])) })) }));
}
