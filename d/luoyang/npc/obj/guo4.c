#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(HIR "¿Û÷¶" NOR, ({ "lizhi" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¥Æ");
                set("value", 50);
                set("food_remaining", 1);
                set("food_supply", 5);
        }
    	setup();
}
