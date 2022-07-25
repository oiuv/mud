inherit ROOM;

void create()
{
        set("short", "书房");
        set("long", @LONG
这里便是教主平时日内看书的地方，房间不大，只靠窗摆着一张
书案，案边放了几本书，看来是教主经常翻看的。
LONG);

        set("exits", ([
                "south" : __DIR__"dating",
        ]));

        set("objects", ([
                 __DIR__"obj/book2": 1,
        ]));

        setup();
        replace_program(ROOM);
}
