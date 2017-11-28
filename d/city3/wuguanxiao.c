inherit ROOM;

void create()
{
	set("short", "金牛武馆三部");
	set("long", @LONG
这里是金牛武馆教授三部，师傅萧飞教授基本轻功，基本
内功，基本招架，基本指法，基本暗器。
LONG);
	set("objects", ([
		__DIR__"npc/xiaofei" : 1,
	]));
        set("no_fight",1);
        set("no_steal",1);
        set("no_beg",1);
	set("no_clean_up", 0);
	set("exits", ([
		"east" : __DIR__"wuguan",
	]));
	setup();
	replace_program(ROOM);
}
