inherit ROOM;

void create()
{
	set("short", "破庙");
	set("long", @LONG
这是一间破破烂烂的土地庙，庙里破败不堪，土地神像推
在一旁，梁上地下也布满了灰尘。一看就知道已经很久没有人
来清理过了。正中放着个大香案，上面零乱地扔着几根剩下的
鸡骨头。丐帮江南分舵就被设在此处。
LONG);
	set("valid_startroom", 1);
	set("exits", ([
		"south" : __DIR__"ml4",
		"enter" : __DIR__"gbxiaowu",
	]));
	set("objects", ([
		CLASS_D("gaibang") + "/lu" : 1,
		CLASS_D("gaibang") + "/peng" : 1,
	]));
	setup();
	"/clone/board/gaibang_b"->foo();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir != "enter"
           || ! objectp(guard = present("lu youjiao", this_object()))
           && ! objectp(guard = present("peng youjing", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}
