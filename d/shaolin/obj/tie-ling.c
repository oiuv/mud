inherit ITEM;

void create()
{
	set_name( "少林英雄令", ({ "yingxiong ling", "ling", "iron" }) );
	set_weight(100);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "块");
                set("long", "这是一块用于通行少林寺的铁铸令牌。 由方丈签发，邀各路英雄入寺观礼。\n");
		set("value", 100);
		set("material", "iron");
	}
	setup();
}

void init()
{
        call_out("dest", 1800);
}

void dest()
{
	destruct(this_object());
}
