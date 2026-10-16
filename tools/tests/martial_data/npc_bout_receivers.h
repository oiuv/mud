// Included by the isolated Runner only. No original NPC behavior is replaced.
private int npc_bout_pending_choice = -1;
private int npc_bout_pending_round = -1;
private int *npc_bout_beats = ({ -1, -1 });
private object *npc_bout_corpses = ({});
private mapping npc_bout_corpse_victims = ([]);

int is_npc_bout_group() {
    return member_array(current["parameters"]["collection_group"],
        ({ "gumu-npc-bout", "mingjiao-npc-bout" })) != -1;
}

int is_npc_bout() {
    return active && is_npc_bout_group();
}

int npc_bout_side(object ob) {
    if (!objectp(ob)) return -2;
    if (ob == gumu_npc) return -1;
    if (ob == players[0]) return 0;
    return -2;
}

mapping npc_bout_state(object ob) {
    if (!objectp(ob)) return 0;
    return ob == gumu_npc ? "/tests/npc_observer"->gumu_bout_state(ob) : snapshot(ob);
}

mapping npc_bout_identity(object ob) {
    int side;
    side = npc_bout_side(ob);
    require(side == -1 || side == 0, "exact natural NPC bout participant");
    return ([ "actor": side, "actor_object": file_name(ob) ]);
}

void npc_bout_count(object ob, string key) {
    if (is_npc_bout() && ob == gumu_npc) current["npc_bout"]["npc_metrics"][key]++;
}

void initialize_npc_bout() {
    mapping metrics;
    string key;
    require(is_npc_bout() && objectp(gumu_npc), "original NPC prepared before bout");
    metrics = ([]);
    foreach (key in ({ "heartbeats", "scans", "chats", "choices", "hit", "dodge", "parry",
        "quick", "riposte", "direct", "rounds", "force", "martial" })) metrics[key] = 0;
    current["npc_bout"] = ([ "npc_object": file_name(gumu_npc),
        "user_object": file_name(players[0]), "bystander_object": file_name(players[1]),
        "bystander_room": file_name(environment(players[1])),
        "npc_gross_resources": "not_observed", "first_actor": -2,
        "duration_limit_seconds": current["parameters"]["observe_seconds"],
        "terminal": "time_limit", "winner": "none", "heartbeats": ({}),
        "chat_choices": ({}), "terminal_events": ({}), "corpse_returns": ({}),
        "corpses": ({}), "npc_metrics": metrics ]);
    npc_bout_pending_choice = -1;
    npc_bout_pending_round = -1;
    npc_bout_beats = ({ -1, -1 });
    npc_bout_corpses = ({});
    npc_bout_corpse_victims = ([]);
    observed = started;
    busy_seconds = ({ 0.0, 0.0 });
    busy_state = ({ 0, 0 });
    current["second_started"] = 0;
    if (current["index"] % 2) players[0]->observation_heartbeat(1);
    else evaluate(bind((: set_heart_beat, 1 :), gumu_npc));
}

void record_npc_bout_heartbeat(object ob) {
    mapping event, bout;
    int side;
    if (!is_npc_bout() || (side = npc_bout_side(ob)) == -2) return;
    bout = current["npc_bout"];
    event = npc_bout_identity(ob);
    event["elapsed"] = time_ns() / 1000000000.0 - started;
    event["busy"] = serializable(ob->query_busy());
    npc_bout_beats[side + 1] = sizeof(bout["heartbeats"]);
    if (!sizeof(bout["heartbeats"])) {
        require(side == (current["index"] % 2 ? 0 : -1), "actual alternating NPC bout opening");
        bout["first_actor"] = side;
    }
    bout["heartbeats"] += ({ event });
    npc_bout_count(ob, "heartbeats");
    if (side == -1 && !current["second_started"]) {
        current["second_started"] = 1;
        players[0]->observation_heartbeat(1);
    }
}

void observe_npc_heartbeat(object ob) {
    if (is_npc_bout() && ob == gumu_npc) record_npc_bout_heartbeat(ob);
}

void observe_npc_scan(object ob) {
    if (is_npc_bout() && ob == gumu_npc) npc_bout_count(ob, "scans");
}

