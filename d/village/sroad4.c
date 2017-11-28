// Room: /d/village/sroad4.c

inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
这是一个宁静的小村子，稀稀落落的分布着几十间土坯泥房，看来村
中人家不多，而且大都生活很艰辛。这是一条南北向的碎石路，往北就是
村子中心的打谷场了，东面是村里唯一的青砖瓦房。
LONG );
        set("exits", ([ /* sizeof() == 3 */
            "north" : __DIR__"square",
            "south" : __DIR__"sroad3",
            "east"  : __DIR__"bighouse1",
        ]));
        set("outdoors", "village");

        setup();
        replace_program(ROOM);
}


