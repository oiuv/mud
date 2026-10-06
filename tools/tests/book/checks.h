void clear_books(object actor) {
    object item;

    foreach (item in all_inventory(actor)) destruct(item);
}

void check_study(string path) {
    object actor, item;
    mapping skill;
    string mode, name, required;
    int cost, expected, gained;

    foreach (mode in ({ "success", "upper_equal", "upper", "lower", "experience", "illiterate",
        "exhausted", "need", "busy", "fight", "no_fight", "pigging", "cooldown",
        "deny_skill", "deny_learn", "deny_improve", "clever" })) {
        actor = new("/tests/book_actor"); actor->move(this_object(), 1);
        item = new(path); item->move(actor, 1); skill = item->query("skill"); name = skill["name"];
        actor->set("int", 20); actor->set("combat_exp", 100000000); actor->set("jing", 10000);
        actor->set_skill("literate", 100); actor->set_skill(name, skill["min_skill"]);
        if (mapp(skill["need"])) foreach (required in keys(skill["need"]))
            actor->set_skill(required, skill["need"][required]);
        cost = (skill["jing_cost"] * 20 + skill["difficulty"] - 20) / 20;
        if (cost < 10) cost = 10;
        expected = 0;
        if (mode == "success" || mode == "clever" || mode == "upper_equal") expected = 11;
        if (mode == "upper_equal") actor->set_skill(name, skill["max_skill"]);
        if (mode == "upper") actor->set_skill(name, skill["max_skill"] + 1);
        if (mode == "lower") {
            if (!skill["min_skill"]) { clear_books(actor); destruct(actor); continue; }
            actor->set_skill(name, skill["min_skill"] - 1);
        }
        if (mode == "experience") {
            if (!skill["exp_required"]) { clear_books(actor); destruct(actor); continue; }
            actor->set("combat_exp", skill["exp_required"] - 1);
        }
        if (mode == "illiterate") actor->set_skill("literate", 0);
        if (mode == "exhausted") actor->set("jing", cost);
        if (mode == "need") {
            if (!mapp(skill["need"])) { clear_books(actor); destruct(actor); continue; }
            foreach (required in keys(skill["need"])) actor->set_skill(
                required,
                skill["need"][required] - 1
            );
        }
        if (mode == "busy") actor->set("test/busy", 1);
        if (mode == "fight") actor->set("test/fighting", 1);
        if (mode == "no_fight") set("no_fight", 1);
        if (mode == "pigging") set("pigging", 1);
        if (mode == "cooldown") actor->set_temp("time/study", time());
        if (strsrch(mode, "deny_") == 0) actor->set("test/" + mode, 1);
        if (mode == "clever") { actor->set("special_skill/clever", 1); expected = 21; }
        actor->run_command("teststudy " + item->query("id") + " 1");
        gained = actor->gained(name);
        check(gained == expected, "study " + mode + " gain " + path);
        check(actor->query("jing") == (mode == "exhausted" ? 0 : expected ? 10000 - cost : 10000),
            "study " + mode + " original cost " + path);
        delete("no_fight"); delete("pigging"); clear_books(actor); destruct(actor);
    }
}

void check_book_storage(mapping row) {
    object actor, item, converter;
    string path;
    mapping records, result;
    int allowed;

    allowed = -1;
    foreach (path in ({ row["old_path"], row["new_path"] })) {
        actor = new("/tests/book_actor"); actor->move(this_object(), 1);
        item = new(path); item->move(actor, 1);
        actor->run_command("cun " + item->query("id"));
        if (allowed < 0) allowed = !objectp(item);
        else check(allowed == !objectp(item), "same storage eligibility " + path);
        check(allowed, "ordinary book originally storable " + path);
        if (!item) {
            check(actor->depot_records()["item0"]["file"] == path, "stored exact path");
            actor->run_command("qu 1 1");
            check(
                sizeof(all_inventory(actor)) == 1 && !sizeof(actor->depot_records()),
                "real store/qu"
            );
            if (sizeof(all_inventory(actor))) {
                item = all_inventory(actor)[0];
                check(base_name(item) == path, "restored exact identity"); check_random(item, row);
            }
        }
        clear_books(actor); destruct(actor);
        actor = new("/tests/book_actor"); actor->move(this_object(), 1);
        item = new(path); item->set_temp("test", 1); item->move(actor, 1);
        actor->store_item(actor, item, 1);
        check(objectp(item) && !sizeof(actor->depot_records()), "temporary state remains refused");
        clear_books(actor); destruct(actor);
    }
    actor = new("/tests/book_actor"); actor->move(this_object(), 1);
    converter = load_object("/tests/cloth_records");
    records = ([ "item0": ([ "file": row["old_path"], "amount": 2, "name": "旧书", "id": "book" ]) ]);
    result = converter->convert(
        save_variable(records),
        "backpack",
        json_decode(read_file("/tests/migration_paths.json")),
        ({})
    );
    check(result["changes"] == 1, "old book record converted");
    write_file("/data/book-restored.o", "my_depot " + result["value"] + "\n", 1);
    actor->load_backup("/data/book-restored"); actor->run_command("qu 1 2");
    check(
        sizeof(all_inventory(actor)) == 2 && !sizeof(actor->depot_records()),
        "converted quantity restored"
    );
    foreach (item in all_inventory(actor)) {
        check(
            base_name(item) == row["new_path"],
            "converted canonical identity"
        ); check_random(item, row);
    }
    clear_books(actor); destruct(actor);
}

