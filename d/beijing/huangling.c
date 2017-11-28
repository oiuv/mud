#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "十三皇陵");
	set("long", @LONG
这里就是著名的明十三皇陵，相当的宏伟壮观。十三皇陵坐落于紫禁城的
西郊，在这里游玩观赏的游人甚多。
LONG NOR);
	set("exits", ([
		"south" : __DIR__"guandao_2",
	]));
	set("objects", ([
		__DIR__"npc/youren" : 2,
                "/clone/npc/walker" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

