inherit ROOM;

void create()
{
        set("short", "星宿海");
        set("long", @LONG
这里是星宿海的尽头。因为附近有野羊出没，所以星宿派
弟子常常在此烤羊肉串吃。当打不到野羊时，他们就抢山下牧
人的羊。
LONG);
        set("exits", ([
             "southeast" : __DIR__"xxh3",
             "southwest" : __DIR__"xxh4",
        ]));
        set("objects", ([
                __DIR__"npc/boshou"  : 1,
                __DIR__"obj/yangrou" : 2
        ]));
        set("outdoors", "xingxiu");
        setup();
        replace_program(ROOM);
}

