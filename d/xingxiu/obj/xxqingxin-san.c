#include <ansi.h>

inherit ITEM;

void create()
{
   	set_name("清心散", ({"qingxin san", "san"}));
	set_weight(120);
   	if (clonep())
      		set_default_object(__FILE__);
   	else {
      		set("unit", "包");
      		set("value", 1000);
		set("only_do_effect", 1);
   	}
   	setup();
}

int do_effect(object me)
{
   	message_vision("$N吃下一包" + name() + "。\n", me);
   	if ((int)me->query_condition("xx_poison") > 0)
      		me->clear("xx_poison");

   	destruct(this_object());
   	return 1;
}
