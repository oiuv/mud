// caomei.c

inherit F_FOOD;
inherit ITEM;

void create()
{
	set_name("²ÝÝ®", ({ "cao mei", "mei" }) );
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "Ò»¿ÅÏÊºìµÄ²ÝÝ®¡£\n");
		set("unit", "¿Å");
		set("value", 5);
		set("food_remaining", 1);
		set("food_supply", 10);
        }
    setup();
}

