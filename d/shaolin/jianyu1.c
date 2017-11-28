// Room: /d/shaolin/jianyu1.c
// Date: YZC 96/02/06

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "监狱");
	set("long", @LONG
这里黑沉沉的，即无一丝光亮，也无半分声息。黑暗中依稀
可以看到身边似乎有几个人影，看到你转过头去，他们立刻屏住
呼吸，紧张地瞪着你。四壁摸上去冰凉，且极硬，似乎都是钢铁
铸成，只有南北面各有一道小门，门上开了个巴掌大的洞，象是
送饭用的。脚边有一堆东西踢上去克剌剌地散了开来，细看却是
一具白得发亮的枯骨。
LONG );
	set("exits", ([
		"north" : __DIR__"jianyu",
	]));
	set("objects",([
		"/d/shaolin/npc/yu-zu" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

