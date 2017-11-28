// yaoshi.c

inherit ITEM;

void create()
{
	set_name("地牢钥匙", ({"dilao key", "key"}));
	set("long",
		"这是一把很普通的钥匙。\n");
	set("unit", "把");
	set_weight(10);
}

