//key.c
inherit ITEM;
void create()
{
        set_name( "钥匙", ({ "key"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long","这是一把普通的铜钥匙。\n");
                set("value", 0);
                set("material", "iron");
        }
}
