inherit ROOM;

void create()
{
        set("short", "石屋");
        set("long", @LONG
这是树林中的一间石屋，屋内显得什么清净和简朴，房间
中并没有什么特别的摆设在这里，不会受到任何的骚扰，是个
修炼内功的好地方。
LONG);
        set("exits", ([
                "south" : __DIR__"xiaodao4",
        ]));

        set("objects", ([
                CLASS_D("xiaoyao") + "/wulingj" : 1,
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
