// tea_leaf.c
 
#include <weapon.h>
 
inherit THROWING;
 
void create()
{
        set_name("茶叶", ({ "tea_leaf", "tea" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "才采的新茶，发出一股淡淡的香气。\n");
                set("unit", "把");
                set("value", 0);
                set("base_unit", "片");
                set("base_weight", 1);
                set("base_value", 0);
		set("damage", 1);	//Here the damage=int_throwing, added by King
        }
        set_amount(50);
        init_throwing(1);
        setup();
}
