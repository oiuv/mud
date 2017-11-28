#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西单北大街");
	set("long", @LONG
这里是北京城的西单北大街，宽阔的大道向南北走向延伸。街道上的行人
接踵而至，市井的喧哗声、官兵的马蹄声以及小商小贩的吆喝声不断，鱼龙混
杂其中，很是热闹。西边的街道通西城门。
LONG );
       set("exits", ([
		"east" : __DIR__"bei_2",
		"west" : __DIR__"ximenkou",
		"north" : __DIR__"bei_3",
		"south" : __DIR__"xi_1",
	]));
	set("objects", ([
		__DIR__"npc/youren" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

