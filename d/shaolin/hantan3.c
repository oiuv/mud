// Room: /d/shaolin/hantan3.c

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "万古寒潭");
	set("long", @LONG
这是寒潭之中。冰与水混合在一起，使整个潭水在此处变得
跟稀粥一样，身周的冰壳已凝成一个大块，除了双眼尚能透过冰
层视物外，全身各处都已动弹不得，只能听任水流带你继续往下
沉去。
LONG );
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
