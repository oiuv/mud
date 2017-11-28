inherit ROOM;

void create()
{
        set("short", "密林");
        set("long", @LONG
这是黑森森的一片密林，楠木参天，浓阴蔽日。这里东下
二里是报国寺，西边林间隐藏着一座庙宇。
LONG);
        set("exits", ([
                "north" : __DIR__"bgs",
                "west"  : __DIR__"fhs",
        ]));
        set("outdoors", "emei");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
