// Room: /d/shaolin/shulin8.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "松树林");
	set("long", @LONG
你眼前骤然一黑，朦胧中，只见左右前后，到处都是铺天盖
地的松树林。几十丈高的大松树簇在一块，密实的枝叶象一蓬蓬
巨伞般伸向天空，把阳光遮得丝毫也无。尺把厚的松针积在地上，
一脚踩下去，半天拔不出来。你似乎迷失了方向，象没头苍蝇般
到处乱闯。
LONG );
	set("exits", ([
		"east" : __DIR__"shulin7",
		"south" : __DIR__"shulin"+(random(10)+2),
		"west" : __DIR__"shulin14",
		"north" : __DIR__"shulin"+(random(10)+2),
	]));
	set("outdoors", "shaolin");
	setup();
	replace_program(ROOM);
}

