// fish.c 西湖醋鱼
#include <ansi.h>
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name(RED"西湖醋鱼"NOR, ({"fish"}));
        set_weight(1300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一盘清甜可人的西湖醋鱼，用西湖中的金色鲤鱼
烧制而成，是西湖第一名菜。\n");
                set("unit", "碗");
                set("value", 120);
                set("food_remaining", 20);
                set("food_supply", 20);
        }
}