void observe_npc_chat(object ob) {
    if (is_npc_bout() && ob == gumu_npc) npc_bout_count(ob, "chats");
}

void observe_npc_choice(object ob, int index, function fun, string phase, mixed result) {
    mapping event, bout;
    if (!is_npc_bout() || ob != gumu_npc) return;
    bout = current["npc_bout"];
    if (phase == "before") {
        if (!ob->is_fighting(players[0])) return;
        require(npc_bout_pending_choice == -1 && function_owner(fun) == ob,
            "original NPC closure selected once");
        event = npc_bout_identity(ob);
        event += ([ "target": 0, "target_object": file_name(players[0]),
            "heartbeat_index": npc_bout_beats[0], "elapsed": time_ns() / 1000000000.0 - started,
            "busy": serializable(ob->query_busy()), "fighting": ob->is_fighting(players[0]),
            "index": index, "owner": file_name(function_owner(fun)), "repr": sprintf("%O", fun),
            "return_observation": "pending", "terminal_event_index": -1 ]);
        if (current["parameters"]["collection_group"] == "mingjiao-npc-bout")
            event["before_state"] = npc_bout_state(ob);
        npc_bout_pending_choice = sizeof(bout["chat_choices"]);
        bout["chat_choices"] += ({ event });
        npc_bout_count(ob, "choices");
        return;
    }
    if (phase == "after" && npc_bout_pending_choice < 0) return;
    require(
        phase == "after" && npc_bout_pending_choice >= 0,
        "original closure after matches before"
    );
    event = bout["chat_choices"][npc_bout_pending_choice];
    require(
        event["index"] == index && event["owner"] == file_name(ob),
        "same selected closure return"
    );
    event["result"] = serializable(result);
    if (current["parameters"]["collection_group"] == "mingjiao-npc-bout")
        event["after_state"] = npc_bout_state(ob);
    event["return_observation"] = "observed";
    event["terminal_event_index"] = -1;
    npc_bout_pending_choice = -1;
}

void observe_npc_round(object ob, string phase, int result) {
    mapping event;
    int side, index;
    if (!is_npc_bout() || ob != gumu_npc) return;
    side = -1;
    if (phase == "before") {
        require(npc_bout_pending_round == -1,
            "one original heartbeat attack per actor");
        event = npc_bout_identity(ob);
        event += ([ "before": ob->query_temp("combat_time") + 0,
            "heartbeat_index": npc_bout_beats[side + 1], "elapsed": time_ns() / 1000000000.0 - started,
            "return_observation": "pending", "terminal_event_index": -1 ]);
        index = sizeof(current["attack_rounds"]);
        npc_bout_pending_round = index;
        current["attack_rounds"] += ({ event });
        npc_bout_count(ob, "rounds");
        return;
    }
    index = npc_bout_pending_round;
    require(phase == "after" && index >= 0, "original heartbeat attack return");
    event = current["attack_rounds"][index];
    event["result"] = result;
    event["after"] = ob->query_temp("combat_time") + 0;
    event["return_observation"] = "observed";
    event["terminal_event_index"] = -1;
    npc_bout_pending_round = -1;
}

void observe_npc_bout_user_round(object ob, int before, int result) {
    mapping event;
    if (!is_npc_bout() || ob != players[0]) return;
    event = npc_bout_identity(ob);
    // The first USER counter is undefined before its original increment.
    // Preserve its numeric zero meaning explicitly; adding zero can retain
    // the driver's undefined subtype through the wrapper's int argument.
    event += ([ "before": before ? before : 0, "after": ob->query_temp("combat_time") + 0, "result": result,
        "heartbeat_index": npc_bout_beats[1], "elapsed": time_ns() / 1000000000.0 - started,
        "return_observation": "observed", "terminal_event_index": -1 ]);
    current["attack_rounds"] += ({ event });
    ob->count_event("rounds");
}

