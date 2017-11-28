// jiuzhuan.c 九转金丹
// Ivy为武林群侠传把原来每种先天属性+4修改为+2
//薪有所属改为+1
#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIY "九转金丹" NOR, ({ "jiuzhuan jindan", "jindan", "dan" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", HIY "一粒金色的仙丹，传说是太上老君"
					"精心炼制的灵丹妙药。\n" NOR);
		set("value", 50000000);
		set("unit", "粒");
		set("only_do_effect", 1);
	}
}

int do_effect(object me)
{
        int effect;

        log_file("static/using", sprintf("%s(%s) eat 九转金丹 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));

        effect = 0;
        message_vision("$N一仰脖，吞下了一颗" + this_object()->name() +
                       "。\n", me);
        if (me->query("gift/jiuzhuan/int") < 1 && random(2))
        {
                effect++;
                write(HIM "你觉得自己的头脑更清醒了。\n" NOR);
                me->add("gift/jiuzhuan/int", 1);
                me->add("int", 1);
        }

        if (me->query("gift/jiuzhuan/dex") < 1 && random(2))
        {
                effect++;
                write(HIR "你觉得自己的腿脚更灵活了。\n" NOR);
                me->add("gift/jiuzhuan/dex", 1);
                me->add("dex", 1);
        }

        if (me->query("gift/jiuzhuan/con") < 1 && random(2) &&
            me->query("gender") != "无性")
        {
                effect++;
                write(HIC "你觉得自己的内息更通畅了。\n" NOR);
                me->add("gift/jiuzhuan/con", 1);
                me->add("con", 1);
        }

        if (me->query("gift/jiuzhuan/str") < 1 && random(2))
        {
                effect++;
                write(HIG "你觉得自己的膂力更强健了。\n" NOR);
                me->add("gift/jiuzhuan/str", 1);
                me->add("str", 1);
        }

        if (! effect)
                tell_object(me, "不过你觉得好像没什么作用。\n");

        destruct(this_object());
	return 1;
}

