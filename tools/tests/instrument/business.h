void check_instrument_business() {
    mapping data, paths, now, before, expected, carrier;
    object room, item, actor, vendor, npc;
    string fixture, prefix, key, target, path, id, listing;
    string *old_goods;
    int mode, count, money, bought;

    data = json_decode(read_file("/tests/instrument_business.json"));
    paths = json_decode(read_file("/tests/migration_paths.json"));
    foreach (fixture in data["rooms"]) for (mode = 0; mode < 3; mode++) {
        before = 0;
        foreach (prefix in ({ "/tests/old", "" })) {
            master()->set_room_mode(mode);
            room = new(prefix + fixture);
            now = room->query("objects"); count = 0;
            foreach (key in keys(now)) count += now[key];
            check(sizeof(all_inventory(room)) == count, "original room initial inventory");
            if (prefix != "") before = copy(now);
            else {
                expected = ([]);
                foreach (key in keys(before)) expected[paths[key] ? paths[key] : key] = before[key];
                check(same_value(expected, now), "room branch/count preserved");
            }
            room->reset();
            check(sizeof(all_inventory(room)) == count, "no duplicate reset");
            foreach (item in all_inventory(room)) destruct(item);
            room->reset();
            check(sizeof(all_inventory(room)) == count, "actual reset replenishes");
            foreach (item in all_inventory(room)) destruct(item);
            destruct(room);
        }
    }
    actor = new("/tests/instrument_actor"); actor->move(this_object(), 1);
    foreach (fixture in data["vendors"]) {
        old_goods = 0;
        foreach (prefix in ({ "/tests/old", "" })) {
            vendor = new(prefix + fixture); vendor->move(this_object(), 1);
            actor->select_vendor(vendor); vendor->do_list(0); listing = vendor->query_display();
            if (prefix != "") old_goods = copy(vendor->query("vendor_goods"));
            else check(same_value(map_array(old_goods, (: $(paths)[$1] ? $(paths)[$1] : $1 :)),
                vendor->query("vendor_goods")), "complete vendor goods order preserved");
            bought = 0;
            foreach (path in vendor->query("vendor_goods")) {
                if (!paths[path] && strsrch(path, "/d/items/qin/") != 0 &&
                    strsrch(
                        path,
                        "/d/items/xiao/"
                    ) != 0 && strsrch(path, "/d/items/zheng/") != 0) continue;
                id = path->query("id");
                check(vendor->is_vendor_good(id) == path && strsrch(listing, path->name(1)) >= 0 &&
                    strsrch(
                        listing,
                        MONEY_D->price_str(path->query("value"))
                    ) >= 0, "list name/price and matching");
                vendor->enough_rest(); actor->run_command("testbuy " + id);
                check(!sizeof(all_inventory(actor)), "purchase needs payment");
                MONEY_D->pay_player(
                    actor,
                    path->query("value") + 100000
                ); money = actor->cash_value();
                vendor->enough_rest(); actor->run_command("testbuy 2 " + id);
                check(
                    !present(id, actor) && actor->cash_value() == money,
                    "no combined bulk purchase"
                );
                vendor->enough_rest(); actor->run_command("testbuy " + id); item = present(
                    id,
                    actor
                );
                check(item && base_name(item) == path && money - actor->cash_value() == path->query("value"),
                    "actual purchase identity and payment");
                actor->run_command("testbuy " + id);
                check(sizeof(filter_array(all_inventory(actor), (: !$1->query("money_id") :))) == 1,
                    "original dealer cooldown");
                clear_instruments(actor); bought++;
            }
            check(
                bought == (fixture == "/tests/instrument_vendor0" ? 1 : 15),
                "all selected shop goods exercised"
            );
            destruct(vendor);
        }
    }
    destruct(actor);
    foreach (carrier in data["carriers"]) {
        before = 0;
        foreach (prefix in ({ "/tests/old", "" })) {
            npc = new(prefix + carrier["fixture"]);
            check(sizeof(all_inventory(npc)) == 1, "NPC carries one instrument");
            item = all_inventory(npc)[0];
            if (prefix != "") { before = effective(item); path = base_name(item); } else check(
                base_name(item) == paths[path] && same_value(before, effective(item)),
                "NPC same effective carried item"
            );
            check(carrier["handing"] ? npc->query_temp("handing") == item : !npc->query_temp("handing"),
                "original handing state");
            check(!item->query("equipped"), "ordinary music instrument not wielded");
            clear_instruments(npc); destruct(npc);
        }
    }
}
