// tuijianxin-2.c 推荐信 门-旗

inherit ITEM;

void create()
{
        set_name("推荐信", ({"tuijian xin2", "xin2", "letter2"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long","这是一封门主为你写的推荐信，凭此可去见五行旗掌旗使。\n");
                set("material", "paper");
        }
}

