inherit ROOM;

#define LEITAI          __DIR__ "leitai"

int is_chat_room() { return 1; }

void init()
{
        add_action("do_pass", "pass");
}

void init_here()
{
}

int valid_leave(object me, string dir)
{
        object ob;
        string dest;

        dest = query("exits/" + dir);
        if (! stringp(dest))
                return ::valid_leave(me, dir);

        ob = find_object(dest);
        if (! objectp(ob) || wizardp(me))
                return ::valid_leave(me, dir);

        if (ob->refuse(me))
                return notify_fail("你凑什么热闹，现在不是你上去的时候。\n");

        return ::valid_leave(me, dir);
}

int do_pass(string arg)
{
        object me;
        object ob;
        object ob_leitai;

        me = this_player();
        if (! wizardp(me))
                return notify_fail("你不是巫师，没有资格让人家上去。\n");

        if (! arg ||
            ! objectp(ob = present(arg, this_object())))
                return notify_fail("你想让谁上去？\n");

        if (ob == me)
                return notify_fail("你就不会自己走上去？\n");

        if (wizardp(ob))
                return notify_fail("人家自己想上去自己会上去，不劳你费心。\n");

        if (! ob->is_character())
                return notify_fail("你是不是大脑进了水？\n");

        if (! userp(ob))
                return notify_fail("你捅了捅了" + ob->name() + "，不过人家没动。\n");

        if (! living(ob))
                return notify_fail("好歹你得弄醒人家吧？\n");

        ob_leitai = find_object(LEITAI);
        if (! objectp(ob_leitai))
                ob_leitai = load_object(LEITAI);
        if (! objectp(ob_leitai))
                return notify_fail("擂台在哪里？\n");

        message_vision("$N点点头，对$n道：“你上去吧。”\n"
                       "只见$n摩拳擦掌，踊跃奔上台去。\n",
                       me, ob);
        message("vision", "只见" + ob->name() + "跃上台来，矫健之极。\n",
                ob_leitai);
        ob->move(ob_leitai);
        return 1;
}
