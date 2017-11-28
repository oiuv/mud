// Room: /d/xiakedao/xkroad2.c 佛山
// Modified by Java on Feb.14.1998
inherit ROOM;

void create()
{
	set("short", "佛山");
	set("long", @LONG
佛山是岭南繁华大镇，廛市街井，处处笙歌悦耳。
LONG );
        set("outdoors", "xiakedao");
	set("exits", ([
		"north"   : __DIR__"xkroad1",
		"south"   : __DIR__"xkroad3",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

