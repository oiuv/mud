inherit ROOM;

void create()
{
        set("short", "密道");
        set("long", @LONG
这里是峨嵋华藏庵下面的一条狭窄的暗道。阴森可怕，到
处积满了灰尘，结满了蛛网，也不知道通往何处。
LONG);
        set("exits", ([
                "west"  : __DIR__"midao3",
                "north" : __DIR__"midao5",
        ]));
        setup();
        replace_program(ROOM);
}