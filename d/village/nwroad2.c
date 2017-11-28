// Room: /d/village/nwroad2.c

inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
这是一个宁静的小村子，稀稀落落的分布着几十间土坯泥房，看来村
中人家不多，而且大都生活很艰辛。东南边就是村子中心的打谷场了，西
南是间民房。
LONG
        );
        set("exits", ([ /* sizeof() == 3 */
            "northwest" : __DIR__"nwroad1",
            "southeast" : __DIR__"square",
            "southwest" : __DIR__"nwhouse",
        ]));
        set("outdoors", "village");

        setup();
        replace_program(ROOM);
}


