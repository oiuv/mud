#include <room.h>
inherit ROOM;

void create()
{
	set("short", "虎坊路");
	set("long", @LONG
这里是京城的虎坊路，它东接凡陛桥。只要你身上有两钱儿，在这里就会
受到热情的招呼。任何你不知道的事，在这里打听一下，都可以知道个八九不
离十。北边邻街处有一家不大的客栈。南边是一座巨大的宅院，像是某个达官
贵人居住的场所。
LONG );
	set("exits", ([
		"south" : __DIR__"hai_men",
		"north" : __DIR__"fukedian",
		"east" : __DIR__"tianqiao",
		"west" : __DIR__"fu_1",
	]));
	set("objects", ([
		__DIR__"npc/haoke1" : 1,
		__DIR__"npc/girl2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
