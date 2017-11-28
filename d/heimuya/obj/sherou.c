// sherou.c ÉßÈâ

inherit F_FOOD;
inherit ITEM;

void create()
{
	set_name("ÉßÈâ", ({ "she rou", "rou" }) );
        set_weight(350);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "Ò»ÌõÉÕ¿¾µÃÏãÅçÅçµÄÉßÈâ¡£\n");
		set("unit", "Ìõ");
		set("value", 50);
		set("food_remaining", 3);
		set("food_supply", 20);
        }
    setup();
}

