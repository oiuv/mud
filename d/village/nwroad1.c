// Room: /d/village/nwroad1.c

inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
这是一个宁静的小村子，稀稀落落的分布着几十间土坯泥房，看来村
中人家不多，而且大都生活很艰辛。东北边有间小庙，庙匾上的字早已模
糊不清，看不出是什麽庙了。
LONG );
        set("exits", ([ /* sizeof() == 3 */
            "west"      : __DIR__"wexit",
            "southeast" : __DIR__"nwroad2",
            "northeast" : __DIR__"temple1",
        ]));
        set("outdoors", "village");

        setup();
        replace_program(ROOM);
}

