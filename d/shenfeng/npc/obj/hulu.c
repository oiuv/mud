#include <ansi.h>

inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name(YEL "酒葫芦" NOR, ({ "jiu hulu", "hulu", "jiu" }));
        set_weight(700);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一个用来装酒的大葫芦，外皮金黄，里面能装好几斤酒。\n");
                set("unit", "个");
                set("value", 100);
                set("max_liquid", 15);
        }
        set("liquid", ([
                "type": "alcohol",
                "name": "米酒",
                "remaining": 15,
                "drunk_apply": 3,
        ]));
}
