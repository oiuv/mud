// Room: /lingzhou/jiangjungate.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "大将军府");
	set("long", @LONG
这里是征东大将军赫连铁树的府第，在东大街的正中，对面就是衙
门。一色高檐大屋，两个校尉看上去彪悍骁勇，此刻正神气活现的挎着
弯刀守在门前。
LONG );
	set("exits", ([
		"north"  : __DIR__"dongdajie",
		"south"  : __DIR__"jiangjunyuan",
	]));
	set("objects", ([
		__DIR__"npc/xiaowei" : 2,
	]));
	setup();
        create_door("south" , "油木大门", "north" , DOOR_CLOSED);
}

int valid_leave(object me, string dir)
{
//	int i;
        object wei;

        wei = present("xiao wei", environment(me));
        if (dir != "south" || ! objectp(wei) || ! living(wei))
                return ::valid_leave(me, dir);

        if (me->query("weiwang") >= 10000)
        {
                message_vision("$N笑道：“" + RANK_D->query_respect(me) +
                               "，请进，请进！这就去让人通报。”\n", wei, me);
                return ::valid_leave(me, dir);
        }

        if (me->query("special_skill/trick"))
        {
                message_vision("$N看见$n走了过来，刚想拦住，"
                               "却听$n一声断喝：“散开！”\n"
                               "不由得吓了一跳，讪讪的不敢说话。\n", wei, me);
                return ::valid_leave(me, dir);
        }

	return notify_fail("校尉上前挡住你，朗声说道：这位"  +
                           RANK_D->query_respect(me) + "请回吧。老爷不见客。\n");
}