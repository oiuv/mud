// Room: /d/huashan/jzroad3.c

inherit ROOM;
void create()
{
	set("short", "中条山脚");
	set("long", @LONG
你来到中条山脚。仰望天空，山势压顶，天边的红霞映透了整个
山林，呼啸的穿山风刮个不停。你不禁有些惧意。向东有一条上山小
路。
LONG );
	set("exits", ([
		"west"   : __DIR__"jzroad2",
		"eastup" : __DIR__"jzroad4",
	]));
	set("outdoors", "huashan");
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}


