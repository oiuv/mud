#include <room.h>
inherit ROOM;

void create()
{
	set("short", "康亲王书房");
	set("long", @LONG
这里是康亲王书房，房中书架上整整齐齐地堆放着很多书。不过书上积了
一些灰尘，显然是很久没有动过了。而书橱里的几件精巧玉器却更显得玲珑剔
透，光彩照人。
LONG );
	set("exits", ([
		"south" : __DIR__"kangfu_zoulang2",
	]));

	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
