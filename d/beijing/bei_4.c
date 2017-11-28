#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西单北大街");
	set("long", @LONG
这里是北京城的西单北大街，宽阔的大道向南北走向延伸。街道上的行人
接踵而至，市井的喧哗声、官兵的马蹄声以及小商小贩的吆喝声不断，鱼龙混
杂其中，很是热闹。北方通往地西大街。
LONG );
       set("exits", ([
		"west" : __DIR__"bei_3",
		"north" : __DIR__"di_1",
		"south" : __DIR__"bei_2",
	]));
	set("objects", ([
		__DIR__"npc/youren" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

