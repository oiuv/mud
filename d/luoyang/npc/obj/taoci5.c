#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIC "玲珑飞天佩" NOR, ({ "feitian pei", "feitian", "pei"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIC "经唐三彩烧制的玲珑飞天佩，非常的昂贵。\n" NOR);
                set("value", 1500);
        }
}
