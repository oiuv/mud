inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是一条通往万安寺后殿的木制走廊，走廊里静悄悄的，没什么人走动。后
方是万安寺的大殿了。
LONG );
        set("exits", ([
                "north" : "/d/tulong/yitian/was_houdian",
                "south" : "/d/tulong/yitian/was_dadian",
        ]));

        setup();
}

