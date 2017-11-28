// square.c

inherit ROOM;

void create()
{
        set("short", "广场");
	set("long", @LONG
这里是华山派在山顶开辟的一块平台，平时聚会的时候使用。虽然不
大却很平整。东北通向练武场，那里是华山弟子练习功夫的地方，人来人
往，热闹非凡。西面有个小店。通常有许多华山派弟子在此买些物品。北
边的房屋门上挂着一块匾，上书「群仙观」，西北方似乎有条小道通往山
上。
LONG );
        set("exits", ([ /* sizeof() == 2 */
	    "northeast" : __DIR__"wuchang1",
            "northwest" : __DIR__"chaopath1",
            "south"     : __DIR__"yunu",
            "north"     : __DIR__"qunxianguan",
            "west"      : __DIR__"shop",
            "east"      : __DIR__"bingqifang",
        ]));

        set("objects", ([
            __DIR__"npc/gao-genming" : 1,
        ]));

        set("outdoors", "huashan" );

        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (! objectp(guarder = present("gao genming", this_object())))
                return 1;

        if (dir == "northeast" || dir == "east" || dir == "north")
                return guarder->permit_pass(me, dir);

        return 1;
}
