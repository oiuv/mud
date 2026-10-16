// Test-only observations around original commands and natural USER callbacks.
// No original callback, random source or clock is executed by these receivers.
private int is_jiuyang_fusion() {
    return mapp(current) && mapp(current["parameters"]) && current["parameters"]["collection_group"] == "mingjiao-jiuyang-fusion";
}

int is_jiuyang_fusion_observation(object me) {
    return active && is_jiuyang_fusion() && me == players[0] && current["method"] == "yanlian" && current["outcome"] != "error";
}

private mapping jiuyang_fusion_snapshot(object ob, mapping result) {
    object secondary, opponent;
    string key;
    if (!is_jiuyang_fusion()) return result;
    require(member_array(ob, players) != -1, "exact fusion USER snapshot");
    result["race"] = ob->query("race");
    result["effective_int"] = ob->query_int();
    result["effective_dex"] = ob->query_dex();
    result["craze"] = ob->query_craze();
    result["max_craze"] = ob->query_max_craze();
    opponent = ob == players[0] ? players[1] : players[0];
    result["fighting_opponent"] = !!ob->is_fighting(opponent);
    foreach (key in ({ "character", "env/no_learn", "env/auto_regenerate", "doing",
        "tattoo/tattoo_str", "tattoo/tattoo_int", "tattoo/tattoo_con", "tattoo/tattoo_dex",
        "reborn", "can_learn/jiuyang-shengong/enable_weapon" }))
        result["cultivation"][key] = ob->query(key);
    secondary = ob->query_temp("secondary_weapon");
    result["secondary_weapon"] = secondary ? secondary->query("skill_type") : "none";
    result["secondary_weapon_details"] = equipment_snapshot(secondary);
    return result;
}

private mixed *jiuyang_fusion_stack() {
    mixed *objects, *functions, *frames;
    int i;
    objects = call_stack(1);
    functions = call_stack(2);
    require(sizeof(objects) == sizeof(functions), "actual fusion stack dimensions");
    frames = ({});
    for (i = 0; i < sizeof(objects); i++)
        frames += ({ ([ "object": serializable(objects[i]), "function": functions[i] ]) });
    return frames;
}

private mapping jiuyang_fusion_state() {
    mapping temp, parent, presence;
    mixed learned, busy;
    int has_parent;
    object me;
    me = players[0];
    temp = me->query_entire_temp_dbase();
    has_parent = !undefinedp(temp["pending"]);
    parent = has_parent && mapp(temp["pending"]) ? temp["pending"] : ([]);
    presence = ([ "parent_present": has_parent,
        "parent_mappingp": has_parent && mapp(temp["pending"]),
        "parent_raw": has_parent ? serializable(temp["pending"]) : 0,
        "practice_present": !undefinedp(parent["practice"]),
        "practice_raw": serializable(parent["practice"]),
        "skill_present": !undefinedp(parent["practicing_skill"]),
        "skill_raw": serializable(parent["practicing_skill"]) ]);
    learned = me->query_learned();
    busy = me->query_busy();
    return ([ "snapshot": snapshot(me), "learned_raw": serializable(learned),
        "learned_mappingp": mapp(learned),
        "busy_owner": functionp(busy) ? serializable(function_owner(busy)) : 0,
        "busy_repr": functionp(busy) ? sprintf("%O", busy) : 0, "pending": presence ]);
}

private mapping jiuyang_fusion_point() {
    return ([ "elapsed": time_ns() / 1000000000.0 - started,
        "state": jiuyang_fusion_state(), "metrics": players[0]->query_observation(),
        "stack": jiuyang_fusion_stack() ]);
}

private mixed *jiuyang_fusion_messages(int begin) {
    return sizeof(current["skill_messages"]) > begin ? copy(current["skill_messages"][begin..]) : ({});
}

private void begin_jiuyang_fusion_window(string kind, mapping before) {
    require(!mapp(jiuyang_fusion_window), "previous original fusion caller settled");
    jiuyang_fusion_window = ([ "kind": kind, "status": "open",
        "reason": "original caller has not returned", "before": before,
        "events": ({}), "after": jiuyang_fusion_null, "settled": jiuyang_fusion_null ]);
    current["fusion"]["windows"] += ({ jiuyang_fusion_window });
    current["fusion"]["window_messages"] += ({ ([
        "write_actor_observed": kind == "halt" ? 0 : 1,
        "write_actor": kind == "halt" ? jiuyang_fusion_null : serializable(this_player()),
        "messages": ({}) ]) });
    jiuyang_fusion_message_start = sizeof(current["skill_messages"]);
}

void observe_jiuyang_fusion_caller(object me, string phase) {
    if (!is_jiuyang_fusion_observation(me)) return;
    require(previous_object() == me && base_name(me) == "/tests/actor",
        "original fusion USER caller wrapper");
    if (phase == "before") {
        if (!functionp(me->query_busy())) return;
        begin_jiuyang_fusion_window("continue_action", jiuyang_fusion_point());
    } else {
        require(phase == "after", "fusion original caller phase");
        if (mapp(jiuyang_fusion_window))
            jiuyang_fusion_window["after"] = jiuyang_fusion_point();
    }
}

