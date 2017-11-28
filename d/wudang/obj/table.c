//table.c 破桌子
inherit ITEM;
void create()
{
        set_name("破桌子", ({ "table" , "zhuo zi"}) );
        set_weight(5000);
        set_max_encumbrance(8000000);
        set("no_get", 1);
        set("no_shown", 1);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", "这张破桌子放在这里，说不出的诡异。\n");
                set("value", 1);
        }
}

int is_container() { return 1; }

