//chahua3.c
#include <ansi.h>;
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(HIG"十三太保"NOR, ({"cha hua", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", 
"一株茶花，枝上共开十三朵花，朵朵颜色不同，决无半分混杂。而
且十三朵花形状朵朵不同，各有各的妙处，开时齐开，谢时齐谢，
是仅次于十八学士的天下茶花极品。\n");
                set("value", 90);
                set("material", "plant");
                set_weight(10);
                set("armor_prop/armor", 0);
                set("armor_prop/personality", 3);
                set("wear_msg", "$N轻轻地把一朵$n戴在头上。\n");
                set("unequip_msg", "$N轻轻地把$n从头上摘了下来。\n");
        }
        setup();
}

