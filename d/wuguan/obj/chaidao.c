#include <ansi.h>
#include <weapon.h>
inherit BLADE;

void create()
{
        set_name(YEL "柴刀" NOR, ({ "chai dao", "chai", "dao" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", YEL "这是一柄沉甸甸的砍柴刀，普通百姓的日常用品。\n" NOR);
                set("value", 10);
                set("material", "steel");
                set("wield_msg", YEL "$N" YEL "「唰」的一声抽出一柄柴刀握在手中。\n" NOR);
                set("unwield_msg", YEL "$N" YEL "将手中的柴刀插回腰间。\n" NOR);
        }
        init_blade(4);
        setup();
}
