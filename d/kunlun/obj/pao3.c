#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(BLU "白边蓝色长袍" NOR, ({ "chang pao", "cloth","changpao","pao"}));
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "这是一件白色滚边做工精细的蓝色长袍。\n");
                set("unit", "件");
                set("material", "cloth");
                set("armor_prop/armor", 30);
                set("value", 100);
                set("wear_msg","$N把$n迎风一展，缓缓的披在身上。\n");
                set("remove_msg","$N轻轻的把$n从身上脱了下来。\n");
        }
        setup();
}