void observe_jiuyang_fusion(object me, string function_name, string phase,
    mixed result, mapping details) {
    object caller;
    caller = previous_object();
    if (!is_jiuyang_fusion_observation(me)) return;
    require(objectp(caller) && base_name(caller) == "/cmds/skill/yanlian" &&
        mapp(jiuyang_fusion_window), "original yanlian probe inside one actual window");
    if (jiuyang_fusion_window["kind"] == "halt" &&
        function_name == "halt_practice" && phase == "enter") {
        // This point is inside force_me, unlike the preceding deferred caller.
        current["fusion"]["window_messages"][<1]["write_actor"] = serializable(this_player());
        current["fusion"]["window_messages"][<1]["write_actor_observed"] = 1;
    }
    jiuyang_fusion_window["events"] += ({ ([
        "index": sizeof(jiuyang_fusion_window["events"]),
        "elapsed": time_ns() / 1000000000.0 - started,
        "actor": file_name(me), "caller": file_name(caller),
        "function": function_name, "phase": phase, "result": serializable(result),
        "details": serializable(details), "state": jiuyang_fusion_state(),
        "stack": jiuyang_fusion_stack() ]) });
}

private int do_jiuyang_fusion_interface() {
    mapping spec;
    mixed result;
    object skill;
    spec = current["parameters"]["interface"];
    require(current["method"] == "interface" && mapp(spec) &&
        spec["object"] == "/kungfu/skill/jiuyang-shengong" &&
        member_array(spec["function"], ({ "get_ready", "query_sub_skills" })) != -1 &&
        this_player() == players[0] && userp(this_player()) && playerp(this_player()) &&
        interactive(this_player()) && !wizardp(this_player()), "original fusion query USER");
    skill = load_object(spec["object"]);
    result = spec["function"] == "get_ready" ? skill->get_ready(players[0]) : skill->query_sub_skills();
    require(this_player() == players[0], "original fusion query returned under USER");
    current["interfaces"] += ({ ([ "object": spec["object"], "function": spec["function"],
        "implemented_by": function_exists(spec["function"], skill),
        "result": serializable(result) ]) });
    return 1;
}

private void perform_jiuyang_fusion() {
    mapping command;
    string action;
    int begin, cost;
    require(jiuyang_fusion_watchdog_seconds == 30, "trusted fusion observation watchdog");
    require(member_array(current["method"], ({ "interface", "yanlian" })) != -1 &&
        userp(players[0]) && playerp(players[0]) && interactive(players[0]) &&
        !wizardp(players[0]) && function_exists("force_me", players[0]) == "/feature/command" &&
        players[0]->find_command("yanlian") == "/cmds/skill/yanlian.c",
        "real USER and original yanlian command owner");
    jiuyang_fusion_window = 0;
    current["actions"] = ({});
    current["directs"] = ({});
    current["skill_messages"] = ({});
    current["fusion"] = ([ "before": jiuyang_fusion_point(),
        "immediate": jiuyang_fusion_null, "after": jiuyang_fusion_null,
        "names": ({ players[0]->name(), players[1]->name() }),
        "room_no_fight": query("no_fight"), "commands": ({}), "windows": ({}),
        "window_messages": ({}), "status": "closed", "reason": "" ]);
    action = current["parameters"]["action"];
    require(action == (current["method"] == "interface" ? "test_interface" :
        "yanlian jiuyang-shengong"), "finite original fusion command");
    begin = sizeof(current["skill_messages"]);
    command = ([ "action": action, "entry_actor": file_name(players[0]),
        "before": copy(current["fusion"]["before"]) ]);
    cost = players[0]->force_me(action);
    require(intp(cost) && cost >= 0 && objectp(players[0]), "actual fusion command cost");
    command["return_actor"] = file_name(players[0]);
    command["cost"] = cost;
    command["after"] = jiuyang_fusion_point();
    command["messages"] = jiuyang_fusion_messages(begin);
    command["interface"] = current["method"] == "interface" ? copy(current["interfaces"][<1]) : jiuyang_fusion_null;
    current["fusion"]["commands"] += ({ command });
    current["fusion"]["immediate"] = copy(command["after"]);
    current["command_accepted"] = cost;
    current["outcome"] = current["method"] == "interface" ? "observed" : "refused";
    current["reason"] = cost ? "" : players[0]->query_temp("notify_fail");
}

private void close_jiuyang_fusion_window() {
    require(mapp(jiuyang_fusion_window) && mapp(jiuyang_fusion_window["after"]),
        "observed original fusion caller return");
    jiuyang_fusion_window["settled"] = jiuyang_fusion_point();
    jiuyang_fusion_window["status"] = "closed";
    jiuyang_fusion_window["reason"] = "";
    current["fusion"]["window_messages"][<1]["messages"] = jiuyang_fusion_messages(jiuyang_fusion_message_start);
    jiuyang_fusion_window = 0;
}

