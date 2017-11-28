// greyrobe.c 灰色道袍

#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name(WHT"灰色道袍"NOR, ({"pao", "cloth", "dao pao"}) );
        set_weight(1200);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "一件普普通通的灰布道袍。\n");
                set("material", "cloth");
                set("armor_prop/armor", 2);
        }
        setup();
}
