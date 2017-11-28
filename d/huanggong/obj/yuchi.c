// yuchi.c 鱼翅

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("鱼翅", ({"yu chi", "yu"}));
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "上等鱼翅,味道鲜美.其实也就那么回事.\n");
                set("unit", "碟");
                set("value", 100);
                set("food_remaining", 1);
                set("food_supply", 1);
        }
}
