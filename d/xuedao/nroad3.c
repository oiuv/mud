inherit ROOM;

void create()
{
        set("short", "雪山北麓");
        set("long", @LONG
这里山势比大雪山东面稍缓，也不是十分的严寒。山道两
旁长得有稀稀拉拉的一些野草。四下毫无人迹，只有几只秃鹰
在高处盘旋，俯视着茫茫雪山。
LONG);
        set("exits", ([
                "south" : __DIR__"nroad4",
                "east"  : __DIR__"nroad2",
        ]));
        set("objects", ([
                "/clone/quarry/ying" : 2,
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

