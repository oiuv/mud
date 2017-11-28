#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(WHT "黑边白色长袍" NOR, ({ "chang pao", "cloth","changpao","pao"}));
        set_weight(6000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "这是一件黑色滚边的白色长袍，华贵异常，看不出是什么质料做的。\n");
                set("unit", "件");
                set("material", "cloth");
                set("armor_prop/armor", 65);
                set("value", 100);
                set("wear_msg","$N迎风一展，[唰]的一声，披上一件$n。\n");
                set("remove_msg","$N解开$n,把$n从身上脱了下来。\n");
        }
        setup();
}
