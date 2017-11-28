#include <room.h>
inherit ROOM;

void create()
{
	set("short", "地东大街");
	set("long", @LONG
这里是北京城地安门的东街。街道是整整齐齐的杨树林，道上行人络绎不
绝，车两马匹穿插其中。大街上由闲逛的游人，上京赶考的考生，背负着担子
的挑夫以及正在玩耍着的幼童构出了一幅繁忙热闹的盛世景象。北边是文庙。
南边是宽阔的王府井大街。
LONG );
       set("exits", ([
		"north" : __DIR__"wenmiao",
		"south" : __DIR__"wang_9",
		"west" : __DIR__"dong_2",
	]));
	set("objects", ([
		__DIR__"npc/shusheng1" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

