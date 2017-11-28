//key.c
inherit ITEM;
void create()
{
        set_name( "²ñ", ({ "chai"}));
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "À¦");
                set("long","ÕâÊÇÒ»À¦Ä¾²ñ¡£\n");
                set("value", 0);
                set("material", "wood");
              }
}
