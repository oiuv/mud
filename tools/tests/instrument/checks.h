void clear_instruments(object actor) {
    object item;
    foreach (item in all_inventory(actor)) destruct(item);
}

// Compare all output tiers using the actual action -> MI -> skill chain.
mixed *check_play(string path, mapping row) {
    object actor, item;
    mapping techniques;
    mixed *results;
    string mode, technique, song, line, text;
    int level, expected, with_id;

    techniques = ([ "qin": "tanqin-jifa", "xiao": "chuixiao-jifa", "zheng": "guzheng-jifa" ]);
    technique = techniques[row["family"]];
    song = "test-" + row["family"];
    results = ({});
    foreach (mode in ({ "empty", "wrong_id", "unlearned", "wrong_song", "busy",
        "1", "14", "15", "29", "30", "59", "60", "89", "90", "149",
        "150", "224", "225", "299", "300", "technique_bonus" })) {
        actor = new("/tests/instrument_actor"); actor->move(this_object(), 1);
        item = new(path); item->move(actor, 1);
        expected = sscanf(mode, "%d", level) == 1 || mode == "technique_bonus";
        actor->set_skill(song, expected && mode != "technique_bonus" ? level : 100);
        if (mode == "technique_bonus") {
            actor->set_skill(song, 1); actor->set_skill(technique, 598);
        }
        if (mode == "unlearned") actor->set_skill(song, 0);
        if (mode == "wrong_song") actor->set_skill(
            "test-" + (row["family"] == "qin" ? "xiao" : "qin"),
            100
        );
        if (mode == "busy") actor->start_busy(9);
        line = "play " + song;
        if (mode == "empty") line = "play";
        if (mode == "wrong_id") line += " with nonexistent instrument";
        if (mode == "wrong_song") line = "play test-" + (row["family"] == "qin" ? "xiao" : "qin");
        if (expected && mode != "1") line += " with " + item->query("id");
        master()->clear_music();
        actor->run_command(line);
        text = master()->query_music_text();
        check(actor->query_effects() == expected, "play " + mode + " effect " + path);
        if (expected) {
            check(actor->query_busy() >= 3 && actor->query_busy() <= 5, "original busy interval");
            check(
                master()->query_music_instrument() == item && stringp(text),
                "original action registered"
            );
        } else check(
            actor->query_busy() == (mode == "busy" ? 9 : 0) && !text,
            "rejected play has no side effects"
        );
        results += ({ ({ mode, actor->query_effects(), text }) });
        clear_instruments(actor); destruct(actor);
    }
    return results;
}

void check_instrument_storage(mapping row) {
    object actor, item, converter;
    mapping records, result;
    string path;

    foreach (path in ({ row["old_path"], row["new_path"] })) {
        actor = new("/tests/instrument_actor"); actor->move(this_object(), 1);
        item = new(path); item->move(actor, 1);
        actor->run_command("cun " + item->query("id"));
        check(
            !item && actor->depot_records()["item0"]["file"] == path,
            "store exact identity " + path
        );
        actor->run_command("qu 1 1");
        check(
            sizeof(all_inventory(actor)) == 1 && !sizeof(actor->depot_records()),
            "real qu restores quantity"
        );
        if (sizeof(all_inventory(actor))) {
            item = all_inventory(actor)[0];
            check(base_name(item) == path, "restored identity"); check_instrument(item, row);
        }
        clear_instruments(actor);
        item = new(path); item->set_temp("test", 1); item->move(actor, 1);
        actor->store_item(actor, item, 1);
        check(item && !sizeof(actor->depot_records()), "temporary state remains refused");
        clear_instruments(actor); destruct(actor);
    }
    converter = load_object("/tests/cloth_records");
    records = ([ "item0": ([
        "file": row["old_path"],
        "amount": 2,
        "name": "旧乐器",
        "id": "instrument"
    ]) ]);
    result = converter->convert(save_variable(records), "backpack",
        json_decode(read_file("/tests/migration_paths.json")), ({}));
    check(result["changes"] == 1, "old instrument record converted");
    write_file("/data/instrument-restored.o", "my_depot " + result["value"] + "\n", 1);
    actor = new("/tests/instrument_actor"); actor->move(this_object(), 1);
    actor->load_backup("/data/instrument-restored"); actor->run_command("qu 1 2");
    check(
        sizeof(all_inventory(actor)) == 2 && !sizeof(actor->depot_records()),
        "converted quantity restored"
    );
    foreach (item in all_inventory(actor)) {
        check(
            base_name(item) == row["new_path"],
            "canonical recovery"
        ); check_instrument(item, row);
    }
    clear_instruments(actor); destruct(actor);
}

void check_instrument_contracts() {
    object provider, item, actor;
    mixed err;
    string family;

    foreach (family in ({ "qin", "xiao", "zheng" })) {
        provider = load_object("/d/items/" + family);
        check(!provider->query("name") && !environment(provider), "inert provider");
        item = 0; err = catch(item = new("/d/items/" + family + "/missing"));
        check(!item && !find_object("/d/items/" + family + "/missing"), "unknown ID rejected");
        err = catch(new("/d/items/" + family, "missing")); check(!!err, "direct creation rejected");
        check(!provider->valid_variety_path("/d/items/" + family + "/missing") &&
            !provider->valid_variety_path("/d/items/" + family + "/../muqin"), "exact registry only");
    }
    actor = new("/tests/instrument_actor");
    item = new("/tests/unknown_instrument/key");
    actor->store_item(actor, item, 1);
    check(item && !sizeof(actor->depot_records()), "other virtual objects not admitted");
    destruct(item); destruct(actor);
}

void check_multiple_instruments() {
    object actor, a, b, c;
    int version;
    string *paths;
    mixed *result;

    result = ({});
    for (version = 0; version < 2; version++) {
        paths = version ? ({
            "/d/items/qin/muqin",
            "/d/items/qin/huqin",
            "/d/items/xiao/zhuxiao3"
        }) : ({ "/d/changan/npc/obj/muqin", "/d/hengyang/npc/obj/huqin", "/d/taohua/obj/zhuxiao" });
        actor = new("/tests/instrument_actor"); actor->move(this_object(), 1);
        actor->set_skill("test-qin", 100); actor->set_skill("test-xiao", 100);
        a = new(paths[0]); b = new(paths[1]); c = new(paths[2]);
        a->move(actor, 1); b->move(actor, 1); c->move(actor, 1);
        master()->clear_music(); actor->run_command("play test-qin with muqin");
        check(
            actor->query_effects() == 1 && master()->query_music_instrument() == a,
            "with chooses exact instrument"
        );
        actor->start_busy(0); actor->run_command("play test-xiao with zhuxiao");
        check(
            actor->query_effects() == 2 && master()->query_music_instrument() == c,
            "with chooses other family"
        );
        actor->start_busy(0); master()->clear_music(); actor->run_command("play test-qin");
        check(actor->query_effects() == 3, "bare play executes only once");
        result += ({ ({
            master()->query_music_text(),
            master()->query_music_instrument()->query("id")
        }) });
        clear_instruments(actor); destruct(actor);
    }
    check(same_value(result[0], result[1]), "bare play dispatch order unchanged");
}
