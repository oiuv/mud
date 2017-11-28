// Room:/d/changan/tulu4.c

inherit ROOM;

void create()
{
	set("short", "土路");
	set("long", @LONG
这是一条黄土飞扬的路，不算太宽，路上的行人也不多，大概
是地处偏远的缘故，几乎没有什么人烟。
LONG);
	set("exits",  ([  /*  sizeof()  ==  2  */
		"northdown" : "/d/huanghe/yongdeng",
		"southwest" : __DIR__"tulu3",
	]));
	set("outdoors", "changan");
	setup();
	replace_program(ROOM);
}
