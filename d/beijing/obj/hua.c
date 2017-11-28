#include <ansi.h>

inherit ITEM;

void create()
{
    set_name(HIC "œ ª®" NOR, ({ "flower" }) );
    set_weight(3);
    if( clonep() )
        set_default_object(__FILE__);
        else {
        set("long", "“ª∂‰œ ª®°£\n");
                set("unit", "∂‰");
                set("value", 0);
         }
    setup();
}