#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西厢房");
	set("long", @LONG
这里是康亲王府的左边的一个厢房，是供王府的客人居住的。这里站着一
个身材瘦高的武师，两手别在腰后，似乎有一身好武功。
LONG );
	set("exits", ([
		"east" : __DIR__"kangfu_zoulang2",
	]));

	set("objects", ([
		__DIR__"npc/qiyuankai" : 1,
	]));

	set("sleep_room", "1");
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
