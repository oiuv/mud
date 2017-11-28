inherit ITEM;

void create()
{
	set_name("水烟", ({"shui yan", "shui", "yan"}));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "这是一卷水烟丝。\n");
		set("unit", "卷");
		set("value", 10);
    	}
}
