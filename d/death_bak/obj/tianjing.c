#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIW "寰宇天晶" NOR, ({"tian jing", "tian", "jing"}));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "\n一块纯白色的水晶，晶莹剔透，无暇的表面射\n"
                            "出耀眼的光泽。其中仿佛蕴藏着千千万万的生\n"
                            "命，生命流动不息，散发出宇宙的力量。这便\n"
                            "是传说中的至宝——寰宇天晶，相传只有在天\n"
                            "宫中才会出现。\n" NOR);
                set("unit", "块");
                set("value", 10000000);
                set("item_origin", 1);
                set("material_attrib", "tian jing");
                set("material_name", HIW "寰宇天晶" NOR);
                set("can_make", "all");
                set("power_point", 200);
        }
}
