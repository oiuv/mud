// cao.c

inherit ITEM;

void create()
{
        set_name("药草", ({ "cao" }) );
        set_weight(500);
        set_max_encumbrance(8000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "堆");
                set("no_shown",1);
                set("no_get",1);
                set("long", "这是一堆药草。\n");
                set("value", 1);
        }
}

