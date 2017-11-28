#include <weapon.h>
#include <ansi.h>

inherit HAMMER;

void create()
{
        set_name(NOR + WHT "大石头" NOR, ({ "stone" }));
        set_weight(16000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("long", NOR + WHT "一块大大的圆滚滚的石头。\n" NOR);
                set("value", 0);
                set("material", "stone");
        }
        init_hammer(10);
        setup();
}

