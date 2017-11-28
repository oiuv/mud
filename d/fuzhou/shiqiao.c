// Room: /d/fuzhou/shiqiao.c
// Date: May 12 1998 Java

inherit ROOM;

void create()
{
	set("short", "石桥");
	set("long", @LONG
这是城里一条普普通通的石桥。大概总有几百年历史
了，桥侧生满青苔，桥下有小孩戏水，岸边洗衣的母亲大
声呵斥着自己的孩子。
LONG );

	set("exits", ([
                "west"  : __DIR__"xiangyang",
                "east"  : __DIR__"nanmendou",
	]));
	set("objects", ([
                "/d/songshan/npc/sha" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}


