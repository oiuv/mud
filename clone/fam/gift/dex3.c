#include <ansi.h>
inherit __DIR__"gift";

void create()
{
        set_name(NOR + HIR "破阳无极仙丹" NOR, ({ "wuji xiandan", "wuji",
                                                  "xiandan", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "传说此丹乃是天宫中的神品，凡人吃了可以平增身法。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 100000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("gift_type", "dex");
                set("gift_name", "先天身法");
                set("gift_point", 85);
                set("gift_msg", HIW "突然你只觉全身轻飘飘的，有股腾云驾雾的感觉。\n" NOR);
        }
        setup();
}

