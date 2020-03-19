#include <weapon.h>
#include <ansi.h>
inherit THROWING;
void create()
{
        set_name("小飞刀", ({ "xiao feidao", "feidao" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 500);
                set("base_unit", "把");
                set("base_value", 100);
                set("base_weight", 1000);
                set("material", "steel");
                set("long", "一把雪亮的飞刀。\n");
                
        }
       set_amount(5);
       init_throwing(15);
       setup();
}