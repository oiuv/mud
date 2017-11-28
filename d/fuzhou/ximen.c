// Room: /d/fuzhou/ximen.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "福州西门");
	set("long", @LONG
这里是福州西门。出此门向西可达中原。
LONG );
	set("exits", ([
                "east" : __DIR__"ximendajie",
                "west" : __DIR__"fzroad11",
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

