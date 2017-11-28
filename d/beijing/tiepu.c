#include <room.h>
inherit ROOM;

void create()
{
	set("short", "打铁铺");
	set("long", @LONG
这是永内东街的一家简陋的打铁铺，中心摆着一个火炉，炉火把四周照得
一片通红，你一走进去就感到浑身火热。打铁铺的墙角堆满了已完工和未完工
的菜刀、铁锤、铁棍、匕首、盔甲等物。一位铁匠满头大汗挥舞着铁锤，专心
致志地在打铁。
LONG );
       set("exits", ([
		"north" : __DIR__"yong_2",
	]));
	set("objects", ([
		__DIR__"npc/tiehuoji" : 1,
		__DIR__"npc/tiejiang" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

