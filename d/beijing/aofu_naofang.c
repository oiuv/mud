#include <room.h>
inherit ROOM;

void create()
{
	set("short", "鳌府牢房");
	set("long", @LONG
这是一个昏暗的房间，窗户都被钉死。地上放着皮鞭、木棍等刑具，显然
这是鳌拜私立公堂，审讯人犯的所在。一个书生被捆在墙上，鲜血淋漓，遍体
鳞伤。
LONG );
	set("exits", ([
		"south" :  __DIR__"aofu_houyuan",
	]));
	set("objects", ([
		 __DIR__"npc/zhuangyu" : 1,
	]));

	setup();
        replace_program(ROOM);
}


