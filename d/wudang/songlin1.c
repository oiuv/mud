inherit ROOM;

void create()
{
        set("short", "松林");
        set("long", @LONG
这是松林深处，暗无天日，朦胧中只感觉到左右前后到处
都是树影。地上有一两个死人骷髅，发着绿荧荧的磷光。你惊
骇之间，一脚踩在钢针般的松针上！
LONG);
        set("objects", ([
                CLASS_D("wudang") + "/famu" : 1,
        ]));
        set("outdoors", "wudang");
        set("exits", ([
                "north"  : __DIR__"slxl2",
                "south"  : __DIR__"songlin3",
        ]));
        setup();
        replace_program(ROOM);
}
