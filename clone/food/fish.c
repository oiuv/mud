inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("烤鱼", ({"kao yu", "yu"}));
        set_weight(100);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一条香喷喷的烤鱼。\n");
                set("unit", "条");
                set("food_remaining", 4);
                set("food_supply", 30);
        }
}
