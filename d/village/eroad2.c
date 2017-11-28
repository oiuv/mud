// Room: /d/village/eroad2.c

inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
这是一个宁静的小村子，稀稀落落的分布着几十间土坯泥房，看来村
中人家不多，而且大都生活很艰辛。这是一条东西向的碎石路，北面是间
结实的民宅。
LONG );
        set("exits", ([ /* sizeof() == 3 */
            "east"  : __DIR__"eroad1",
            "west"  : __DIR__"eroad3",
            "north" : __DIR__"ehouse2",
        ]));

        set("outdoors", "village");

        setup();
        replace_program(ROOM);
}

