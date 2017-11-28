// food: /d/xingxiu/npc/obj/nang.c
// Jay 3/17/96

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("馕", ({"nang", "cake"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是维吾尔族人日常吃的一种面饼。\n");
                set("unit", "个");
                set("value", 50);
                set("food_remaining", 3);
                set("food_supply", 20);
        }
}

