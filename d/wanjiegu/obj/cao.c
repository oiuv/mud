// cao.c

inherit ITEM;

void create()
{
        set_name("“©≤›", ({ "cao" }) );
        set_weight(500);
        set_max_encumbrance(8000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "∂—");
                set("no_shown",1);
                set("no_get",1);
                set("long", "’‚ «“ª∂—“©≤›°£\n");
                set("value", 1);
        }
}

