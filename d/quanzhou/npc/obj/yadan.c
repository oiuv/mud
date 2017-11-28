// yadan.c 
// Jay 5/23/96

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("≥Ù—ºµ∞", ({"chou yadan", "yadan", "egg"}));
        set_weight(70);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "≥Ù—ºµ∞Œ≈◊≈≥Ù£¨≥‘◊≈œ„°£\n");
                set("unit", "ø≈");
                set("value", 80);
                set("food_remaining", 1);
                set("food_supply", 80);
        }
}

