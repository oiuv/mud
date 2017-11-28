#include <ansi.h>
#include <weapon.h>
inherit SWORD;

void create()
{
        set_name(HIY "³à½ð½£" NOR, ({ "chijin jian", "chijin", "sword", "jian" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 200000);
                set("material", "steel");
        }
        init_sword(80);
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
