// coin.c
#include <ansi.h>
inherit MONEY;

void create()
{
	set_name(HIY"铜钱"NOR, ({"coin", "coins", "coin_money" }));
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("money_id", "coin");
		set("long", "这是流通中单位最小的货币，约要一百文铜板才值得一两白银。\n");
		set("unit", "些");
		set("base_value", 1);
		set("base_unit", "文");
		set("base_weight", 1);
	}
	set_amount(1);
}

