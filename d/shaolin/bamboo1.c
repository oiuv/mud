// Room: /d/shaolin/bamboo1.c
// Date: YZC 96/01/19

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "竹林");
	set("long", @LONG
这是一片密密的竹林。这里人迹罕至，惟闻足底叩击路面，有僧
敲木鱼声；微风吹拂竹叶，又如簌簌禅唱。令人尘心为之一涤，
真是绝佳的禅修所在。
LONG );
	set("exits", ([
		"northeast" : __DIR__"bamboo"+(random(13)+1),
		"southwest" : __DIR__"bamboo2",
		"northwest" : __DIR__"bamboo"+(random(13)+1),
		"southeast" : __DIR__"bamboo"+(random(13)+1),
		"south" : __DIR__"qfdian",
	]));
	create_door("south","木门","north",DOOR_CLOSED);
	set("outdoors", "shaolin");
	set("no_clean_up", 0);
	setup();
}

void init()
{
	this_player()->set_temp("bamboo/count", 0);
}

int valid_leave(object me, string dir)
{
	if (dir == "southwest" ) me->add_temp("bamboo/count", 1);
	else if (dir == "south") me->delete_temp("bamboo/count", 1);
	else 			 me->add_temp("bamboo/count", -1);

	return ::valid_leave(me, dir);
}

