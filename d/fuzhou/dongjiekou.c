// Room: /d/fuzhou/dongjiekou.c
// may. 12 1998 Java

inherit ROOM;

void create()
{
	set("short", "东街口");
	set("long", @LONG
这里是福州的中心。向东通往鼓山，向南经泉州出海可
去台湾，北去屏山，向西经延平府直达中原。街边沉沉郁郁
的都是榕树，福州又称“榕城”即以其遍地植榕而名。
    街上几个混混嬉皮笑脸地调戏过往行人。
LONG );

	set("exits", ([
		"south"   : __DIR__"nandajie",
		"north"   : __DIR__"beidajie",
		"east"    : __DIR__"dongdajie",
		"west"    : __DIR__"xidajie",
	]));
	set("objects", ([
		"/d/city/npc/liumangtou" : 1,
		"/d/city/npc/liumang" : 3,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

