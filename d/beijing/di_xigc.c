#include <room.h>
inherit ROOM;

void create()
{
	set("short", "地安门西街广场");
	set("long", @LONG
这里是地安门的西街的广场，地安门东西大街向两头延伸，这里也京城里
的繁华地段，是京城北边的交通要道。广场上热闹非凡，小贩们沿街叫卖着自
己的货物，其中也不乏夹杂着一些流氓混混。南边是京城的特务机构西厂的所
在地。东边就是地安门广场了。
LONG );
       set("exits", ([
		"north" : __DIR__"di_5",
		"south" : __DIR__"di_2",
		"east" : __DIR__"dianmen",
		"west" : __DIR__"di_3",
	]));
	set("objects", ([
		__DIR__"npc/xianren" : 1,
		__DIR__"npc/hunhun" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

