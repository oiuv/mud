 // Room: /xiakedao/lin8.c

inherit ROOM;

void create()
{
        set("short", "树林");
        set("long", @LONG
终于走出了树林，你不禁长长的松了口气。和煦的阳光照在你的
身上，使你感到无比的温暖。南边是一座高耸的石山，山上郁郁苍苍，
生满树木。
LONG );
        set("outdoors", "xiakedao");
        set("exits", ([
              "south" : __DIR__"shanmen",
              "north" : __DIR__"lin7",
        ]));
        setup();
        replace_program(ROOM);
}
