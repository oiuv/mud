// shenliwan.c 神力丸

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIC "神力仙丹" NOR, ({ "shenli xiandan", "shenli", "xiandan"}) );
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", HIC "一颗园园的仙丹，据说吃了可以增强膂力。\n" NOR);
		set("value", 10000);
		set("unit", "颗");
		set("only_do_effect", 1);
	}
}

int do_effect(object me)
{
        message_vision("$N一仰脖，吞下了一颗" + this_object()->name() +
                       "。\n", me);
        if (me->query("gift/xiandan/str") >= 5)
        {
                message_vision("$N眨眨眼。\n", me);
                tell_object(me, "你觉得这药没啥味道，还不如花生好吃。\n");
        } else
        if (random(5) == 0)
        {
                tell_object(me, "不过你觉得好像没什么作用。\n");
        } else
        {
                tell_object(me, HIR "你觉得双臂几乎爆裂，充满了力量。\n" NOR);
                me->add("str", 1);
        }

        me->add("gift/xiandan/str", 1);
        destruct(this_object());
	return 1;
}
