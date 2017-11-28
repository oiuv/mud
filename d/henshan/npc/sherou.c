inherit ITEM;
inherit F_FOOD;

void create()
{
    set_name("òşÉßÈâ", ({"she rou", "she"}));
    set_weight(3000);
    if (clonep())
        set_default_object(__FILE__);
    else {
        set("long", "Ò»´ó¿éòşÉßÈâ¡£\n");
        set("unit", "¿é");
        set("value", 500);
        set("food_remaining", 25);
        set("food_supply", 50);
    }
}
