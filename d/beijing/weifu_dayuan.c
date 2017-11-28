#include <room.h>
inherit ROOM;

void create()
{
	set("short", "韦府大院");
	set("long", @LONG
这是鹿鼎公府正厅前面的一个宽阔的大院，大院里种植着各类花草，假山
水池，琼楼高台，非常豪华。院内打扫得非常干净，韦府里的下人穿梭其中，
北边是一条木制走廊，通往康府的大厅。
LONG );
       set("exits", ([
		"south" : __DIR__"weifu_zoulang1",
		"north" : __DIR__"weifu_zoulang2",
	]));
	set("objects", ([
		__DIR__"npc/yuanding" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}