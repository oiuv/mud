// jinbiao.c
#include <ansi.h>
#include <weapon.h>

inherit THROWING;

void create()
{
	set_name(HIY"金镖"NOR, ({"jinbiao", "biao" }));
	if( clonep() )
		set_default_object(__FILE__);
	else
	{
     		set("long", "这是一把用纯金打造成的飞镖，价格昂贵，闪闪发光。\n");
		set("unit", "些");
           	set("base_value", 200);
		set("material", "gold");
         	set("base_unit", "枚");
		set("base_weight", 50); 
	}	
       set_amount(1);
       init_throwing(80,100010);
       setup();
}