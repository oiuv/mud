#include <ansi.h> 
#include <armor.h>
inherit CLOTH;

void create()
{
    	set_name(HIB "Çà²¼ÅÛ" NOR, ({ "qing bupao", "bupao", "pao"}));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("armor_type", "cloth");
	        set("value", 100);
        	set("armor_prop/dodge", 1);
                set("armor_prop/armor", 1);
        }
        setup();
}
