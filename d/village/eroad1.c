// Room: /d/village/eroad1.c

inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
这是一个宁静的小村子，稀稀落落的分布着几十间土坯泥房，看来村
中人家不多，而且大都生活很艰辛。一条碎石路，往西通向村子的中心，
往东就是出村的路了。南面是一间很简陋的草棚。
LONG );
        set("exits", ([ /* sizeof() == 3 */
            "south" : __DIR__"ehouse1",
            "east"  : __DIR__"eexit",
            "west"  : __DIR__"eroad2",
        ]));

        set("outdoors", "village");

        setup();
        replace_program(ROOM);
}


