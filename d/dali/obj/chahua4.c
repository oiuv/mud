//chahua4.c
#include <ansi.h>;
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(HIB"八仙过海"NOR, ({"cha hua", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", 
"一株茶花，八朵异色同株，枝上共开八朵花，"MAG"深紫"NOR"和"HIR"淡红"NOR"的花各一
朵，那是铁拐李和何仙姑，朵朵颜色不同，红花最小。而且形状朵
朵不同，各有其妙。\n");
                set("value", 85);
                set("material", "plant");
                set_weight(10);
                set("armor_prop/armor", 0);
                set("armor_prop/personality", 3);
                set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
                set("unequip_msg", "$N轻轻地把$n从头上摘了下来。\n");
        }
        setup();
}

