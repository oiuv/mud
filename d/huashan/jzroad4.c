// Room: /d/huashan/jzroad4.c

inherit ROOM;
void create()
{
	set("short", "中条山森林");
	set("long", @LONG
你走在中条山路上。路径狭小，周围茂密森林里，传来阵阵野兽
夜禽的嘶鸣，听来让人毛骨悚然。
LONG );
	set("exits", ([
		"westdown" : __DIR__"jzroad3",
		"southup"  : __DIR__"jzroad5",
	]));
	set("outdoors", "huashan");
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

