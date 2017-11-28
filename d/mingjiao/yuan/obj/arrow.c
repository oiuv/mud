// arrow.c

#include <weapon.h>
#include <ansi.h>

inherit THROWING;

int is_arrow() { return 1; }

void create()
{
        set_name(HIC "凤尾箭" NOR, ({ "fengwei jian", "arrow", "jian" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "束");
                set("value", 0);
                set("base_unit", "支");
                set("base_weight", 300);
                set("base_value", 0);
                set("material", "iron");
                set("long", "这是凤尾箭，可以连珠箭发，势道十分凶猛。\n");
                set("wound_percent", 80);
        }
        set_amount(10);
	init_throwing(200);
        setup();

        set("no_wield", "这不是用来装备的。\n");
}
