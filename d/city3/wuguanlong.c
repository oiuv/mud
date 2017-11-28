inherit ROOM;

void create()
{
	set("short", "金牛武馆二部");
	set("long", @LONG
这是金牛武馆教授二部，师傅龙铨教授基本轻功，基本内
功，基本招架，基本爪法，基本刀法。
LONG);
	set("objects", ([
		__DIR__"npc/longquan" : 1,
	]));
        set("no_fight",1);
        set("no_steal",1);
        set("no_beg",1);
	set("no_clean_up", 0);
	set("exits", ([
		"north" : __DIR__"wuguan",
	]));
	setup();
	replace_program(ROOM);
}
