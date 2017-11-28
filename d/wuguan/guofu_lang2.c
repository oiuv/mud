inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是个长廊，通向东练武场，人来人往的，很是热闹。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "east" : __DIR__"guofu_wuchang2",
               "west" : __DIR__"guofu_dayuan",
        ]));
        setup();
        replace_program(ROOM);
}
