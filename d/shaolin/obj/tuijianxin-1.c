// tuijianxin-1.c 推荐信 清-道

inherit ITEM;

void create()
{
        set_name("推荐信", ({"tuijian xin1", "xin1", "letter1"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long","这是一封清字辈师尊们为你写的推荐信，凭此可直接向道字辈高僧们学习武艺。\n");
//		set("no_drop", "这样东西不能离开你。\n");
                set("material", "paper");
        }
}

