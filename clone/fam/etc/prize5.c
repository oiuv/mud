#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIR "神聖血清" NOR, ({ "god blood", "god", "blood" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "這是一瓶神聖血清，似乎可以飲用。\n" NOR);
                set("unit", "瓶");
                set("value", 300000);
        }
        setup();
}

void init()
{
        add_action("do_drink", "drink");
}

int do_drink(string arg)
{
        object me = this_player();

        string mapsk;
        int na, un;
        mapping my = me->query_entire_dbase();

        na = query("name");
        un = query("unit");

        if (! arg || ! id(arg))
                return notify_fail("你要喝什么东西？\n");

        if (me->is_busy())
                return notify_fail("急什么，小心别噎着了。\n");

        my = me->query_entire_dbase();

        message_vision(HIY "$N" HIY "一仰脖，将一整" + un + na +
                       HIY "饮下，再也感觉不到任何疲惫。\n" NOR, me);

        my["jing"]     = my["max_jing"];
        my["qi"]       = my["max_qi"];
        my["eff_jing"] = my["max_jing"];
        my["eff_qi"]   = my["max_qi"];
        my["neili"]    = my["max_neili"];
        my["jingli"]   = my["max_jingli"];

        me->start_busy(3);
        destruct(this_object());
        return 1;
}

int query_autoload()
{
        return 1;
}
