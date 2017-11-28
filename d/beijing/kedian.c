#include <room.h>
inherit ROOM;

void create()
{
	set("short", "客店");
	set("long", @LONG
这是一家规模很小的客店，店里的摆设也相当的陈旧和简陋。客店的老板
是一个老头，因为这间小店的成本小，老头也就没请其它人帮忙，客店内外的
一切都是由他在打理。客店的柜台上挂着一个牌子(paizi)。
LONG );
       set("exits", ([
		"east" : __DIR__"caroad_w1",
	]));
	set("item_desc", ([
		"paizi" : "牌子上歪歪斜斜的写着两个字：\n\n"
                        "                       客满！\n\n",
	]));
	set("objects", ([
		__DIR__"npc/chenlaotou" : 1,
		__DIR__"npc/youren" : 1,
	]));
	set("outdoors", "beijing");
	setup();

	"/clone/board/kedian2_b"->foo();
	replace_program(ROOM);
}

