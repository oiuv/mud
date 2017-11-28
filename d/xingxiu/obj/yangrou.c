// food: yangrou.c
// Jay 3.18/96

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("羊肉串", ({"yangrou chuan", "yangrou", "chuan"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一串香喷喷的羊肉串，上面沾满了孜然和辣椒面。\n");
                set("unit", "串");
                set("value", 200);
                set("food_remaining", 3);
                set("food_supply", 50);
        }
}

