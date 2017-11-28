inherit ROOM;

void create()
{
	set("short", "金牛武馆一部");
	set("long", @LONG
这里是金牛武馆教授一部，师傅陈浒教授基本轻功，基本
内功，基本招架，基本拳法，基本杖法，基本棍法。
LONG);
	set("objects", ([
		__DIR__"npc/chenhu" : 1,
	]));
        set("no_fight",1);
        set("no_steal",1);
        set("no_beg",1);
	set("no_clean_up", 0);
	set("exits", ([
		"west" : __DIR__"wuguan",
	]));
	setup();
	replace_program(ROOM);
}
