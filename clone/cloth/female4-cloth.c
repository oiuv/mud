// female4-cloth.c
//
// This is the basic equip for players just login.

#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(HIY"¶ì»Æ¼Ð°À"NOR, ({ "yellow ao", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
		set("long", "Ò»¼þÅ®º¢Ï²»¶µÄ¶ì»Æ¼Ð°À¡£\n");
                set("material", "cloth");
                set("value", 0);
                set("armor_prop/armor", 3);
		set("female_only", 1);
        }
        setup();
}

