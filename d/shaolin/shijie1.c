inherit ROOM;

void create()
{
	set("short", "石阶");
	set("long", @LONG
这里是嵩山南麓的少室山山脚。一条长长的石阶如同巨龙般
蜿蜒而上，直没云端。嵩山群峰壁立，翠色满山，令人俯仰间顿
生渺小之意。边上有几个叫卖的小贩和挑夫，似乎在嚷嚷着争吵
些什么。
LONG );
	set("exits", ([
		"east"    : "/d/songshan/taishique",
		"west"    : __DIR__"xiaojing1",
		"northup" : __DIR__"shijie2",
	]));
	set("objects",([
		__DIR__"npc/xiao-fan" : 1,
		__DIR__"npc/tiao-fu" : 2,
                "/clone/npc/walker" : 1,
	]));
	set("outdoors", "shaolin");
	setup();
	replace_program(ROOM);
}

