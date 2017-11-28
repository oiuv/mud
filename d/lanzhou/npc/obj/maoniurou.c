// maoniurou.c ºÄÅ£Èâ

inherit F_FOOD;
inherit ITEM;

void create()
{
	set_name("ºÄÅ£Èâ", ({ "maoniu rou", "rou" }) );
        set_weight(350);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "Ò»¿éÉÕ¿¾µÃÏãÅçÅçµÄºÄÅ£Èâ¡£\n");
		set("unit", "¿é");
		set("value", 100);
		set("food_remaining", 4);
		set("food_supply", 25);
        }
        setup();
}

