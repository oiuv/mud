// hedinghong.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(RED"º×¶¥ºì"NOR, ({"heding hong", "hong"}));
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»Æ¿¾ç¶¾µÄ¶¾Ò©, Èç¹ûÓÃÀ´Á¶°µÆ÷ÓÐ¼ûÑª·âºíÖ®Ð§. \n");
		set("unit", "Æ¿");
		set("value", 20000);
                set("only_do_effect", 1);
	}
	setup();
}

int do_effect(object me)
{
	message_vision("$NÑöÍ·¹¾à½¹¾à½¹àÏÂÒ»Æ¿" + name() + "¡£\n", me);
        me->set_temp("die_reason", "ºÈÁËº×¶¥ºì£¬ÖÐ¶¾ËÀÁË");
	me->die();
	destruct(this_object());
	return 1;
}
