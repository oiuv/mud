// xiandan.c 仙丹

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIG "灵慧仙丹" NOR, ({ "linghui xiandan", "linghui", "xiandan" }) );
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", HIG "一颗园园的仙丹，据说吃了可以增强智力。\n" NOR);
		set("value", 10000);
		set("unit", "颗");
		set("only_do_effect", 1);
	}
}

int do_effect(object me)
{
        message_vision("$N一仰脖，吞下了一颗" + this_object()->name() +
                       "。\n", me);
        if (me->query("gift/xiandan/int") >= 5)
        {
                message_vision("$N忽然“哇哇”，吐了一地。\n", me);
                tell_object(me, "你觉得嘴里非常的苦。\n");
        } else
        if (random(5) == 0)
        {
                tell_object(me, "不过你觉得好像没什么作用。\n");
        } else
        {
                tell_object(me, HIG "一股火热蓦然从脑中升起，"
                            "你头痛欲裂，恰在此时一股清凉之意"
			    "油然而起，顿感舒泰无比。\n");
                me->add("int", 1);
        }

        me->add("gift/xiandan/int", 1);
        destruct(this_object());
	return 1;
}
