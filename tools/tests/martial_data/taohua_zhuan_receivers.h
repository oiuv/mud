// Test-only, read-only snapshots of the original ZHUAN participants and death result.
private int is_taohua_zhuan() {
    return mapp(current) && mapp(current["parameters"]) && current["parameters"]["collection_group"] == "taohua-zhuan";
}

private mapping taohua_zhuan_snapshot(object ob, mapping result) {
    mapping skills;
    mixed learned, conditions;
    object secondary;
    int side;
    string key;

    if (!is_taohua_zhuan()) return result;
    side = member_array(ob, players);
    require(side == 0 || side == 1, "exact ZHUAN USER snapshot");
    require(mapp(result["cultivation"]), "existing ZHUAN cultivation snapshot");
    skills = ob->query_skills();
    require(mapp(skills), "original ZHUAN skills mapping");
    result["skill_order"] = keys(skills);
    foreach (key in ({ "family/family_name", "can_perform/tanzhi-shentong/zhuan" }))
        result["cultivation"][key] = ob->query(key);
    foreach (key in ({ "score", "experience", "learned_experience" }))
        result[key] = ob->query(key);
    result["fighting_opponent"] = ob->is_fighting(players[side ? 0 : 1]) ? 1 : 0;
    result["ghost"] = ob->is_ghost() ? 1 : 0;
    result["environment"] = objectp(environment(ob)) ? file_name(environment(ob)) : "";
    secondary = ob->query_temp("secondary_weapon");
    result["secondary_weapon"] = secondary ? secondary->query("skill_type") : "none";
    result["secondary_weapon_details"] = equipment_snapshot(secondary);
    learned = ob->query_learned();
    result["learned_is_mapping"] = mapp(learned) ? 1 : 0;
    result["learned_raw"] = serializable(learned);
    conditions = ob->query_condition();
    result["conditions"] = serializable(conditions);
    result["conditions_is_mapping"] = mapp(conditions) ? 1 : 0;
    result["combat_pks"] = ob->query("combat/PKS");
    result["combat_wanted_pks"] = ob->query("combat/WPK");
    return result;
}

// Call before the original command, while the exact victim and sword are unchanged.
private mapping taohua_zhuan_death_before(object target, object killer) {
    mapping result;
    mixed learned, conditions, combat, wanted_pks;
    object weapon;
    int wanted_pks_has_member, wanted_pks_count;

    require(is_taohua_zhuan() && target == players[1] && killer == players[0],
        "exact ZHUAN death baseline pair");
    learned = target->query_learned();
    conditions = target->query_condition();
    require(!conditions || mapp(conditions), "original ZHUAN conditions baseline");
    weapon = target->query_temp("weapon");
    combat = killer->query("combat");
    wanted_pks = killer->query("combat/WPK");
    require(mapp(combat) || undefinedp(combat), "original ZHUAN combat baseline shape");
    wanted_pks_has_member = mapp(combat) && member_array("WPK", keys(combat)) != -1 ? 1 : 0;
    if (undefinedp(wanted_pks)) {
        require(!wanted_pks_has_member, "absent original ZHUAN wanted count baseline");
        wanted_pks_count = 0;
    } else {
        require(wanted_pks_has_member && !undefinedp(combat["WPK"]) &&
            intp(combat["WPK"]) && combat["WPK"] >= 0 && intp(wanted_pks) &&
            wanted_pks >= 0 && wanted_pks == combat["WPK"],
            "defined original ZHUAN wanted count baseline");
        wanted_pks_count = 0 + wanted_pks;
    }
    result = ([ "target": file_name(target), "killer": file_name(killer),
        "target_environment_before": objectp(environment(target)) ?
        file_name(environment(target)) : "",
        "weapon_before": equipment_snapshot(weapon),
        "learned_was_mapping": mapp(learned) ? 1 : 0,
        "learned_before_raw": serializable(learned),
        "conditions_before_raw": serializable(conditions),
        "conditions_before_was_mapping": mapp(conditions) ? 1 : 0,
        "conditions_before": mapp(conditions) ? serializable(conditions) : ([]),
        "killer_pks_before": killer->query("combat/PKS"),
        "killer_combat_before_raw": serializable(combat),
        "killer_combat_before_was_mapping": mapp(combat) ? 1 : 0,
        "killer_wanted_pks_before_has_member": wanted_pks_has_member,
        "killer_wanted_pks_before_undefined": undefinedp(wanted_pks) ? 1 : 0,
        "killer_wanted_pks_before_count": wanted_pks_count,
        "killer_wanted_pks_before": wanted_pks,
        "killer_experience_before": killer->query("experience") ]);
    return result;
}

