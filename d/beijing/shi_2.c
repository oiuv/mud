#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西四北大街");
	set("long", @LONG
这里是京城的西四北大街，青石铺砌道路贯通南北，街道上的行人熙熙攘
攘。西方一条宽阔的大官道上马蹄声不断，尘土飞扬。向南通过西四南大街接
西单北大街。
LONG );
       set("exits", ([
		"north" : __DIR__"shi_3",
		"south" : __DIR__"shi_1",
		"west" : __DIR__"guandao_1",
	]));
	set("objects", ([
		__DIR__"npc/boy1" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

