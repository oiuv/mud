//qingpao.c

#include <armor.h>

inherit CLOTH;

void create()
{
    set_name("青色丝袍", ({"si pao", "cloth", "pao"}) );
    set_weight(1000);
    if( clonep() )
       set_default_object(__FILE__);
    else {
	set("female_only", 1);
	set("unit", "件");
	set("long", "这是件质地轻柔的青色镂花丝袍，特别受女性青睐。\n");
	set("material", "cloth");
        set("value",70);
	set("armor_prop/armor", 4);
    }
    setup();
}
