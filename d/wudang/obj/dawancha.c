#include <ansi.h>

inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name(WHT "粗磁大碗" NOR, ({"wan", "dawan", "cha"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", WHT "一个蓝边粗磁大碗。\n" NOR);
                set("unit", "个");
                set("value", 0);
                set("max_liquid", 4);
        }

        set("liquid", ([
                "type": "tea",
                "name": "茶水",
                "remaining" : 4,
                "drunk_supply" : 0,
        ]));
}
