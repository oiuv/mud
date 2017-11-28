#include <ansi.h>
#include <weapon.h>
inherit BLADE;

void create()
{
        set_name( WHT "¿Ý¹Çµ¶" NOR, ({ "blade" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "°Ñ");
                set("value", 30);
                set("material", "leather");
        }
        init_blade(250);
        setup();
}
void owner_is_killed()
{
        destruct(this_object());
} 
