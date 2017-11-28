// greenrobe.c 青色道袍
// By Marz

#include <armor.h>

inherit CLOTH;

void create()
{
	set_name("青色道袍", ({"pao", "cloth", "dao pao"}) );
    set_weight(1500);
    if( clonep() )
       set_default_object(__FILE__);
    else {
	    set("female_only", 1);
        set("unit", "件");
		set("long", "这是件质地轻软的青色道袍，边上还镂着花呢。\n");
        set("material", "cloth");
        set("armor_prop/armor", 1);
    }
    setup();
}
