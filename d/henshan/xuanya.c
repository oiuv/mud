#include <ansi.h>
inherit ROOM;

void create()
{
	set("short","悬崖边");
	set("long",@LONG
这里是紫盖仙洞外的悬崖绝壁(xuanya)，站在此处向下望
去，云深锁雾，寒风吹来，你不由地打了个寒战。
LONG);
	set("item_desc", ([
	       "xuanya"  : HIG "\n只见从绝壁上垂下一些树藤(teng)， 似乎可以顺着"
                           "爬(climb)\n上去。而下面却是万丈深渊，深不见底。\n" NOR,

	       "teng"    : YEL"\n这些树藤看起来很结实。\n" NOR,
	]));

	set("exits",([
	       "south":__DIR__"zigaihole",
	]));	    
	
	setup();

}

void init()
{
	add_action("do_tiao", ({"tiao", "jump"}));
	add_action("do_climb", "climb");
}

int do_tiao(string arg)
{
	object me, room1, room2;
	string msg;

	me=this_player();
	
	if (! room1 = find_object(__DIR__"xuanya"))
              	room1 = load_object(__DIR__"xuanya");

 	if (! arg || (arg != "ya" && arg != "xuanya" && 
                      arg != "悬崖"))
		return 0;
	
	if (me->is_fighting() || me->is_busy())
	{
		write("你现在正忙着呢。\n");
		return 1;
	}	

	if (! room2 = find_object(__DIR__"xuanyadi"))
              	room2 = load_object(__DIR__"xuanyadi");

	msg = HIC"\n你鼓起勇气往悬崖下一跳，耳边的风“呼呼”作响，你感"
              "觉越\n落越快，一颗心都要掉了出来，猛然间你看见下面有一棵大树，"
              HIC"\n你伸手抓住树枝，但是树枝却“啪”的一声断了，你重重地摔\n"
	      HIC"在地上，顿时昏了过去。\n\n" NOR;

	write(msg);
        me->move(room2);
	me->unconcious();
       
	me->receive_wound("qi", (int)(me->query("max_qi") / 2));

        if (random(99)<62)
		CHANNEL_D->do_channel(this_object(), "rumor", 
                   	   me->name() + "不幸坠下衡山悬崖，生死不明！");
	
	return 1;
}

int do_climb(string arg)
{
	object me, room;
	string msg;

	me = this_player();

	if (! room = find_object(__DIR__"zigai"))
		room=load_object(__DIR__"zigai");
	
	if (! arg || arg != "teng")
		return notify_fail("\n你要往哪儿爬。\n\n");

	if (me->is_fighting() || me->is_busy())
		return notify_fail("\n你正忙着呢。\n\n");

	msg = HIG "\n$N拉着树藤往峭壁上爬去。\n\n" NOR;

	message_vision(msg, me);
	write(HIW "\n你终于爬了上来。\n\n" NOR);
	message("vision", HIG "\n" + me->name() + HIG "从峭壁下面爬了上来。\n\n" NOR,
                          room, me);

	me->move(room);

	return 1;
	
}


