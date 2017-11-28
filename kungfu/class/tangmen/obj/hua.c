// tanghua.c
#include <ansi.h>
#include <weapon.h>
inherit ITEM;

void create()
{
        set_name(HIG "唐花" NOR, ({"tang hua", "hua" }));
        set_weight(50);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", HIR"这是一朵铁花，但美若昙花，精致玲珑，让人一看之下，就动人心魄。\n"NOR);
                set("unit", "枚");
                set("value", 21);
        }
        setup();
}
