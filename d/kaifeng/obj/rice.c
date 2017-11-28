inherit ITEM;
inherit F_FOOD;

#include <ansi.h>

void create()
{
        set_name(HIW "稻香小米粥" NOR, ({ "rice", "fan" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一碗热气腾腾的小米粥。\n");
                set("unit", "碗");
                set("value", 80);
                set("food_remaining", 4);
                set("food_supply", 15);
                set("material", "rice");
        }
        setup();
}