// The caller captures corpse from the original CHAR_D return and invokes this only
// after force_me returns. No terminal notification ends the original perform stack.
private mapping taohua_zhuan_death_snapshot(
    object target,
    object killer,
    object corpse,
    object weapon,
    mapping before
) {
    mapping result, corpse_details, weapon_details;
    mixed conditions, combat, wanted_pks;
    object item, carrier;
    string key;
    string *inventory;
    int wanted_pks_has_member, wanted_pks_count;

    require(is_taohua_zhuan() && target == players[1] && killer == players[0],
        "exact ZHUAN death result pair");
    require(mapp(before) && before["target"] == file_name(target) &&
        before["killer"] == file_name(killer), "same ZHUAN death baseline");
    require(target->is_ghost(), "completed original ZHUAN USER death");
    require(objectp(corpse) && base_name(corpse) == "/clone/misc/corpse",
        "original ZHUAN corpse return");
    require(objectp(weapon) && mapp(before["weapon_before"]) &&
        before["weapon_before"]["object"] == file_name(weapon),
        "same ZHUAN target weapon reference");

    weapon_details = equipment_snapshot(weapon);
    carrier = environment(weapon);
    weapon_details["environment"] = objectp(carrier) ? file_name(carrier) : "";
    weapon_details["equipped"] = weapon->query("equipped");
    inventory = ({});
    foreach (item in all_inventory(corpse)) inventory += ({ file_name(item) });
    carrier = environment(corpse);
    corpse_details = ([ "object": file_name(corpse), "program": base_name(corpse),
        "environment": objectp(carrier) ? file_name(carrier) : "",
        "inventory": inventory, "weight": corpse->query_weight(),
        "encumbrance": corpse->query_encumbrance(),
        "max_encumbrance": corpse->query_max_encumbrance(),
        "is_corpse": corpse->is_corpse(), "is_container": corpse->is_container() ]);
    foreach (key in ({ "name", "id", "class", "age", "gender", "victim_name", "owner_id",
        "is_player", "killed_by", "defeated_by", "defeated_by_who", "assist" }))
        corpse_details[key] = serializable(corpse->query(key));
    conditions = target->query_condition();
    require(!conditions || mapp(conditions), "original ZHUAN conditions after death");
    combat = killer->query("combat");
    wanted_pks = killer->query("combat/WPK");
    require(mapp(combat) || undefinedp(combat), "original ZHUAN combat result shape");
    wanted_pks_has_member = mapp(combat) && member_array("WPK", keys(combat)) != -1 ? 1 : 0;
    if (undefinedp(wanted_pks)) {
        require(!wanted_pks_has_member, "absent original ZHUAN wanted count result");
        wanted_pks_count = 0;
    } else {
        require(wanted_pks_has_member && !undefinedp(combat["WPK"]) &&
            intp(combat["WPK"]) && combat["WPK"] >= 0 && intp(wanted_pks) &&
            wanted_pks >= 0 && wanted_pks == combat["WPK"],
            "defined original ZHUAN wanted count result");
        wanted_pks_count = 0 + wanted_pks;
    }
    result = serializable(before);
    result += ([ "corpse": file_name(corpse), "corpse_details": corpse_details,
        "weapon": weapon_details,
        "target_environment": objectp(environment(target)) ?
        file_name(environment(target)) : "",
        "conditions_after_raw": serializable(conditions),
        "conditions_after_was_mapping": mapp(conditions) ? 1 : 0,
        "conditions_after": mapp(conditions) ? serializable(conditions) : ([]),
        "killer_pks_after": killer->query("combat/PKS"),
        "killer_combat_after_raw": serializable(combat),
        "killer_combat_after_was_mapping": mapp(combat) ? 1 : 0,
        "killer_wanted_pks_after_has_member": wanted_pks_has_member,
        "killer_wanted_pks_after_undefined": undefinedp(wanted_pks) ? 1 : 0,
        "killer_wanted_pks_after_count": wanted_pks_count,
        "killer_wanted_pks_after": wanted_pks,
        "killer_experience_after": killer->query("experience"),
        "killer_pks_delta": killer->query("combat/PKS") - before["killer_pks_before"],
        "killer_wanted_pks_delta": wanted_pks_count - before["killer_wanted_pks_before_count"],
        "killer_experience_delta": killer->query("experience") - before["killer_experience_before"]]);
    return result;
}
