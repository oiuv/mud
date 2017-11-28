// Room: /d/xiakedao/xkroad1.c 南岭山口
// Modified by Java on Feb.14.1998
inherit ROOM;

void create()
{
	set("short", "南岭山口");
	set("long", @LONG
这里是南岭的一个山口。南面就是佛山了，北面是横亘湖南广东
的五岭。这里地气炎热，百物速生快长，口音也远异中原了。
LONG );
        set("outdoors", "xiakedao");
	set("exits", ([
		"northup" : "/d/henshan/hsroad9",
		"south"   : __DIR__"xkroad2",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

