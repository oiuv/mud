// Pill: sanxiaosan.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(NOR + WHT "三笑逍遥散" NOR, ({"sanxiao san", "san"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", NOR + WHT "一包无色的粉末, 看样子不是寻常物品. \n" NOR);
		set("unit", "包");
		set("poison_type", "sanxiao_poison");
                set("can_pour", 1);
                set("can_daub", 0);
                set("can_drug", 1);
                set("poison", ([
                        "level" : 200,
                        "id"    : "ding chunqiu",
                        "name"  : "三笑逍遥散毒",
                        "duration": 20,
                ]));
		set("value", 2000);
                set("no_sell", 1);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
        message_vision("$N仰头咽下一包" + name() + "。\n", me);
        me->set_temp("die_reason", "服下三笑逍遥散，死的异常幸福");
        me->die();
        destruct(this_object());
	return 1;
}
