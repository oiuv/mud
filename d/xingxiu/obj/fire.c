// item: /d/xingxiu/npc/obj/fire.c
// Jay 3/17/96

inherit ITEM;

void create()
{
        set_name("火折", ({"fire", "huozhe"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一支用于引火的火折，可以用来点燃(light)东西，或者是
到了黑暗的地方使用(use)。\n");
                set("unit", "支");
                set("value", 100);
                set("no_light", "点火折？到了黑暗的地方使用(use)就可以了。\n");
        }
        set_temp("count", 10);
}

void init()
{
        add_action("do_light", "dian");
        add_action("do_light", "light");
}

int do_light(string arg)
{
        object me;
        object ob;

        if (! arg)
                return notify_fail("你要点什么东西？\n");

        me = this_player();
        if (! objectp(ob = present(arg, me)) &&
            ! objectp(ob = present(arg, environment(me))))
                return notify_fail("你身上和附近没有这样东西啊。\n");

        notify_fail("这东西看上去没什么好点的。\n");
        if (! ob->fire(me, this_object()))
                return 0;

        if (add_temp("count", -1) < 1)
        {
                write("你把火折用完，随手扔到了一边。\n");
                destruct(this_object());
        }

        return 1;
}
