//chahua1.c
#include <ansi.h>;
#include <armor.h>;
inherit HEAD;

void create()
{
        set_name(HIY"落第秀才"NOR, ({"cha hua", "hua"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "朵");
                set("long", 
"一株盛开的茶花，论颜色，一共是十七种。比十八学士少了一色，
偏又是驳而不纯，开起来或迟或早，花朵又有大有小。它处处东施
效颦，学那十八学士，却总是不像，好似个半瓶醋的酸丁。\n");
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
