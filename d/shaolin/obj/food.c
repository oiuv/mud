inherit ITEM;
inherit F_FOOD;

#include <ansi.h>

void create()
{
        set_name(RED "糖醋里脊" NOR, ({ "tangcu liji", "tangcu", "liji" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一份热气腾腾的糖醋里脊。\n");
                set("unit", "份");
                set("value", 160);
                set("food_remaining", 8);
                set("food_supply", 30);
                set("material", "meet");
        }
        setup();
}

