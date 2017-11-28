inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是一条通往万安寺后厅的木制走廊，走廊里静悄悄的，没什么人走动。左
右两旁是两个侧厅。
LONG );
        set("exits", ([
                "north" : "/d/tulong/yitian/was_zoulang2",
                "south" : "/d/tulong/yitian/was_dayuan",
                "east" : "/d/tulong/yitian/was_tinge",
                "west" : "/d/tulong/yitian/was_tingw",
        ]));

        setup();
}