private void halt_jiuyang_fusion() {
    mapping command;
    int begin, cost, busy;
    command = ([ "action": "halt", "entry_actor": file_name(players[0]),
        "before": jiuyang_fusion_point(), "interface": jiuyang_fusion_null ]);
    begin = sizeof(current["skill_messages"]);
    busy = functionp(players[0]->query_busy());
    if (busy) begin_jiuyang_fusion_window("halt", copy(command["before"]));
    cost = players[0]->force_me("halt");
    command["return_actor"] = file_name(players[0]);
    command["cost"] = cost;
    command["after"] = jiuyang_fusion_point();
    if (busy) {
        jiuyang_fusion_window["after"] = copy(command["after"]);
        close_jiuyang_fusion_window();
        command["after"] = copy(current["fusion"]["windows"][<1]["settled"]);
    }
    // Original halt writes belong to its window, not a duplicate command capture.
    command["messages"] = busy ? ({}) : jiuyang_fusion_messages(begin);
    current["fusion"]["commands"] += ({ command });
}

private void finish_jiuyang_fusion() {
    mapping received, message, command, window;
    int i, j;
    mixed reason;
    current["fusion"]["after"] = jiuyang_fusion_point();
    if (current["method"] == "yanlian" && current["command_accepted"] > 0) {
        command = current["fusion"]["commands"][<1];
        window = current["fusion"]["windows"][<1];
        current["outcome"] = players[0]->query_skill(
            "jiuyang-shengong",
            1
        ) > 0 ? "observed" : "refused";
        // A successfully observed original halt is not a failed fusion attempt.
        if (command["action"] == "halt" && command["cost"] > 0 &&
            window["kind"] == "halt" && window["status"] == "closed" &&
            players[0]->query_busy() == 0 && players[0]->query_temp("pending/practice") == 0 &&
            players[0]->query_temp("pending/practicing_skill") == 0)
            current["outcome"] = "observed";
        current["reason"] = "";
        if (current["outcome"] == "refused") {
            // Only actual callback feedback, never the initial acceptance message
            // or a condition's expected refusal, can explain this result.
            for (i = sizeof(current["fusion"]["window_messages"]) - 1; i >= 0; i--) {
                received = current["fusion"]["window_messages"][i];
                for (j = sizeof(received["messages"]) - 1; j >= 0; j--) {
                    message = received["messages"][j];
                    if (message["side"] == 0 &&
                        member_array(message["type"], ({ "write", "tell_object" })) != -1 &&
                        stringp(message["text"]) && message["text"] != "") {
                        reason = message["text"];
                        break;
                    }
                }
                if (stringp(reason) && reason != "") break;
            }
            if (!stringp(reason) || reason == "") {
                current["outcome"] = "error";
                current["reason"] = "fusion refusal feedback not captured after original callbacks";
                current["fusion"]["status"] = "truncated";
                current["fusion"]["reason"] = current["reason"];
            } else current["reason"] = reason;
        }
    }
    finish_sample();
}

void settle_jiuyang_fusion_window() {
    if (!active || !is_jiuyang_fusion() || current["outcome"] == "error") return;
    if (mapp(jiuyang_fusion_window)) close_jiuyang_fusion_window();
    if (mapp(current["parameters"]["interrupt"]) &&
        sizeof(current["fusion"]["commands"]) == 1 &&
        sizeof(current["fusion"]["windows"]) > 0)
        halt_jiuyang_fusion();
    if (!functionp(players[0]->query_busy())) finish_jiuyang_fusion();
}

void finish_jiuyang_fusion_error() {
    if (active && is_jiuyang_fusion() && current["outcome"] == "error") finish_sample();
}

void jiuyang_fusion_watchdog() {
    if (!active || !is_jiuyang_fusion()) return;
    current["outcome"] = "error";
    current["reason"] = "fusion original callback observation exceeded trusted watchdog";
    current["fusion"]["status"] = "truncated";
    current["fusion"]["reason"] = current["reason"];
    finish_jiuyang_fusion_error();
}

private void start_jiuyang_fusion_wait() {
    if (current["method"] != "yanlian" || current["command_accepted"] == 0) {
        finish_jiuyang_fusion();
        return;
    }
    // start_busy installed the original heartbeat. Never call its callback here.
    require(query_heart_beat(players[0]), "original yanlian enabled USER heartbeat");
    call_out("jiuyang_fusion_watchdog", jiuyang_fusion_watchdog_seconds);
}

private void clear_jiuyang_fusion_observation() {
    remove_call_out("jiuyang_fusion_watchdog");
    remove_call_out("settle_jiuyang_fusion_window");
    remove_call_out("finish_jiuyang_fusion_error");
    jiuyang_fusion_window = 0;
}
