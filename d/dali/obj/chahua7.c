//chahua7.c
#include <ansi.h>
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(HIR"二"WHT"乔"NOR, ({"cha hua", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", 
"一株茶花，同株开着两朵花，一朵花色"HIR"纯红"NOR"，一朵"WHT"纯白"NOR"，各有其妙。\n");
                set("value", 75);
                set("material", "plant");
                set_weight(10);
                set("armor_prop/armor", 0);
                set("armor_prop/personality", 3);
                set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
                set("unequip_msg", "$N轻轻地把$n从头上摘了下来。\n");
        }
        setup();
}


