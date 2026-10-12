import assert from 'node:assert/strict';

// Not registered yet. Apply only to the new isolated NPC-bout snapshot.
// Runner receivers must ignore all objects except the exact owned NPC.
function rewrite(source, sites) {
    let changed = source;
    for (const site of sites) {
        assert.equal(changed.includes(site.replacement), false, '不得重复注入NPC观察');
        assert.equal(changed.split(site.anchor).length, 2, 'NPC观察锚点必须唯一');
        changed = changed.replace(site.anchor, site.replacement);
    }
    let restored = changed;
    for (const site of [...sites].reverse()) {
        assert.equal(restored.split(site.replacement).length, 2, 'NPC观察逆变换必须唯一');
        restored = restored.replace(site.replacement, site.anchor);
    }
    assert.equal(restored, source, 'NPC观察必须逐字节还原原源码');
    return { changed, sites };
}

export function npcBoutHeartbeatProbes(source) {
    return rewrite(source, [
        { anchor: '    int is_player;\n\n    me = this_object();',
            replacement: '    int is_player;\n    int npc_observed_attack_result;\n\n'
                + '    me = this_object();\n'
                + '    "/tests/runner"->observe_npc_heartbeat(me);' },
        { anchor: '        // Do attack or clean up enemy if we have fleed.\n        attack();',
            replacement: '        // Do attack or clean up enemy if we have fleed.\n'
                + '        "/tests/runner"->observe_npc_round(me, "before", 0);\n'
                + '        npc_observed_attack_result = attack();\n'
                + '        "/tests/runner"->observe_npc_round(me, "after", npc_observed_attack_result);' },
    ]);
}

export function npcBoutChatProbes(source) {
    return rewrite(source, [
        { anchor: 'void scan() {\n    object me;\n\n    me = this_object();',
            replacement: 'void scan() {\n    object me;\n\n    me = this_object();\n'
                + '    "/tests/runner"->observe_npc_scan(me);' },
        { anchor: 'int chat() {\n    string *msg;\n    int chance, rnd;',
            replacement: 'int chat() {\n    string *msg;\n    int chance, rnd;\n'
                + '    mixed npc_observed_choice_result;\n\n'
                + '    "/tests/runner"->observe_npc_chat(this_object());' },
        { anchor: '            else if (functionp(msg[rnd]))\n                return evaluate(msg[rnd]);',
            replacement: '            else if (functionp(msg[rnd])) {\n'
                + '                "/tests/runner"->observe_npc_choice(this_object(), rnd, msg[rnd], "before", 0);\n'
                + '                npc_observed_choice_result = evaluate(msg[rnd]);\n'
                + '                "/tests/runner"->observe_npc_choice(this_object(), rnd, msg[rnd], "after", npc_observed_choice_result);\n'
                + '                return npc_observed_choice_result;\n            }' },
    ]);
}

export function npcBoutTerminalProbes(source) {
    return rewrite(source, ['unconcious', 'die'].map((kind, index) => {
        const anchor = `    if (run_override("${kind}"))\n        return;`;
        return { anchor, replacement: anchor + '\n\n'
            + `    "/tests/runner"->observe_npc_terminal(me, "${index ? 'death' : 'unconscious'}");` };
    }));
}

export function npcBoutCorpseProbes(source) {
    return rewrite(source, [
        { anchor: '    if (wizardp(victim))\n        return 0;',
            replacement: '    if (wizardp(victim)) {\n'
                + '        "/tests/runner"->observe_npc_corpse(victim, killer, 0);\n'
                + '        return 0;\n    }' },
        { anchor: '        return 0;\n    }\n\n    corpse = new(CORPSE_OB);',
            replacement: '        "/tests/runner"->observe_npc_corpse(victim, killer, 0);\n'
                + '        return 0;\n    }\n\n    corpse = new(CORPSE_OB);' },
        { anchor: '    corpse->make_corpse(victim, killer);\n    return corpse;',
            replacement: '    corpse->make_corpse(victim, killer);\n'
                + '    "/tests/runner"->observe_npc_corpse(victim, killer, corpse);\n'
                + '    return corpse;' },
    ]);
}
