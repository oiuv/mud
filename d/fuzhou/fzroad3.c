// Room: /d/fuzhou/fzroad3.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "闽浙古道");
	set("long", @LONG
自古入闽无敞途。往来货运全靠肩挑背扛，逶迤入闽，车马
不通。古道号称“三千八百坎”，宽仅三尺，青石砌就，行商头
脚相继。下到坎底，就是延平府城了。
LONG );
	set("exits", ([
		"northdown" : __DIR__"fzroad2",
		"southdown" : __DIR__"yanping",
	]));
        set("objects", ([
		"/d/taishan/npc/tiao-fu" : 2,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

