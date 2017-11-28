//cwbdao.c
#include <weapon.h>

inherit BLADE;

void create()
{
	set_name("闯王宝刀", ({ "chuangwang baodao", "blade","baodao" }) );
	set_weight(6000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
        	set("unit", "柄");
        	set("value", 500000);
                set("no_drop", 1);
        	set("material", "iron");
        	set("long", "这是闯王所使用过的刀，上面刻有几行小字。\n" );
        	set("wield_msg","一道白光，$n已在$N手中，只觉青光四射，寒气透骨，不禁机伶伶的打个冷战。\n");
        	set("unwield_msg", "$N将$n插回腰间，华光顿敛，天地间只闻龙鸣。\n");
	}
	init_blade(150);
	setup();
}
