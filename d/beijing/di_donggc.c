#include <room.h>
inherit ROOM;

void create()
{
	set("short", "地安门东街广场");
	set("long", @LONG
这里是地安门的东街的广场，地安门东西大街向两头延伸，这里也京城里
的繁华地段，是京城北边的交通要道。广场上热闹非凡，小贩们沿街叫卖着自
己的货物，其中也不乏夹杂着一些流氓混混。南边是京城的特务机构东厂的所
在地。西边是地安门广场，东边接京城著名的王府井大街。
LONG );
       set("exits", ([
		"north" : __DIR__"dong_2",
		"south" : __DIR__"dong_1",
		"east" : __DIR__"wang_9",
		"west" : __DIR__"dianmen",
	]));
	set("objects", ([
		__DIR__"npc/liumang" : 1,
		__DIR__"npc/kid1" : 1,
		__DIR__"npc/girl2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

