// teie-ling.c
inherit ITEM;

void create()
{
	set_name( "重阳令", ({ "chongyang ling", "ling", "iron" }) );
	set_weight(100);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "块");
                set("long", "这是一块用于通行重阳宫的铁铸令牌。 由丹阳真人签发，邀各路英雄入宫观礼。\n");
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
