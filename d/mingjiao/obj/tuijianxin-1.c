// tuijianxin-1.c 推荐信 坛－门

inherit ITEM;

void create()
{
        set_name("推荐信", ({"tuijian xin1", "xin1", "letter1"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long","这是一封坛主为你写的推荐信，凭此可去见接引使者。\n");
                set("material", "paper");
        }
}

