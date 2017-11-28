#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIW "白瓷观音像" NOR, ({ "guanyin xiang", "guanyin", "xiang"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIW "经唐三彩烧制的白瓷观音像，非常的昂贵。\n" NOR);
                set("value", 1500);
        }
}
