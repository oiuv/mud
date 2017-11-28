// zhitao.c 指套

#include <armor.h>
#include <ansi.h>

inherit HANDS;

void create()
{
	set_name( HIY"黄金指套"NOR, ({ "gold finger", "finger", "zhitao" }) );
	set_weight(2000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "副");
		set("long", "这是五个环环相链的黄金指套，可以加强指法、手法和爪法的伤害力。\n");
		set("value", 200000);
		set("material", "steel");		
              set("armor_prop/finger", 10);              
              set("armor_prop/unarmed_damage", 50); 
              set("armor_prop/claw", 10);
              set("armor_prop/hand", 10);
              set("armor_prop/armor", 10); 
	}
	setup();
}
void owner_is_killed()
{
        destruct(this_object());
} 
//int query_autoload() { return 1; }


