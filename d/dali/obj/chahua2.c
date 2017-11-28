//chahua2.c
#include <ansi.h>;
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(HIR"十八学士"NOR, ({"cha hua", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", 
"一株茶花，枝上共开十八朵花，朵朵颜色不同，"HIR"红"NOR"的就是全红，"MAG"紫"NOR"
的便是全紫，决无半分混杂。而且十八朵花形状朵朵不同，各有各
的妙处，开时齐开，谢时齐谢，是天下茶花的极品。\n");
                set("value", 100);
                set("material", "plant");
                set_weight(10);
                set("armor_prop/armor", 0);
                set("armor_prop/personality", 3);
                set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
                set("unequip_msg", "$N轻轻地把$n从头上摘了下来。\n");
        }
        setup();
}
