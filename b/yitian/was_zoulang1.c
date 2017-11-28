inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是一条通往万安寺后厅的木制走廊，走廊里静悄悄的，没什么人走动。
左右两旁是两个侧厅。
LONG );
        set("exits", ([
                "north" : __DIR__"was_zoulang2",
                "south" : __DIR__"was_dayuan",
                "east" : __DIR__"was_tinge",
                "west" : __DIR__"was_tingw",
        ]));

        setup();
}

