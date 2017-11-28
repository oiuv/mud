// Room: /d/shaolin/andao2.c
// Date: YZC 96/02/06

#include <login.h>
#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", "暗道");
	set("long", @LONG
这是一个阴暗潮湿的地道，四壁用粗糙的片岩垒垛而成，一
颗颗水珠沿着墙壁滚下来，溅在地上。也许是因为长时间无人通
行的缘故，整个地道弥漫着一股腐尸般的恶臭。
LONG );
	set("exits", ([
		"up" : __DIR__"gulou1",
	]));
	set("no_clean_up", 0);
	setup();
}

void init()
{       
	object ob;

	if( interactive(ob = this_player()) 
	&& (int)ob->query_condition("bonze_jail") >= 0 )
	{
		message("vision",
			HIY "只听水声哗啦啦地一响，一个满脸漆黑，全身泥浆的家伙爬了过来！\n\n" NOR, 
			environment(ob), ob);

		tell_object(ob, "你觉得混身轻松，总算走出了这个五行迷魂阵，逃出生天了！\n");

		ob->set("startroom", START_ROOM);
		ob->clear_condition("bonze_jail");
	}
}

