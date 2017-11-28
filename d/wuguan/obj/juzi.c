#include <ansi.h>
#include <weapon.h>
inherit BLADE;

void create()
{
        set_name(YEL "锯子" NOR, ({ "ju zi", "ju", "zi" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", YEL "这是一用来锯木头的锯子，普通百姓的日常用品。\n" NOR);
                set("value", 30);
                set("material", "steel");
        	set("wield_msg", YEL "$N" YEL "拿出一把锯子握在手中。\n" NOR);
                set("unwield_msg", YEL "$N" YEL "将手中的锯子抗在肩上。\n" NOR);
        }
        init_blade(4);
        setup();
}
