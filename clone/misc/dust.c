// dust.c

#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(RED "化尸粉" NOR, ({ "dust" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "颗");
                set("long", NOR + WHT "这是一包用毁尸灭迹的化尸粉，只"
                            "要一丁点就可以化去(" HIW "dissolve" NOR +
                            WHT ")一具尸体。\n" NOR);
                set("value", 50000);
        }
        setup();
}

void init()
{
        if (this_player() == environment())
                add_action("do_dissolve", "dissolve");
}

int do_dissolve(string arg)
{
        object ob;

        if (! arg)
                return notify_fail("你要用化尸粉溶解什么东西？\n");

        if (! objectp(ob = present(arg, environment(this_player()))))
                return notify_fail("这里没有这样东西。\n");

        if (! ob->is_corpse() && ! ob->is_body_part() && ! ob->is_head())
                return notify_fail("化尸粉只能用来溶解尸体。\n");

        if (ob->query("defeated_by") && ob->query("defeated_by") != this_player())
                return notify_fail("这具尸体已被别人盯上了，还是别动为妙。\n");

        message_vision(WHT "$N" WHT "用指甲挑了一点化尸粉在$n"
                       WHT "上，顿时只听「嗤嗤」几声，散发出一"
                       "股恶臭。\n" RED "待臭味渐渐散尽，却见"
                       "$n" RED "仅剩下了一滩黄水。\n" NOR,
                       this_player(), ob);
        destruct(ob);
        return 1;
}
