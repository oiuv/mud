#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(NOR + RED "烤肉" NOR, ({ "kao rou", "kao", "rou" }));
        set_weight(100);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", RED "这是一块香喷喷的烤肉。\n" NOR);
                set("unit", "块");
                set("food_remaining", 4);
                set("food_supply", 300);
        }
}
