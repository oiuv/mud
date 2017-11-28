#include <room.h>
inherit ROOM;

void create()
{
	set("short", "校场");
	set("long", @LONG
这里是京城兵营东方的一个大校场，校场里密密麻麻到处都是官兵，在武
将的指挥下列队操练，一个个官兵生龙活虎，整齐的排列着。还有些太监在四
处走动。东边是京城里著名的王府井大街。
LONG );
	set("exits", ([
		"east" : __DIR__"wang_3",
	]));

	set("objects", ([
		__DIR__"npc/taijian" : 1,
		__DIR__"npc/bing1" : 2,
		__DIR__"npc/bing2" : 2,
		__DIR__"npc/bing3" : 2,
		__DIR__"npc/yuqian1" : 1,
	]));

	setup();
        replace_program(ROOM);
}


