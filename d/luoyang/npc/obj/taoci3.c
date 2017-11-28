#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIR "淡朱菩提树" NOR, ({ "puti shu", "puti", "shu"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIR "经唐三彩烧制的淡朱菩提树，非常的昂贵。\n" NOR);
                set("value", 1500);
        }
}
