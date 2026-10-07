inherit F_CLEAN_UP;

int do_put(object me, object obj, object dest);
private int can_put(object me, object obj, object dest);
private int place_item(object me, object obj, object dest);

void create() { seteuid(getuid()); }

int main(object me, string arg) {
    string target, item;
    object obj, dest, *inv, obj2, *existing, candidate;
    int i, amount, original_amount;
    mixed err;

    if (!arg)
        return notify_fail("你要将什么东西放进哪里？\n");

    if (sscanf(arg, "%s in %s", item, target) != 2)
        return notify_fail("你要放什么东西？\n");

    dest = present(target, me);
    if (!dest || living(dest))
        dest = present(target, environment(me));

    if (!dest || living(dest))
        return notify_fail("这里没有这样东西。\n");

    if (dest->query("no_get_from"))
        return notify_fail("还是不要打扰人家了。\n");

    if (sscanf(item, "%d %s", amount, item) == 2) {
        if (!objectp(obj = present(item, me)))
            return notify_fail("你身上没有这样东西。\n");

        if (!obj->query_amount())
            return notify_fail(obj->name() + "不能被分开。\n");

        if (amount < 1)
            return notify_fail("东西的数量至少是一个。\n");

        if (amount > obj->query_amount())
            return notify_fail("你没有那么多的" + obj->name() + "。\n");
        else if (amount == (int)obj->query_amount())
            return do_put(me, obj, dest);
        else {
            if (!can_put(me, obj, dest)) return 1;
            original_amount = obj->query_amount();
            existing = children(base_name(obj));
            err = catch(obj2 = new(base_name(obj)));
            if (!err) err = catch(obj2->set_amount(amount));
            if (err) {
                if (objectp(obj2)) destruct(obj2);
                // create() 抛错时驱动尚未返回句柄，只清理本次留下的无环境克隆。
                foreach (candidate in children(base_name(obj)) - existing)
                    if (clonep(candidate) && !environment(candidate)) destruct(candidate);
                return notify_fail("这些东西暂时分不开，仍留在你身上。\n");
            }
            obj->set_amount(original_amount - amount);
            if (place_item(me, obj2, dest)) return 1;
            if (objectp(obj2)) destruct(obj2);
            obj->set_amount(original_amount);
            return 0;
        }
    }

    if (item == "all") {
        inv = all_inventory(me);
        for (i = 0; i < sizeof(inv); i++)
            if (objectp(inv[i]) && inv[i] != dest)
                do_put(me, inv[i], dest);
        write("Ok.\n");
        return 1;
    }

    if (!objectp(obj = present(item, me)))
        return notify_fail("你身上没有这样东西。\n");
    return do_put(me, obj, dest);
}

private int can_put(object me, object obj, object dest) {
    mixed msg;

    if (dest->is_depot_ob()) {
        tell_object(me, "存东西到" + dest->name() + "的快捷方式：store 物品ID。\n");
        return 0;
    }

    if (!dest->is_container() && !dest->is_character()) {
        tell_object(me, dest->name() + "不是容器，你不能把东西放进去。\n");
        return 0;
    }

    if (sizeof(all_inventory(dest)) >= MAX_ITEM_CARRIED) {
        tell_object(me, dest->name() + "里面的东西实在"
            "是太多了，你没法再放东西了。\n");
        return 0;
    }

    if (!undefinedp(msg = obj->query("no_put"))) {
        if (stringp(msg))
            tell_object(me, msg);
        else
            tell_object(me, "这个东西不要乱放。\n");
        return 0;
    }

    if (obj->is_corpse()) {
        tell_object(me, "你无法把" + obj->name() + "塞进去。\n");
        return 0;
    }

    if (userp(obj)) {
        tell_object(me, "你无法把" + obj->name() + "塞进去。\n");
        return 0;
    }

    if (obj == dest) {
        tell_object(me, "嗯... 自己套自己，你的想法比较有趣。\n");
        return 0;
    }
    return 1;
}

private int place_item(object me, object obj, object dest) {
    string msg;
    mixed err;
    int moved;

    msg = sprintf("$N将一%s%s放进%s。\n", obj->query("unit"), obj->name(), dest->name());
    err = catch(moved = obj->move(dest));
    if (!err && moved > 0 && objectp(obj) && environment(obj) == dest) {
        message_vision(msg, me);
        return 1;
    }
    return notify_fail("这次没能放进去，东西仍留在你身上。\n");
}

int do_put(object me, object obj, object dest) {
    if (!can_put(me, obj, dest)) return 1;
    return place_item(me, obj, dest);
}

int help(object me) {
    write(@HELP
指令格式 : put <物品名称> in <某容器>

这个指令可以让你将某样物品放进一个容器，当然，首先你要拥有这样物品。

HELP
    );
    return 1;
}
