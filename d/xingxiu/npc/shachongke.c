inherit ITEM;

void create()
{
        set_name("沙虫壳", ({"shachong ke", "ke"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", "这是一只沙虫的干壳，是制备毒药的原料。\n");
                set("value", 300);
        }

        setup();
}
