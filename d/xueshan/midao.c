inherit ROOM;

void create()
{
        set("short", "密道");
        set("long", @LONG
这里是禅室下面的一条狭窄的暗道。阴森可怕，到处积满
了灰尘，结满了蛛网，也不知道通往何处。
LONG);
        set("exits", ([
                "north" : __DIR__"mishi",
                "up"    : __DIR__"chanshi",
        ]));
        setup();
        replace_program(ROOM);
}
