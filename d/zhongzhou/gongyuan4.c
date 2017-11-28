inherit ROOM;

void create()
{
	set("short", "中州贡院");
	set("long", @LONG
中州贡院是天下最热闹的一所考场，每月初一，全国各地
的士子都来此处赶考。院门两边由士兵看守，要想夹带可不行
围墙上有张新贴的告示。
LONG);
	set("objects", ([
  		"/d/kaifeng/npc/zhukao3" : 1,
	]));
	set("no_clean_up", 0);

	set("exits", ([
  		"south" : __DIR__"yanling2",
	]));

        set("outdoors", "zhongzhou");
	setup();
        replace_program(ROOM);
}
