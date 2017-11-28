// paper.c
inherit ITEM;

void create()
{
        set_name("信纸", ({"letter paper", "paper"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long",
"这是张普通的信纸，上面是岳不群写给朋友的家常信，信已写好，而且\n"
"盖上了私印，大概走的匆忙忘记带上了。\n");
                set("material", "paper");
        }
}

