#include <room.h>
inherit ROOM;

void create()
{
	set("short", "朝阳道");
	set("long", @LONG
你走在尘土飞扬的朝阳道上，道路两旁是整整齐齐的杨树林，不时有两三
骑快马从身边飞驰而过，扬起一路尘埃。东边不远处就是朝阳门了，西边是繁
华的王府井大街，人声鼎沸，十分热闹。
LONG );
       set("exits", ([
		"west" : __DIR__"wang_4",
		"east" : __DIR__"chaoyang_dao2",
	]));
	set("objects", ([
		__DIR__"npc/tangzi" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

