// food: /d/xingxiu/npc/obj/hamigua.c
// Jay 3/18/96

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("哈密瓜", ({"hamigua", "gua", "melon"}));
        set_weight(40);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一颗香甜的哈密瓜。不吃哈密瓜等于白来西域。\n");
                set("unit", "颗");
                set("value", 40);
                set("food_remaining", 1);
                set("food_supply", 50);
        }
}

