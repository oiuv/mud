// food: kaoyangtui.c
// Java Sep. 23 1998

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("烤羊腿", ({"kao yangtui", "yangtui", "leg"}));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一条香喷喷的烤羊腿。\n");
                set("unit", "碗");
                set("value", 100);
                set("food_remaining", 8);
                set("food_supply", 30);
        }
}

