// Test-only, read-only snapshots of the original PO participants and weapon carrier.
private int is_taohua_po() {
    return mapp(current) && mapp(current["parameters"]) && current["parameters"]["collection_group"] == "taohua-po";
}

private mapping taohua_po_snapshot(object ob, mapping result) {
    object secondary;
    int side;
    string key;
    if (!is_taohua_po()) return result;
    side = member_array(ob, players);
    require(side == 0 || side == 1, "exact PO USER snapshot");
    require(mapp(result["cultivation"]), "existing USER cultivation snapshot");
    foreach (key in ({ "family/family_name", "can_perform/tanzhi-shentong/po" }))
        result["cultivation"][key] = ob->query(key);
    result["fighting_opponent"] = ob->is_fighting(players[side ? 0 : 1]);
    result["ghost"] = ob->is_ghost() ? 1 : 0;
    secondary = ob->query_temp("secondary_weapon");
    result["secondary_weapon"] = secondary ? secondary->query("skill_type") : "none";
    result["secondary_weapon_details"] = equipment_snapshot(secondary);
    return result;
}

private void observe_taohua_po_weapon(string phase) {
    mapping result;
    object carrier;
    if (!is_taohua_po() || !mapp(current["po_equipment"])) return;
    require(member_array(phase, ({ "before", "immediate", "after" })) != -1, "PO weapon phase");
    result = equipment_snapshot(taohua_po_target_weapon);
    if (objectp(taohua_po_target_weapon)) {
        carrier = environment(taohua_po_target_weapon);
        result["environment"] = objectp(carrier) ? file_name(carrier) : "";
        result["equipped"] = taohua_po_target_weapon->query("equipped");
    }
    current["po_equipment"]["target_weapon"][phase] = result;
}
