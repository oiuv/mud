// Room: /d/shaolin/bamboo.c
// Date: YZC 96/01/19

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "竹林小道");
	set("long", @LONG
这是一条卵石铺成的小道，曲曲折折地通向前方。两边是
密密的竹林。这里人迹罕至，惟闻足底叩击路面，微风吹拂竹
叶，令人尘心为之一涤。但除了幽静之外，却隐隐有股杀气弥
漫在这竹林之中，不禁让人心里一紧。
LONG );
	set("exits", ([
		"west"  : __DIR__"qinglong",
//		"south" : __DIR__"zhulin1",
		"north" : __DIR__"nanmen",
	]));

	set("outdoors", "quanzhou");
	create_door("west","木门","east",DOOR_CLOSED);
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

