#include <ansi.h>
inherit ITEM;

void init(object ob)
{
        if (find_call_out("destguo") != -1)
                return;

        remove_call_out("destguo");
	call_out("destguo", 10, ob);
}

void destguo(object ob)
{
	ob = this_object();

        message_vision(HIM "\n只见$N" HIM "慢慢渗出水来，一会就腐烂掉了。\n\n"
                       NOR, ob);
        destruct(ob);
}

void create()
{
	set_name(HIM "人参果" NOR, ({"renshen guo", "renshen", "guo"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
        	set("unit", "只");
        	set("long", HIM "这是一只已经成型的人参果，真的象极了三"
                            "周不满的小孩。\n" NOR);
                set("only_do_effect", 1);
        }
	setup();
}

int do_effect(object me)
{
	me->add("max_neili", 10);

        if (me->query("max_neili") > me->query_neili_limit())
                me->set("max_neili", me->query_neili_limit());

	me->set("neili", me->query("max_neili"));
	me->set("eff_qi", me->query("max_qi"));
	me->set("qi", me->query("eff_qi"));

        message_vision(HIM "\n$N" HIM "吃下一枚人参果，只觉得精神健旺，内"
                       "力充沛，真气源源而\n生，甚至不再感到饥饿干渴。\n\n", me);

	destruct(this_object());
	return 1;
}
