inherit ROOM;

void create()
{
        set("short", "天山脚下");
        set("long", @LONG
这里是天山脚下，西面是高耸入云的天山。天晴的时候可
以看到山顶上的冰川。一道天山将西域分为两半。北疆是西域
各族的聚居区，南疆是无边的塔克拉马干大沙漠。
LONG);
        set("exits", ([
                "westup" : __DIR__"tianroad1",
                "north"  : __DIR__"kedian",
                "northwest" : __DIR__"beijiang",
                "southwest" : __DIR__"nanjiang",
                "southeast" : __DIR__"silk4",
        ]));

        set("objects", ([
                __DIR__"npc/trader" : 1,
                "/clone/npc/walker" : 1,
        ]));

        set("outdoors", "xiyu");

        setup();
}

int valid_leave(object me, string dir)
{
	if (! userp(me) && dir == "southwest")
		return 0;

	return ::valid_leave(me, dir);
}
