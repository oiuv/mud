#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西单北大街");
	set("long", @LONG
这里是北京城的西单北大街，宽阔的大道向南北走向延伸。街道上的行人
接踵而至，市井的喧哗声、官兵的马蹄声以及小商小贩的吆喝声不断，鱼龙混
杂其中，很是热闹。往西走的通西城门，东边是一座富丽堂皇的建筑，门额上
悬挂一方横匾，写着“康亲王府”四个大字。
LONG );
       set("exits", ([
		"east" : __DIR__"kangfu_men",
		"west" : __DIR__"bei_1",
		"north" : __DIR__"bei_4",
		"south" : __DIR__"xi_2",
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

