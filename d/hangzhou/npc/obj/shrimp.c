// shrimp.c Áú¾®ÏºÈÊ
#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(RED"Áú¾®ÏºÈÊ"NOR, ({"shrimp"}));
        set_weight(1300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "õ¦õ¦Å¨Å¨µÄÒ»ÅÌÁú¾®ÏºÈÊ¡£\n");
                set("unit", "Íë");
                set("value", 50);
                set("food_remaining", 5);
                set("food_supply", 20);
        }
}
