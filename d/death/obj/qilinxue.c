// boots.c 麒麟靴
 
#include <armor.h>
#include <ansi.h>
 
inherit BOOTS;
 
void create()
{
        set_name(HIR "麒麟靴" NOR, ({ "qilin xue", "xue", "boots" }) );
	set_weight(800);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "leather");
		set("unit", "双");
		set("long", HIR "这是一双用上麒麟皮作的皮靴，据说可以赴汤蹈火。用以保护足部。\n" NOR);
		set("value", 100000);
		set("armor_prop/dodge", 80);
	}
	setup();
}
