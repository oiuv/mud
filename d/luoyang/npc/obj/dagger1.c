#include <ansi.h>
#include <weapon.h>
inherit DAGGER;

void create()
{
        set_name(HIY "³à½ðØ°Ê×" NOR, ({ "chijin bishou", "chijin", "dagger", "bishou" }));
        set_weight(3000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 150000);
                set("material", "steel");
        }
        init_dagger(60);
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
