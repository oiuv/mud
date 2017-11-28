#include <ansi.h>
#include <weapon.h>
inherit HAMMER;

void create()
{
        set_name(HIY "³à½ð´¸" NOR, ({ "chijin chui", "chijin", "hammer", "chui" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "°Ñ");
                set("value", 200000);
                set("material", "steel");
        }
        init_hammer(80);
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