void check_retained() {
    object actor, item;
    mixed err;

    actor = new("/tests/book_actor"); actor->move(this_object(), 1);
    item = new("/d/city/npc/obj/lbook3"); check(
        item->query_autoload() == 1,
        "retained auto-load"
    ); destruct(item);
    item = 0; err = catch(item = new("/d/hengyang/obj/zigai-book"));
    check(
        !item && objectp(load_object("/d/hengyang/obj/zigai-book")),
        "retained clone destroys itself"
    );
    item = new("/d/kunlun/obj/lyj-book"); item->move(actor, 1);
    actor->set(
        "jing",
        1000
    ); actor->set(
        "int",
        20
    ); actor->set_skill("literate", 100); actor->set_skill("liangyi-jian", 150);
    actor->select_target(item, "do_study"); actor->run_command("testinvoke book");
    check(
        actor->query("jing") == 960 && actor->gained("liangyi-jian") == 30,
        "retained custom study"
    ); destruct(item);
    item = new("/d/lingxiao/obj/book-iron"); item->move(actor, 1);
    check(
        item->query("armor_prop/armor") == 3 && item->query("skill/name") == "parry",
        "retained HANDS dual identity"
    );
    actor->set_skill("parry", 30); actor->select_target(item, "do_study");
    actor->run_command("testinvoke hand"); check(
        !actor->gained("parry"),
        "iron study needs combat"
    );
    actor->set("test/fighting", 1); actor->run_command("testinvoke hand");
    check(
        actor->query("jing") == 940 && actor->gained("parry") == 20,
        "iron custom combat study"
    ); destruct(item);
    item = new("/d/wudu/obj/dujing1");
    actor->select_target(item, "do_read"); actor->run_command("testinvoke jing1"); check(
        stringp(master()->query_notice()) &&
        strsrch(
            master()->query_notice(),
            "赤蝎粉"
        ) >= 0 && strsrch(master()->query_notice(), "五圣散") >= 0,
        "retained recipe text"
    );
    destruct(item); destruct(actor);
}

void check_book_contracts() {
    object program, item, actor;
    mixed err;

    program = load_object("/d/items/book");
    check(!program->query("name") && !environment(program), "inert provider");
    item = 0; err = catch(item = new("/d/items/book/missing"));
    check(!item && !find_object("/d/items/book/missing"), "unknown ID rejected");
    err = catch(new("/d/items/book", "shiban")); check(!!err, "direct construction rejected");
    check(
        !program->valid_variety_path("/d/items/book/shiban/extra") && !program->valid_variety_path("/d/lingxiao/obj/book-stone"),
        "exact canonical registry only"
    );
    actor = new("/tests/book_actor"); item = new("/tests/unknown_book/key");
    actor->store_item(
        actor,
        item,
        1
    ); check(
        objectp(item) && !sizeof(actor->depot_records()),
        "other virtual objects not admitted"
    );
    destruct(item); destruct(actor);
}

void check_boundaries(mapping row) {
    object blueprint, item;
    string path;
    mapping saved;
    int bound, draws, expected;

    foreach (path in ({ row["old_path"], row["new_path"] })) {
        for (bound = 0; bound <= 1; bound++) {
            blueprint = find_object(path); if (blueprint) destruct(blueprint);
            master()->set_random_bound(bound);
            blueprint = load_object(path); item = new(path);
            check_random(blueprint, row); check_random(item, row);
            expected = !!sizeof(row["name_choices"]) + !!sizeof(row["skill_choices"]);
            check(
                master()->random_count(blueprint) == expected + !!row["jing_cost_random"] && master()->random_count(item) == expected,
                "original random draw counts"
            );
            if (sizeof(row["name_choices"])) check(
                item->name() == row["name_choices"][bound ? sizeof(row["name_choices"]) - 1 : 0],
                "name pool endpoint"
            );
            if (sizeof(row["skill_choices"])) check(
                item->query("skill/name") == row["skill_choices"][bound ? sizeof(row["skill_choices"]) - 1 : 0],
                "skill pool endpoint"
            );
            if (row["jing_cost_random"]) check(
                item->query("skill/jing_cost") == 20 + (bound ? row["jing_cost_random"] - 1 : 0),
                "cost endpoint"
            );
            saved = effective(item); draws = master()->random_count(item);
            if (virtualp(item)) item->virtual_start();
            check(
                same_value(saved, effective(item)) && master()->random_count(item) == draws,
                "query/reinitialize does not draw again"
            );
            destruct(item); destruct(blueprint);
        }
    }
    master()->set_random_bound(-1);
}
