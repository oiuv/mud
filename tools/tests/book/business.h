void check_book_rooms() {
    mapping data, paths, before, expected, now;
    object room, item;
    string fixture, prefix, key, target;
    int mode, count;

    data = json_decode(read_file("/tests/book_business.json"));
    paths = json_decode(read_file("/tests/migration_paths.json"));
    foreach (fixture in data["rooms"]) for (mode = 0; mode < 3; mode++) {
        before = 0;
        foreach (prefix in ({ "/tests/old", "" })) {
            master()->set_room_mode(mode); room = new(prefix + fixture);
            now = room->query("objects"); count = 0;
            foreach (key in keys(now)) count += now[key];
            check(sizeof(all_inventory(room)) == count, "actual room initial inventory");
            if (prefix != "") before = copy(now);
            else {
                expected = ([]);
                foreach (key in keys(before)) {
                    target = key[0..0] == "/" ? key : "/" + key;
                    expected[paths[target] ? paths[target] : key] = before[key];
                }
                check(
                    same_value(expected, now),
                    "room candidates/counts including duplicate keys " + fixture
                );
            }
            room->reset(); check(
                sizeof(all_inventory(room)) == count,
                "reset does not duplicate live objects"
            );
            foreach (item in all_inventory(room)) destruct(item);
            room->reset(); check(
                sizeof(all_inventory(room)) == count,
                "actual reset replenishes destroyed books"
            );
            foreach (item in all_inventory(room)) destruct(item);
            destruct(room);
        }
    }
}

void check_book_shops() {
    object actor, vendor, item;
    string prefix, path, id, listing;
    int money;

    actor = new("/tests/book_actor"); actor->move(this_object(), 1);
    foreach (prefix in ({ "/tests/old", "" })) {
        vendor = new(prefix + "/tests/book_shop"); vendor->move(this_object(), 1);
        actor->select_vendor(vendor); vendor->do_list(0); listing = vendor->query_display();
        check(sizeof(vendor->query("vendor_goods")) == 2, "book shop has original two goods");
        foreach (path in vendor->query("vendor_goods")) {
            id = path->query("id");
            check(vendor->is_vendor_good(id) == path && strsrch(listing, path->name(1)) >= 0 &&
                strsrch(
                    listing,
                    MONEY_D->price_str(path->query("value"))
                ) >= 0, "actual list name and price");
            vendor->enough_rest(); actor->run_command("testbuy " + id);
            check(!sizeof(all_inventory(actor)), "insufficient money rejected");
            MONEY_D->pay_player(actor, path->query("value") + 100000); money = actor->cash_value();
            vendor->enough_rest(); actor->run_command("testbuy 2 " + id);
            check(
                !present(id, actor) && actor->cash_value() == money,
                "ordinary book cannot bulk buy"
            );
            vendor->enough_rest(); actor->run_command("testbuy " + id); item = present(id, actor);
            check(
                objectp(item) && base_name(item) == path && money - actor->cash_value() == path->query("value"),
                "real book purchase and price"
            );
            actor->run_command("testbuy " + id);
            check(
                sizeof(filter_array(all_inventory(actor), (: !$1->query("money_id") :))) == 1,
                "dealer cooldown unchanged"
            );
            clear_books(actor);
        }
        destruct(vendor);
    }
    destruct(actor);
}

