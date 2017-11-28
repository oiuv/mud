// tonghao.c
//

inherit ITEM;

void create()
{
        set_name("铜号", ({ "tonghao" }) );
        set_weight(2000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", "这是一把金光闪亮的铜号。\n");
                set("value", 50);
        }
        setup();
}
