// Room: /lanzhou/tudimiao.c
// xws 1998/10/14 

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "土地庙");
	set("long", @LONG
这里是土地庙，里面有一座土地公公的泥像，庙内香烟缭绕，有许多做买卖的
的人在此上香礼拜。武人到此，也都要放下武器，毕恭毕敬地上香礼拜。
LONG
	);
	set("no_fight", "1");
	set("no_steal", "1");
	set("no_hit", "1");
	set("no_kill", "1");
	set("exits", ([
		"north": __DIR__"dongdajie1",
	]));
       	setup();
	//replace_program(ROOM);
}

void init()
{
   object me;
    me=this_player();
me->set("startroom",base_name(environment(me)));
    return;
}
