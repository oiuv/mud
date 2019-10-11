#include <ansi.h>;
inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name(HIY "花茶" NOR, ({ "tea" }));
        set_weight(700);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "一杯茶杯，里面盛有清香浓郁的花茶。\n" NOR);
                set("unit", "杯");
                set("value", 0);
                set("max_liquid", 5);
        }
        set("liquid", ([
                "type": "water",
                "name": "花茶",
                "remaining": 5,
                "drunk_apply": 5,
        ]));
}
