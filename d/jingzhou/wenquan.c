inherit ROOM;

void create()
{
	set("short", "温泉井");
	set("long", @LONG
你看到一眼温泉呈现在你的面前，汩汩往外冒着热气和泉
水，温泉虽不大，但足以使人想到下去泡一泡，据说还可以疗
伤治病。
LONG);
        set("outdoors", "jingzhou");
	set("exits", ([
		"northup" : __DIR__"lydao2",
		"eastup" : __DIR__"lydao3",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

