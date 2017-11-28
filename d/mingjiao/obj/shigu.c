//shigu.c
#include <weapon.h>

inherit HAMMER;

void create()
{
    set_name("尸骨", ({ "shi gu", "shi","gu" }) );
    set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
        	set("unit", "只");
        	set("value", 50);
        	set("material", "wood");
        	set("long", "这是一只白森森的尸骨。\n");
        	set("wield_msg","$N手中握住一把$n，眼中露出阴邪的笑意。\n");
        	set("unwield_msg", "$N将$n插回腰间，脸色顿时也恢复了正常。\n");
	}
    	init_hammer(10);
	setup();
}
