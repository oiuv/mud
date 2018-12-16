#include <room.h>
inherit ROOM;

void create()
{
	set("short", "虎坊路");
	set("long", @LONG
这里是京城的虎坊路，它东接凡陛桥。只要你身上有两钱儿，在这里就会
受到热情的招呼。任何你不知道的事，在这里打听一下，都可以知道个八九不
离十。南边有一家小小的面馆，从里面传来一阵轰闹声。
LONG );
	set("exits", ([
		"south" : __DIR__"mianguan",
		"east" : __DIR__"fu_2",
	]));

	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
