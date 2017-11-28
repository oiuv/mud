#include <ansi.h> 

inherit F_FOOD;
inherit ITEM;

void create()
{
        set_name(NOR + YEL "烘饼" NOR, ({ "hong bing", "hong", "bing" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", YEL "这是一块香喷喷的大烘饼。\n" NOR);
                set("unit", "块");
                set("value", 200);
                set("food_remaining", 4);
                set("food_supply", 20);
        }
        setup();
}
