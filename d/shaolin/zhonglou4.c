// Room: /d/shaolin/zhonglou4.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "钟楼四层");
	set("long", @LONG
到这里楼梯大概只能容一人上下，墙身也略薄了些。视线
越过窗棂，南边的练武场，罗汉堂，般若堂历历在目，不少僧
人正汇集在练武场上习武，吆喝声一阵阵传进耳鼓。北边的藏
经楼，方丈楼也尽露全貌。
LONG );
	set("exits", ([
		"up" : __DIR__"zhonglou5",
		"down" : __DIR__"zhonglou3",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

