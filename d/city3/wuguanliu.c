inherit ROOM;

void create()
{
	set("short", "金牛武馆四部");
	set("long", @LONG
这里是金牛武馆教授四部，师傅刘虹瑛教授基本轻功，基
本内功，基本招架，基本掌法，基本剑法。
LONG);
	set("objects", ([
		__DIR__"npc/liuhongying" : 1,
	]));
        set("no_fight",1);
        set("no_steal",1);
        set("no_beg",1);
	set("no_clean_up", 0);
	set("exits", ([
		"south" : __DIR__"wuguan",
	]));
	setup();
	replace_program(ROOM);
}
