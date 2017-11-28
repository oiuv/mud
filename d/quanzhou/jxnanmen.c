inherit ROOM;

void create()
{
        set("short", "嘉兴南门");
        set("long", @LONG
这里是嘉兴的南门。周围长着茂密的竹林。东面是座庙宇。
向南可入福建。向东南就是号称天堂的杭州城了。
LONG );
        set("exits", ([
                "north"    : __DIR__"jiaxing",
                "east"     : __DIR__"tieqiang",
                "south"    : __DIR__"qzroad4",
                "southwest": __DIR__"majiu2",
                "southeast": "/d/hangzhou/road1",
        ]));
        set("outdoors", "jiaxing");
        setup();
        replace_program(ROOM);
}

