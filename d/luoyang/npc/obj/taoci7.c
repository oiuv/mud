#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(WHT "七窍墨云斗" NOR, ({ "moyun dou", "moyun", "dou"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", WHT "经唐三彩烧制的七窍墨云斗，非常的昂贵。\n" NOR);
                set("value", 1500);
        }
}
