// greenrobe.c 青色道袍

#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(HIG"青色道袍"NOR, ({"pao", "cloth", "dao pao"}) );
        set_weight(1500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("female_only", 1);
                set("unit", "件");
                set("long", "这是件质地柔软的青色道袍。\n");
                set("material", "silk");
                set("armor_prop/armor", 3);
        }
        setup();
}
