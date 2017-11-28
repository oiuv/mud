inherit ITEM;
inherit F_FOOD;

#include <ansi.h>

void create()
{
        set_name(HIW "馒头" NOR, ({ "man tou", "man","tou" }));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一个馒头。\n");
                set("unit", "个");
                set("value", 40);
                set("food_remaining", 4);
                set("food_supply", 15);
                set("material", "rice");
        }
        setup();
}
