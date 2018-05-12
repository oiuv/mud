#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIW "七色璎珞" NOR, ({"qise yingluo"}));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "\n一块纯白色的水晶，晶莹剔透，无暇的表面射\n"
                            "出耀眼的光泽。其中仿佛蕴藏着千千万万的生\n"
                            "命，生命流动不息，散发出宇宙的力量。这便\n"
                            "是传说中的至宝——七色璎珞，相传只有在地\n"
                            "狱中才会出现。\n" NOR);
                set("unit", "块");
                set("value", 10000000);
                set("item_origin", 1);
                set("material_attrib", "ying luo");
                set("material_name", HIW "七色璎珞" NOR);
                set("can_make", "all");
				set("not_make", ({ "战衣", "腰带", "护腕", "靴子" }));
                //set("power_point", 200);
				set("power_point", 50);
        }
}

int query_autoload()
{
        return 1;
}