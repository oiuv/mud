// feather.c

#include <armor.h>
#include <ansi.h>
#include <mudlib.h>

inherit CLOTH;

void create()
{
        set_name(GRN"孔雀羽衣"NOR, ({ "feather" }) ); 
        set("no_drop", "1");
        set("no_get", "1");
        set_weight(600);

        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "这件孔雀羽衣是用孔雀羽毛织成的。\n");
                set("unit", "件");
	        set("value", 5000);
                set("material", "feature");
                set("armor_prop/personality", 10);
                set("armor_prop/armor", 10);
                set("armor_prop/armor_vs_force", 10);
                set("armor_prop/attack", -2); 
        }
        setup();
}

int query_autoload() { return 1; }
