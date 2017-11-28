// tuijianxin-4.c 推荐信 堂-王

inherit ITEM;

void create()
{
        set_name("推荐信", ({"tuijian xin4", "xin4", "letter4"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long","这是一封堂主为你写的推荐信，凭此可去见护教法王。\n");
                set("material", "paper");
        }
}

