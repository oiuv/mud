inherit ROOM;

void create()
{
        set("short", "大门");
        set("long", @LONG
这就是闻名天下的白驼山庄的大门。只见大门梁上雕龙刻
凤，美奂美仑，不知凝聚着多少能工巧匠的心血。更显出庄主
的富有与显贵。门前左右各蹲着一只威武庄严的石狮子。
LONG);
        set("outdoors", "baituo");

        set("exits", ([
                "north" : __DIR__"yuanzi",
                "southdown" : __DIR__"shijie",
        ]));

        set("objects", ([
                __DIR__"npc/menwei" : 2,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (objectp(guarder = present("men wei", this_object()))
           && dir == "north")
                return guarder->permit_pass(me, dir);

        return 1;
}
