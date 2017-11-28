// letter.c
inherit ITEM;

void create()
{
        set_name("手信", ({"hand letter"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long",
"这是华山派掌门岳不群的手信，请冯铁匠把打好的宝剑交给执信弟子。\n");
                set("material", "paper");
        }
}

