//chahua6.c
#include <ansi.h>
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(MAG"风"WHT"尘三"HIR"侠"NOR, ({"cha hua", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", 
"一株茶花，同株开着三朵花，三朵花中"MAG"紫色"NOR"者最大，那是虬髯客，"WHT"白
色"NOR"者次之，那是李靖，"HIR"红色"NOR"者最娇艳而最小，那是红拂女。朵朵颜色
不同，而且形状朵朵不同，各有其妙。\n");
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


