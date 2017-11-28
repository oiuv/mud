inherit ROOM;

void create()
{
        set("short", "雪山山谷");
        set("long", @LONG
山谷里遍地积雪，四周都是峭壁。只北面有一个出口，东
面似乎有个山洞。
LONG );
        set("exits", ([
                "westdown" : __DIR__"wangyougu",
                "east"     : __DIR__"shandong2",
        ]));
        set("objects", ([
                CLASS_D("xuedao") + "/shengdi" :1,
        ]));
        set("outdoors", "xuedao");
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (dir == "east" &&
            objectp(guarder = present("sheng di", this_object())))
        {
                return guarder->permit_pass(me, dir);
        }

        return ::valid_leave(me, dir);
}