void observe_npc_terminal(object ob, string kind) {
    mapping event, bout;
    int side, index;
    if (!is_npc_bout() || (side = npc_bout_side(ob)) == -2) return;
    bout = current["npc_bout"];
    event = npc_bout_identity(ob);
    event += ([ "kind": kind, "elapsed": time_ns() / 1000000000.0 - started,
        "state_before": npc_bout_state(ob), "heartbeat_index": sizeof(bout["heartbeats"]) - 1,
        "pending_choice_index": -1, "pending_round_index": -1 ]);
    index = sizeof(bout["terminal_events"]);
    if (side == -1 && kind == "death") {
        event["pending_choice_index"] = npc_bout_pending_choice;
        event["pending_round_index"] = npc_bout_pending_round;
        if (npc_bout_pending_choice >= 0)
            bout["chat_choices"][npc_bout_pending_choice]["terminal_event_index"] = index;
        if (npc_bout_pending_round >= 0)
            current["attack_rounds"][npc_bout_pending_round]["terminal_event_index"] = index;
    }
    bout["terminal_events"] += ({ event });
    // This observes an entry, not completed death. Never destroy an active
    // caller or stop the original death/corpse/reward stack synchronously.
    call_out("finish_sample", 0);
}

void observe_npc_corpse(object victim, object killer, object corpse) {
    mapping bout;
    if (observe_taohua_zhuan_corpse(victim, killer, corpse)) return;
    if (!is_npc_bout() || npc_bout_side(victim) == -2) return;
    bout = current["npc_bout"];
    bout["corpse_returns"] += ({ ([
        "victim_object": file_name(victim),
        "killer_object": serializable(killer),
        "result": serializable(corpse)
    ]) });
    if (!objectp(corpse)) return;
    require(member_array(corpse, npc_bout_corpses) == -1, "original corpse return observed once");
    npc_bout_corpses += ({ corpse });
    npc_bout_corpse_victims[file_name(corpse)] = file_name(victim);
    "/tests/npc_observer"->own_gumu_bout_corpse(corpse);
}

void finish_npc_bout_observation() {
    mapping bout, event;
    object corpse, item;
    string name;
    mixed *inventory;
    int index;
    bout = current["npc_bout"];
    if (!mapp(bout)) {
        current["npc_observation"] = "/tests/npc_observer"->clear_gumu_bout();
        current["after"] = ({ snapshot(players[0]), snapshot(players[1]) });
        current["metrics"] = ({ players[0]->query_observation(), players[1]->query_observation() });
        gumu_npc = 0;
        gumu_npc_pending = 0;
        return;
    }
    sample_busy();
    bout["busy_seconds"] = ([ "npc": busy_seconds[0], "user": busy_seconds[1] ]);
    if (sizeof(bout["terminal_events"])) {
        event = bout["terminal_events"][<1];
        bout["terminal"] = event["kind"];
        bout["winner"] = event["actor"] == -1 ? "user" : "npc";
    }
    foreach (event in bout["chat_choices"] + current["attack_rounds"]) {
        if (current["outcome"] == "error") continue;
        if (event["return_observation"] != "pending") continue;
        index = event["terminal_event_index"];
        require(!objectp(gumu_npc) && event["actor"] == -1 && index >= 0 &&
            bout["terminal_events"][index]["kind"] == "death", "pending return requires actual original NPC death");
        event["return_observation"] = "not_observed";
        event["result"] = "not_observed";
        if (!undefinedp(event["before"])) event["after"] = "not_observed";
        if (current["parameters"]["collection_group"] == "mingjiao-npc-bout" &&
            !undefinedp(event["before_state"])) event["after_state"] = json_decode("null");
    }
    foreach (corpse in npc_bout_corpses) {
        require(objectp(corpse), "returned corpse remains observable before cleanup");
        name = file_name(corpse);
        inventory = ({});
        foreach (item in all_inventory(corpse)) inventory += ({ file_name(item) });
        bout["corpses"] += ({ ([ "object": name, "program": base_name(corpse),
            "victim_object": npc_bout_corpse_victims[name], "origin": "original_make_corpse_return",
            "environment": file_name(environment(corpse)), "inventory_objects": inventory ]) });
    }
    current["npc_observation"] = "/tests/npc_observer"->capture_gumu_bout();
    current["after"] = ({ snapshot(players[0]), snapshot(players[1]) });
    current["metrics"] = ({ players[0]->query_observation(), players[1]->query_observation() });
    current["npc_observation"] = "/tests/npc_observer"->clear_gumu_bout();
    gumu_npc = 0;
    gumu_npc_pending = 0;
}
