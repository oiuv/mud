#include <ansi.h>
inherit __DIR__"gift";

void create()
{
        set_name(NOR + HIC "福寿膏" NOR, ({ "fushou gao", "fushou", "gao" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIC "这是一块制作精致的糕点，据说吃了可以增强身法。\n" NOR);
                set("base_unit", "块");
                set("base_value", 10000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("gift_type", "dex");
                set("gift_name", "先天身法");
                set("gift_point", 50);
                set("gift_msg", HIW "突然你只觉全身轻飘飘的，有股腾云驾雾的感觉。\n" NOR);
        }
        setup();
}

