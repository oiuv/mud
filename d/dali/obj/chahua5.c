//chahua5.c
#include <ansi.h>;
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(HIR"七仙女"NOR, ({"cha hua", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", 
"一株茶花，七朵异色同株，枝上共开七朵花，朵朵颜色不同，而且形
状朵朵不同，各有其妙。\n");
                set("value", 80);
                set("material", "plant");
                set_weight(10);
                set("armor_prop/armor", 0);
                set("armor_prop/personality", 3);
                set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
                set("unequip_msg", "$N轻轻地把$n从头上摘了下来。\n");
        }
        setup();
}


