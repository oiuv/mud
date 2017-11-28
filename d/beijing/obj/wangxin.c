// wangxin.c 书信

inherit ITEM;

void create()
{
        set_name("书信", ({"shu xin", "shuxin", "xin"}));
        set_weight(100);
        set("value",1);
        if( clonep() )
                set_default_object(__FILE__);
        else {
    		set("unit", "封");
            	set("long","这是一封洛阳韩家韩文冲大爷写给镇远镖局总镖头王维扬的回信。\n");
		set("header", "王维扬总镖头亲启");
		set("no_sell", 1);
		set("no_get", "这是别人的信，怎么可以拿？\n");
		set("no_put", 1);
                set("material", "paper");
        }
}