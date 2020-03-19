#include <ansi.h>
#include <weapon.h>
inherit CLUB;

void create()
{
        set_name(HIY "赤金棍" NOR, ({ "chijin gun", "chijin", "club", "gun" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 200000);
                set("material", "steel");
        }
        init_club(80);
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
