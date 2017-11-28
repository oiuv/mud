// bufa.c
inherit ITEM;

void create()
{
	set_name( "商剑鸣亲笔书信",({ "sjm letter","letter" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "封");
		set("long","这是商剑鸣的亲笔书信，上书「尊师王维扬亲启」。\n");
		set("value", 100);
                set("no_sell", 1);
		set("material", "paper");

	}
}
