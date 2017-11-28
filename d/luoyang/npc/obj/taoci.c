#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIC "翡翠鼻烟壶" NOR, ({ "biyan hu", "biyan", "biyan"}) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIC "陶瓷烧得便如翡翠一般，以此陶瓷所制的鼻烟壶。\n" NOR);
                set("value", 1500);
        }
}
