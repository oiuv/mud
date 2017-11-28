// cuiyu.c
#include <ansi.h>;
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(HIG"翠羽"NOR, ({"cui yu", "yu"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "支");
                set("long", 
"一支翠绿的羽毛。\n");
                set("value", 800);
                set("material", "plant");
                set_weight(10);
                set("armor_prop/armor", 10);
                set("armor_prop/personality", 3);
                set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
                set("unequip_msg", "$N轻轻地把$n从头上摘了下来。\n");
        }
        setup();
}
