// Room: /d/xiakedao/xkroad5.c
// Modified by Java on Feb.14.1998
inherit ROOM;

void create()
{
	set("short", "渔村晒网场");
	set("long", @LONG
小村不大，却有个好大的晒网场。几个小孩在场中无忧地玩耍，
声音喧闹。靠南海边上，有个渔夫面向大海，悠然垂钓。
LONG );
        set("outdoors", "nanhai");
	set("exits", ([
		"north"   : __DIR__"xkroad6",
		"west"    : __DIR__"xkroad4",
	]));
	set("objects", ([
		__DIR__"npc/boy": 1,
		__DIR__"npc/girl": 1,
		__DIR__"npc/yufu": 1,
	]));
	setup();
	replace_program(ROOM);
}
