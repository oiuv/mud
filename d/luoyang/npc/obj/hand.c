// jinshou.c

#include <armor.h>
#include <ansi.h>

inherit HANDS;

void create()
{
	set_name( HIY "黄金手掌" NOR, ({ "gold hand", "hand" }) );
	set_weight(2000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "steel");
		set("unit", "块");
		set("long", "这是一块黄金制成的掌套，可以加强拳法、掌法和拳脚的伤害力。\n");
		set("value", 200000);
              set("armor_prop/strike", 10);              
              set("armor_prop/unarmed_damage", 50); 
              set("armor_prop/unarmed", 10);
              set("armor_prop/cuff", 10);
              set("armor_prop/armor", 10); 
            }
	setup();
}
void owner_is_killed()
{
        destruct(this_object());
} 
//int query_autoload() { return 1; }