void check_book_suppliers() {
    object actor, npc, item, blocker;
    string file, stock, method, prefix, key, path;
    mapping paths;

    paths = json_decode(read_file("/tests/migration_paths.json"));
    actor = new("/tests/book_actor"); actor->move(this_object(), 1);
    foreach (file in ({
        "/kungfu/class/shaolin/dao-chen",
        "/kungfu/class/shaolin/dao-xiang",
        "/d/xiangyang/npc/wuxiuwen"
    }))
        foreach (prefix in ({
            "/tests/old",
            ""
        })) foreach (key in ({ "fojing10", "fojing11", "fojing20", "fojing21" })) {
            stock = file == "/kungfu/class/shaolin/dao-chen" ? "wuqi_count" : "huju_count";
            method = stock == "wuqi_count" ? "ask_me" : "ask_me_1";
            npc = new(prefix + file); actor->select_target(npc, method); actor->delete("family");
            if (file != "/d/xiangyang/npc/wuxiuwen") {
                actor->run_command("testinvoke " + key);
                check(
                    !sizeof(all_inventory(actor)) && npc->query(stock) == 2,
                    "original sect check"
                );
                actor->set("family/family_name", "少林派");
            }
            blocker = new("/tests/vendor"); blocker->set_name(
                "持有夹具",
                ({ key })
            ); blocker->move(actor, 1);
            actor->run_command("testinvoke " + key);
            check(
                sizeof(all_inventory(actor)) == 1 && npc->query(stock) == 2,
                "original present-name guard"
            ); destruct(blocker);
            path = "/d/shaolin/obj/" + key; if (prefix == "") path = paths[path];
            actor->run_command("testinvoke " + key);
            check(
                sizeof(all_inventory(actor)) == 1 && npc->query(stock) == 1,
                "public fojing branch delivery"
            );
            item = all_inventory(actor)[0];
            check(
                base_name(item) == path && !item->id(key),
                "canonical path without invented alias"
            );
            actor->run_command("testinvoke " + key);
            check(
                sizeof(all_inventory(actor)) == 2 && !npc->query(stock),
                "old duplicate-name mismatch retained"
            );
            clear_books(actor); actor->run_command("testinvoke " + key);
            check(
                !sizeof(all_inventory(actor)) && !npc->query(stock),
                "stock exhaustion retained"
            ); destruct(npc);
        }
    foreach (file in ({ "/d/quanzhen/npc/zhangjing", "/d/quanzhen/npc/zhangli" }))
        foreach (prefix in ({ "/tests/old", "" })) {
            npc = new(prefix + file); actor->select_target(npc, "ask_me"); actor->delete("family");
            actor->run_command("testinvoke"); check(
                !sizeof(all_inventory(actor)) && npc->query("book_count") == 1,
                "Quanzhen family guard"
            );
            actor->set("family/family_name", "全真教"); actor->run_command("testinvoke");
            path = file == "/d/quanzhen/npc/zhangjing" ? "/d/quanzhen/npc/obj/daodejing-i" : "/d/quanzhen/npc/obj/daodejing-ii";
            if (prefix == "") path = paths[path];
            check(
                sizeof(all_inventory(actor)) == 1 && base_name(all_inventory(actor)[0]) == path && !npc->query("book_count"),
                "correct Quanzhen volume"
            );
            actor->run_command("testinvoke"); check(
                sizeof(all_inventory(actor)) == 1,
                "Quanzhen one-book stock"
            );
            clear_books(actor); destruct(npc);
        }
    destruct(actor);
}

void check_book_rewards() {
    object actor, npc, item, bag, daughter;
    string prefix, fixture, path;
    mapping paths, data;

    paths = json_decode(read_file("/tests/migration_paths.json"));
    data = json_decode(read_file("/tests/book_business.json"));
    actor = new("/tests/book_actor"); actor->move(this_object(), 1);
    actor->set("test/player", 1);
    foreach (prefix in ({ "/tests/old", "" })) {
        bag = new(prefix + "/d/mingjiao/obj/bag"); bag->move(actor, 1);
        actor->select_target(bag, "do_open"); actor->run_command("testinvoke wrong");
        check(
            bag->query("book_count") == 1 && sizeof(all_inventory(actor)) == 1,
            "wrong bag name ignored"
        );
        actor->run_command("testinvoke bag"); path = "/d/mingjiao/obj/jing"; if (prefix == "") path = paths[path];
        item = present(path->query("id"), actor);
        check(
            objectp(item) && base_name(item) == path && !bag->query("book_count"),
            "bag gives correct book once"
        );
        actor->run_command("testinvoke bag"); check(
            sizeof(all_inventory(actor)) == 2,
            "empty bag cannot duplicate book"
        );
        clear_books(actor);
        npc = new(prefix + "/d/changan/npc/yuanwai"); npc->set_name(
            "萧员外",
            ({ "xiao yuanwai" })
        ); npc->move(this_object(), 1);
        daughter = new("/tests/vendor"); daughter->move(this_object(), 1);
        item = new("/d/items/neck/yupei"); item->move(actor, 1);
        npc->cry_daughter(npc, daughter, actor, item);
        path = "/d/changan/npc/obj/book"; if (prefix == "") path = paths[path];
        check(!daughter && !item && sizeof(all_inventory(actor)) == 1 && base_name(all_inventory(actor)[0]) == path,
            "actual reward consumes daughter/jade and gives book");
        clear_books(actor); clear_books(npc); destruct(npc);
        foreach (fixture in data["carriers"]) {
            npc = new(prefix + fixture);
            check(sizeof(all_inventory(npc)) == 1, "actual NPC book carry statement");
            item = all_inventory(npc)[0];
            check(mapp(item->query("skill")), "NPC carries readable book");
            clear_books(npc); destruct(npc);
        }
    }
    destruct(actor);
}

void check_book_business() {
    check_book_rooms(); check_book_shops(); check_book_suppliers(); check_book_rewards();
}
