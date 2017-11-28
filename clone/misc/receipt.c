// receipt.c 回执

inherit ITEM;

int is_receipt() { return 1; }

void create()
{
        set_name("回执", ({ "receipt" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", "这是一张回执！\n");
                set("value", 1);
                set("no_sell", 1);
        }
        setup();
}
