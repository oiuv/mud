#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(YEL "白边黄色长袍" NOR, ({ "chang pao", "cloth","changpao","pao"}));
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "这是一件白色滚边黄色长袍，做工似乎比较简单。\n");
                set("unit", "件");
                set("material", "cloth");
                set("armor_prop/armor", 10);
                set("value", 100);
                set("wear_msg","$N把$n迎风一展，缓缓的披在身上。\n");
                set("remove_msg","$N轻轻的把$n从身上脱了下来。\n");
        }
        setup();
}
