inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这里是雪山寺内的走廊。这里有点幽暗，天花板上有一些
不知道确切含义的雕刻，墙壁上则是很通俗的佛经故事壁画了。
壁上点着几碗大海灯照明。
LONG);
        set("exits", ([
                "southdown" : __DIR__"cedian1",
                "west"      : __DIR__"dating",
                "north"     : __DIR__"zoulang3",
        ]));
        setup();
}
