inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是个长廊，一直通向后院，南边是西练武场。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "north" : __DIR__"guofu_shilu-4",
               "south" : __DIR__"guofu_wuchang3",
        ]));
        setup();
        replace_program(ROOM);
}
