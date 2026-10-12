// Test-only, read-only context for the original XIAO command.
private int is_taohua_xiao() {
    return mapp(current) && mapp(current["parameters"]) && current["parameters"]["collection_group"] == "taohua-xiao";
}

private mapping taohua_xiao_snapshot(object ob, mapping result) {
    object secondary, opponent;
    string key;
    int side;
    if (!is_taohua_xiao()) return result;
    side = member_array(ob, players);
    require(side == 0 || side == 1, "exact XIAO USER snapshot");
    require(mapp(result["cultivation"]), "existing USER cultivation snapshot");
    foreach (key in ({ "family/family_name", "can_perform/tanzhi-shentong/xiao" }))
        result["cultivation"][key] = ob->query(key);
    opponent = players[side ? 0 : 1];
    result["fighting_opponent"] = ob->is_fighting(opponent);
    result["ghost"] = ob->is_ghost() ? 1 : 0;
    secondary = ob->query_temp("secondary_weapon");
    result["secondary_weapon"] = secondary ? secondary->query("skill_type") : "none";
    result["secondary_weapon_details"] = equipment_snapshot(secondary);
    return result;
}
