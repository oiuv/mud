// turou.c ∫Ï…’π∑»‚

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("∫Ï…’π∑»‚", ({"gou rou", "gou"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "“ªÕÎœ„≈Á≈Áµƒ∫Ï…’π∑»‚\n");
                set("unit", "ÕÎ");
                set("value", 200);
                set("food_remaining", 4);
                set("food_supply", 50);
        }
}

