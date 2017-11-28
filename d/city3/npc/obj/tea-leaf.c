// tea_leaf.c
 
#include <weapon.h>
#include <ansi.h>

inherit THROWING;
 
void create()
{
        set_name(HIG "茶叶" NOR, ({ "tea leaf", "tea" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "才采的新茶，发出一股淡淡的香气。\n");
                set("unit", "把");
                set("base_unit", "片");
                set("base_weight", 1);
                set("base_value", 1);
                set("material", "wood");
                set("wield_msg", "$N迅速地从暗器袋中掏出一些茶叶，捏在手中就待发出！\n");
                set("unwield_msg", "$N将手里剩下的茶叶尽数放回暗器袋中。\n");
                set("only_do_effect", 1);
        }
        set_amount(50);
        init_throwing(1);
        setup();
}

int do_effect(object me)
{
        if (query_amount() < 1)
                return 0;

        add_amount(-1);
        write("你嚼了几口茶叶，觉得苦中带着一股清香，精神不由得一振。\n");
        me->receive_heal("jing", 1 + random(2));
        me->start_busy(1);
        return 1;
}

