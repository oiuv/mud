//key.c
inherit ITEM;
void create()
{
        set_name( "柴", ({ "chai"}));
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "捆");
                set("long","这是一捆木柴。\n");
                set("value", 0);
                set("material", "wood");
              }
}
