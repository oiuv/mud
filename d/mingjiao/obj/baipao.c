// baipao.c
//

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("白布长袍", ({ "cloth","pao" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else
	{
                set("unit", "件");
		set("long", 
			"这是件白布长袍，虽不奢华，却洗得一尘不染，在袍襟上锈了一团血红的火焰，\n"
			"颇为鲜艳。\n");
                set("material", "cloth");
                set("armor_prop/armor", 1);
        }
        setup();
}

