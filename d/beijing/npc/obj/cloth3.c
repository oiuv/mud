#include <ansi.h>

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("马褂", ({ "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", 
"一件普通的马褂。\n");
                set("material", "cloth");
                set("armor_prop/armor", 1);
        }
        setup();
}

