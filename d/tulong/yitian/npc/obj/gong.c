#include <ansi.h>
#include <armor.h>

inherit HANDS;

void create()
{
        set_name(HIY "µã½ðÅÌÁú¹­" NOR, ({ "panlong gong", "gong", "panlong" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "Ö§");
                set("value", 8000);
                set("armor_prop/armor", 1);
                set("armor_prop/hand", 1);
                set("armor_prop/strike", 1);
                set("armor_prop/unarmed_damage", 3);
        }
        setup();
}

