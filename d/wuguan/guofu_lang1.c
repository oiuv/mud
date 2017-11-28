inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是个长廊，通向西练武场，人们急冲冲的走过，不时有
人被抬出来，看样子是练功脱力昏倒的。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "west" : __DIR__"guofu_wuchang1",
               "east" : __DIR__"guofu_dayuan",
        ]));
        setup();
        replace_program(ROOM);
}
