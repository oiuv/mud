#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIC "八宝莲花座" NOR, ({ "lianhua zuo", "lianhua", "zuo"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIC "经唐三彩烧制的八宝莲花座，非常的昂贵。\n" NOR);
                set("value", 1500);
        }
}
