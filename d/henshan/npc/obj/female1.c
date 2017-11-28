#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(HIG "湖绿长裙" NOR, ({ "green skirt", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
		set("long", "一件清新可人的湖绿长裙。\n");
                set("material", "cloth");
                set("value", 0);
                set("armor_prop/armor", 3);
		set("female_only", 1);
        }
        setup();
}

