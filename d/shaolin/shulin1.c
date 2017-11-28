// Room: /d/shaolin/shulin1.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "松树林");
	set("long", @LONG
这是一片松树林。几十丈高的大松树簇在一块，密实的枝叶
象一蓬蓬巨伞般伸向天空，把阳光遮得丝毫也无。尺把厚的松针
积在地上，一脚踩下去，半天拔不出来。
LONG );
	set("exits", ([
		"east" : __DIR__"shulin"+(random(10)+2),
		"south" : __DIR__"shulin2",
		"west" : __DIR__"guangchang1e",
		"north" : __DIR__"shulin"+(random(10)+2),
	]));
	set("outdoors", "shaolin");
	set("objects",([
		__DIR__"obj/fake-gold" : 1,
	]));
	setup();
	replace_program(ROOM);
}

