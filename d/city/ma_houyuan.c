inherit ROOM;

void create()
{
        set("short", "马庄后院");
        set("long", @LONG
这里是马庄的后院，布景和大院差不多。四周虽然聚集着
许多乞丐，但院内却是打整得很干净，便似一个大户人家的庭
园一般。通往大厅的门前守卫着几个乞丐。
LONG);
        set("outdoors", "city");
        set("exits", ([
                "north" : __DIR__"ma_zhengting",
                "south" : __DIR__"ma_dayuan",
        ]));
        set("no_clean_up", 0);
	set("objects", ([
		"/d/gaibang/npc/6dai" : 1 + random(2),
		"/d/gaibang/npc/7dai" : random(2),
                CLASS_D("gaibang") + "/quan" : 1,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir != "north"
           || ! objectp(guard = present("quan guanqing", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}


