// turou.c

inherit F_FOOD;
inherit ITEM;

void create()
{
	set_name("兔肉", ({ "tu rou", "rou" }) );
        set_weight(300);
        if( clonep() )
                set_default_object(__FILE__);
        else {
		set("long", "一只烧烤得香香的兔肉。\n");
		set("unit", "只");
		set("value", 50);
		set("food_remaining", 3);
		set("food_supply", 25);
        }
    setup();
}

