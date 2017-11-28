// unknow.c 未名仙丹

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIR "无名仙丹" NOR, ({ "unknow xiandan", "unknow", "xiandan"}));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", HIR "一颗园园的火红仙丹，不知道有什么用处。\n" NOR);
		set("value", 10000);
		set("unit", "颗");
		set("only_do_effect", 1);
	}
}

int do_effect(object me)
{
        message_vision("$N一仰脖，吞下了一颗" + this_object()->name() +
                       "。\n", me);
        if (me->query("gift/xiandan/dex") >= 5)
        {
                message_vision("$N摇摇晃晃的，突然“啪嗒”一下子摔了个跟头。\n", me);
                tell_object(me, "你觉得吃完以后头重脚轻的。\n");
        } else
        if (random(5) == 0)
        {
                tell_object(me, "不过你觉得好像没什么作用。\n");
        } else
        {
                tell_object(me, HIM "霎时间你觉得腿骨欲裂，一时疼痛难"
			    "忍，晕了过去。\n" NOR);
                me->add("dex", 1);
                me->unconcious();
        }

        me->add("gift/xiandan/dex", 1);
        destruct(this_object());
	return 1;
}
