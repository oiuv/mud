// xin.c

inherit ITEM;

void create()
{
        set_name("书信", ({"guiyun shuxin", "shu xin", "xin"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long","这是一封陆冠英写的邀请进入归云庄的书信。\n");
//		set("no_drop", "这样东西不能离开你。\n");
                set("material", "paper");
        }
}

