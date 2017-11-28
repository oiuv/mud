#include <room.h>
inherit ROOM;

void create()
{
	set("short", "朝阳门");
	set("long", @LONG
这里就是京城的朝阳门了，城墙上刻着“朝阳门”三个大字。向西可以通
往京城最热闹王府井大街。这里人来车往，是进出京城的要道，城门两旁站满
了官兵，盘查十分严密。一条宽阔的大道沿着东西走向延伸，从这里出城到达
京城的东郊。
LONG );
       set("exits", ([
              "east" : __DIR__"road1",
		"west" : __DIR__"chaoyang_dao2",
	]));

	set("objects", ([
		__DIR__"npc/ducha" : 1,
		__DIR__"npc/bing1" : 2,
	]));

	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
