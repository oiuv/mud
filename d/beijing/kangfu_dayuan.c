#include <room.h>
inherit ROOM;

void create()
{
	set("short", "康府大院");
	set("long", @LONG
这是康亲王府大门东边的一个宽阔的大院，院内打扫得非常干净，周围还
种满了各类花草，康府里的下人穿梭其中，北边是一条木制走廊，通往康府的
大厅。
LONG );
       set("exits", ([
		"west" : __DIR__"kangfu_men",
		"north" : __DIR__"kangfu_zoulang1",
	]));
	set("objects", ([
		__DIR__"npc/jiading_k" : 2,
		__DIR__"npc/yuanding" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}