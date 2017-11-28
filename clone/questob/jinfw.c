// jinfw.c

inherit ITEM;

void create()
{
        set_name("金饭碗", ({ "jin fanwan", "fanwan" }));
        set_weight(1600);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
                set("long", "黄金打造的饭碗，沉重之极，上面还刻着几个字。\n");
                set("value", 1);
                set("material", "gold");
        }
        setup();
}

