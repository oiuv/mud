// wield.c

inherit F_CLEAN_UP;

int do_wield(object me, object ob);

int main(object me, string arg) {
    object ob, *inv;
    int i, count;

    if (!arg)
        return notify_fail("你要装备什么武器？\n");

    if (arg == "all") {
        inv = all_inventory(me);
        for (count = 0, i = 0; i < sizeof(inv); i++) {
            if (inv[i]->query("equipped"))
                continue;
            if (do_wield(me, inv[i]))
                count++;
        }
        write("Ok.\n");
        return 1;
    }

    if (!objectp(ob = present(arg, me)))
        return notify_fail("你身上没有这样东西。\n");

    if (ob->query("equipped")) {
        inv = all_inventory(me) - ({ ob });
        for (count = 0, i = 0; i < sizeof(inv); i++) {
            if (!inv[i]->id(arg))
                continue;
            if (inv[i]->query("equipped"))
                continue;
            if (do_wield(me, inv[i])) {
                count++;
                break;
            }
        }
        if (!count)
            return notify_fail("你已经装备着了。\n");
        return 1;
    }

    return do_wield(me, ob);
}

int do_wield(object me, object ob) {
    string str;

    if (ob->wield()) {
        if (!stringp(str = ob->query("wield_msg")))
            str = "$N装备$n作武器。\n";
        message_vision(str, me, ob);
        return 1;
    } else
        return 0;
}

int help(object me) {
    write(@HELP
指令格式：wield <装备名称>

这个指令让你装备随身携带的兵器。
双手兵器必须空出双手；单手兵器最多再配一件可作副手的兵器，
或留一只手拿物品。副手不会额外出招；主手放下后，仍可用的副手
会自动转为主手，按它的类别和所激发武功出招。

HELP);
    return 1;
}
