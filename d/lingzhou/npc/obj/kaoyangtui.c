// food: kaoyangtui.c
// Java Sep. 23 1998

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("¿¾ÑòÍÈ", ({"kao yangtui", "yangtui", "leg"}));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "Ò»ÌõÏãÅçÅçµÄ¿¾ÑòÍÈ¡£\n");
                set("unit", "Íë");
                set("value", 100);
                set("food_remaining", 8);
                set("food_supply", 30);
        }
}

