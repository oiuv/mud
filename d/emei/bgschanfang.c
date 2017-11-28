inherit ROOM;

void create()
{
        set("short", "禅房");
        set("long", @LONG
这儿是保国寺内的一间禅房，布局简单，供寺内和尚诵经
修行之用。
LONG);
        set("exits", ([
                "east"    : __DIR__"dxdian",
        ]));
        set("sleep_room", 1);
        set("no_clean_up", 0);
        set("no_fight", 1);
        setup();
        replace_program(ROOM);
}
