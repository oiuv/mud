#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西单北大街");
	set("long", @LONG
这里是北京城的西单北大街，宽阔的大道向南北走向延伸。街道上的行人
接踵而至，市井的喧哗声、官兵的马蹄声以及小商小贩的吆喝声不断，鱼龙混
杂其中，很是热闹。西边是热闹的北街菜市，北方就是西四南大街了。
LONG );
       set("exits", ([
		"east" : __DIR__"bei_4",
		"west" : __DIR__"caishi",
		"north" : __DIR__"shi_1",
		"south" : __DIR__"bei_1",
	]));
	set("objects", ([
		__DIR__"npc/girl3" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

