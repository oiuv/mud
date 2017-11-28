// huluobu.c 胡箩卜
inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("胡箩卜干", ({"hu luobu", "luobu"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一块晾干了的胡箩卜干，比较方便储藏。\n");
                set("unit", "块");
                set("value", 20);
                set("food_remaining", 3);
                set("food_supply", 20);
        }
}
