#include <room.h>
inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
走在山路上，只听四下群鸟争鸣，前方群山耸立。令人心
旷神怡。
LONG );
       set("exits", ([
		"northup" : "/d/jueqing/shanjiao",
		"southwest" : __DIR__"shulin",
	]));
	set("outdoors", "xiangyang");
	setup();
	replace_program(ROOM);
}