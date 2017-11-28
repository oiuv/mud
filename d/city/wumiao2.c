#include <ansi.h>
#include <room.h>
#include <festival.h>
inherit ROOM;

void create()
{
	set("short", "武庙二楼");
	set("long", @LONG
这里是岳王庙的二楼，这里供的是岳飞的长子岳云和义子
张宪，两尊塑像金盔银铠，英气勃勃。听说在炎黄子孙的传统
节假日来这里祈祷(pray)会得到祝福。
LONG);
	set("no_fight", 1);
	set("no_steal", 1);
	set("no_beg", 1);
	set("no_sleep_room", 1);

	set("exits", ([
                  "down" : __DIR__"wumiao",
	              ]));

	set("objects", ([
	                    "/adm/daemons/task/npc/zixu" : 1,
	                ]));
	setup();
}

void init()
{
	add_action("do_pray", "pray");
}

int do_pray(string arg)
{
	object me = this_player();
	int exp, pot, day, month, *date, exp0, exp1;
	date = localtime(time());
	month = date[4] + 1;
	day = date[3];
	exp = me->query("combat_exp");
	exp0 = me->query("experience");
	exp1 = me->query("learned_experience");

	if (me->is_busy())
	{
		return notify_fail("你现在正忙着呢，没法静下心来祈祷。\n");
	}

	message_vision(HIG "\n$N" HIG "跪在神像前，恭恭敬敬的磕了三个响头，然后默默的祈祷着。\n" NOR, me);
	/*
	        if (me->query("festival/15.5.1"))
	        {
	             me->delete("festival");
	             log_file("static/log", sprintf("%s(%s) 删除festival记录于 %s.\n",
	                      me->name(1), me->query("id"), ctime(time())));
	        }
	*/
	if (month == FETEMONTH && day >= BEGIN_DAY && day <= END_DAY)
	{
		if (me->query(FESTIVAL) == day)
		{
			if (day == END_DAY)
				tell_object(me, HIR "你已经被祝福过了，请下次节假日再来吧。\n" NOR);
			else
				tell_object(me, HIR "你今天已经被祝福过了，请明天再来吧。\n" NOR);
			return 1;
		}
		if (me->query("potential") > me->query_potential_limit())
		{
			tell_object(me, HIB "你感觉自己的祈祷有用，可不知道为什么没有效果。\n" NOR);
			return 1;
		}

		if (exp >= 800000)
			pot = 3000 + random(9)*100;
		else if (exp >= 350000)
			pot = 2000 + random(6)*100;
		else if (exp >= 100000)
			pot = 1500 + random(3)*100;
		else
			pot = exp / 100 + 100;
		//pot /= 2;
		me->add("potential", pot);
		if (! me->query("skybook/guard/death"))
			me->set("skybook/guard/death", 1);
		me->set(FESTIVAL, day);
		message_vision(HIW "冥冥之中好像有一个声音传来：" HIR "祝$N" HIR + FETEDAY "游戏快乐" HIW "。\n" NOR, me);
		tell_object(me, HIY "只见一道灵光闪现，你得到神灵祝福，获得了" + chinese_number(pot) + "点潜能。\n" NOR);
		me->start_busy(5);
		return 1;
	}

	if (! me->query("skybook/guard/death") &&
	        (exp < 100000 || random(exp / 100) < me->query("kar")))
	{
		me->set("skybook/guard/death", 1);
		me->start_busy(10);
		message_vision(HIW "\n$N" HIW "身上泛起一层淡淡的白光，显得神秘莫测。\n" NOR, me);
		tell_object(me, HIY "你的祈祷得到回应，受到神灵的护佑。\n" NOR);
		return 1;
	}

	if ( exp0 < exp1 )
	{
		me->set("learned_experience", exp0);
		me->start_busy(10);
		message_vision(HIC "\n$N" HIW "身上泛起一层淡淡的光芒，显得神秘莫测。\n" NOR, me);
		tell_object(me, HIY "你的祈祷得到回应，感觉棒棒哒。\n" NOR);
		return 1;
	}

	tell_object(me, HIB "你感觉自己的祈祷没有任何效果。\n" NOR);
	me->start_busy(1 + random(10));
	return 1;
}

