// Room: /d/shaolin/taijie.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "台阶");
	set("long", @LONG
穿过山门殿，面前三道平行的青石台阶通向前方的一个高
台。台阶上精工镂刻着麒麟，玄龟，松鹤等瑞兽，形态逼真动
人。高台正中方着个二人高的青铜大香炉，前面摆着个香台，
几位香客正在虔诚谟拜。再往前就是天王殿。
LONG );
	set("exits", ([
		"east" : __DIR__"beilin1",
		"south" : __DIR__"smdian",
		"west" : __DIR__"beilin2",
		"northup" : __DIR__"twdian",
	]));
	set("outdoors", "shaolin");
	set("objects",([
		__DIR__"npc/xiang-ke" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

