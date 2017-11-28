#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIW "碧玉瓷马" NOR, ({ "biyu cima", "biyu", "cima"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIW "经唐三彩烧制的碧玉陶瓷马，非常的昂贵。\n" NOR);
                set("value", 1500);
        }
}
