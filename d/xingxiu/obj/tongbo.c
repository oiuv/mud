// tongbo.c
//

inherit ITEM;

void create()
{
        set_name("铜钹", ({ "tongbo" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "对");
                set("long", "这是一对金光闪亮的铜钹。\n");
                set("value", 50);
        }
        setup();
}
