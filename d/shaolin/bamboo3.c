// Room: /d/shaolin/bamboo3.c
// Date: YZC 96/01/19

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
		"south" : __DIR__"bamboo"+(random(13)+1),
		"north" : __DIR__"bamboo4",
		"east" : __DIR__"bamboo"+(random(13)+1),
		"west" : __DIR__"bamboo"+(random(13)+1),
	]));
	set("no_clean_up", 0);
	set("outdoors", "shaolin");
	setup();
}

int valid_leave(object me, string dir)
{
	if (dir == "north" ) me->add_temp("bamboo/count", 1);
	else 			 me->add_temp("bamboo/count", -1);

	return ::valid_leave(me, dir);
}

