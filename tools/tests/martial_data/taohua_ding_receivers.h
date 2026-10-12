// Test-only DING receiver. Original command and daemon timer remain unchanged;
// actual runtime evidence belongs to each separately frozen collection series.
private int is_taohua_ding() {
    return mapp(current) && mapp(current["parameters"]) && current["parameters"]["collection_group"] == "taohua-ding";
}

private mapping taohua_ding_snapshot(object ob, mapping result) {
    object secondary, opponent;
    string key;
    int side;
    if (!is_taohua_ding()) return result;
    side = member_array(ob, players);
    require(side == 0 || side == 1, "exact DING USER snapshot");
    require(mapp(result["cultivation"]), "existing USER cultivation snapshot");
    foreach (key in ({ "character", "family/family_name", "can_perform/tanzhi-shentong/ding" }))
        result["cultivation"][key] = ob->query(key);
    opponent = players[side ? 0 : 1];
    result["fighting_opponent"] = ob->is_fighting(opponent);
    result["ghost"] = ob->is_ghost() ? 1 : 0;
    result["no_perform"] = ob->query_temp("no_perform");
    secondary = ob->query_temp("secondary_weapon");
    result["secondary_weapon"] = secondary ? secondary->query("skill_type") : "none";
    result["secondary_weapon_details"] = equipment_snapshot(secondary);
    return result;
}

// observe_callback must capture previous_object() and call_stack(2)[1]
// in its own entry frame, before this private helper adds an lfun frame.
// Do not pass a guessed owner/function constant to stand in for that read.
private int taohua_ding_callback(object target, string phase, object owner, string function_name) {
    if (!is_taohua_ding() || !active) return 0;
    // The daemon may still have a callback for an already destroyed target
    // from a finished immediate sample. It is not this sample's callback.
    if (!objectp(target) || target != players[1]) return 1;
    require(objectp(owner) && owner == previous_object() &&
        base_name(owner) == "/kungfu/skill/tanzhi-shentong/ding",
        "actual DING callback owner");
    require(function_name == "ding_end", "actual DING caller function");
    require(phase == "before" || phase == "after", "original DING callback phase");
    require(current["parameters"]["observe_seconds"] == 6, "declared DING natural window");
    current["callbacks"] += ({ ([
        "owner": base_name(owner),
        "function": function_name,
        "side": 1,
        "phase": phase,
        "elapsed": time_ns() / 1000000000.0 - started,
        "state": snapshot(target)
    ]) });
    return 1;
}
