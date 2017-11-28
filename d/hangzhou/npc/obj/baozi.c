// baozi.c
#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(HIY"百果油包"NOR, ({"baozi", "dumpling"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一个煎得油澄澄、香喷喷的百果油包。\n");
                set("unit", "个");
                set("value", 70);
                set("food_remaining", 3);
                set("food_supply", 20);
        }
}
