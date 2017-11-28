// Room:/d/changan/tulu2.c

inherit ROOM;

void create()
{
	set("short", "土路");
	set("long", @LONG
这是一条黄土飞扬的路，不算太宽，南边远远望过去可以看得
到巍峨的长安城墙，虽然这里离长安并不远，但是经常会受到北方
的游牧民族的骚扰，因此人烟并不茂盛。
LONG);
	set("exits",  ([  /*  sizeof()  ==  2  */
		"northeast": __DIR__"tulu2",
		"south"    : __DIR__"bei-chengmen",
	]));
	set("outdoors", "changan");
	setup();
	replace_program(ROOM);
}
