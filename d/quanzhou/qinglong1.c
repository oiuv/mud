// Room: /d/quanzhou/bamboo.c

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "青龙会大庭");
	set("long", @LONG
这是一片密密的竹林。这里人迹罕至，惟闻足底叩击路面，有僧
敲木鱼声；微风吹拂竹叶，又如簌簌禅唱。令人尘心为之一涤，
真是绝佳的禅修所在。
LONG );
	set("exits", ([
		"east" : __DIR__"qinglong",
	]));
//	set("objects",([
//		__DIR__"npc/tang3" : 1,
//	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

