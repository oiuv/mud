// guanmu.c
inherit ITEM;

void create()
{
        set_name("灌木", ({ "guanmu" , "灌木"}) );
        set_weight(500);
        set_max_encumbrance(8000);
        set("no_get", 1);
        set("no_shown", 1);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "丛");
                set("long", "这是一丛不知名的灌木，生长得很茂盛。\n");
                set("value", 1);
        }
}

