#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
        set_name(HIY "Áð½ð¿ø" NOR, ({ "liujin kui", "kui"}) );
        set_weight(20000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "¸ö");
                set("value", 250000);
                set("material", "leather");
                set("armor_prop/armor", 80);
        }
        setup();
}

void owner_is_killed()
{
        destruct(this_object());
} 
