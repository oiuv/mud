// /guanwai/road6.c
inherit ROOM;

void create()
{
	set("short", "大道");
	set("long", @LONG
你走在一条碎石铺成的大道上，道两旁种着笔直通天的白杨树，放眼向
两侧望去，全是无边无际的田野，天边处仿佛有几座低矮的丘陵，为平坦的
大地增加了几许柔和的曲线。路上渐渐的出现了一些积雪。
LONG );
	set("exits", ([
		"north" : __DIR__"road7",
		"south" : __DIR__"road5",
	]));
	set("objects",([
		__DIR__"npc/sanhu" : 1,
	]));
//	set("no_clean_up", 0);
 	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}

