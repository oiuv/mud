// Room: /d/huashan/jzroad2.c

inherit ROOM;
void create()
{
	set("short", "松树林");
	set("long", @LONG
这是一片松树林。中间一条小路，两边都是黑森森的几丈高的松
树。快出林了，可以看到东边好高的一道大山。
LONG );
	set("exits", ([
		"west" : __DIR__"jzroad1",
		"east" : __DIR__"jzroad3",
	]));
	set("outdoors", "huashan");
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}


