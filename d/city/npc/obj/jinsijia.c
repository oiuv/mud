#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(HIY "½ðË¿¼×" NOR, ({ "jinsi jia", "jinsi", "jia"}));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("value", 30000);
                set("material", "leather");
                set("armor_prop/armor", 100);
        }
        setup();
}

int query_autoload()
{
        return 1;
}

void owner_is_killed()
{
        destruct(this_object());
} 
