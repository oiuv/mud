// zhutou.c

#include <weapon.h>

inherit HAMMER;
inherit F_FOOD;

#include "pigpart.h"

void create()
{
        set_name("猪头", ({ "zhutou","tou" }));
        set_weight(350);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一个大猪头。\n");
                set("value", 80);
                set("food_remaining", 4);
                set("food_supply", 15);
                set("wield_msg", "$N抓起一颗$n，握在手中当武器。\n");
                set("material", "bone");
        }

        init_hammer(1);
        setup();
}

int finish_eat()
{
        if (! query("weapon_prop")) return 0;

        set_name("啃得精光的骨头", ({ "bone" }));
        set_weight(150);
        set("long", "啃得精光的骨头。\n");
        return 1;
}
