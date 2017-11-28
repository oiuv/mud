inherit ROOM;
#include <ansi.h>

void create()
{
	set("short", "西厂");
	set("long", @LONG
这里就是京城的特务机构——西厂。大厅内很是宽阔，这里警备深严，穿
着制服的西厂官兵和太监在这里来回走动。看来这里不宜久留，赶快离开为妙。
LONG NOR);
	set("exits", ([
		"north" : __DIR__"xichang_men",
	]));
	set("objects", ([
		__DIR__"npc/bing3" : 4,
		__DIR__"npc/taijian" : 1,
	]));
	set("no_fight", 1);
	setup();
        replace_program(ROOM);
}
