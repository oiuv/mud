#include <ansi.h>
#include <weapon.h>
inherit WHIP;

void create()
{
        set_name(HIY "³à½ð±Þ" NOR, ({ "chijin bian", "chijin", "whip", "bian" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 200000);
                set("material", "steel");
        }
        init_whip(80);
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
