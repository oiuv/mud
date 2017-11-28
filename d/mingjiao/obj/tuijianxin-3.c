// tuijianxin-3.c 推荐信 旗-堂

inherit ITEM;

void create()
{
        set_name("推荐信", ({"tuijian xin3", "xin3", "letter3"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long","这是一封掌旗使为你写的推荐信，凭此可去见内三堂堂主。\n");
                set("material", "paper");
        }
}

