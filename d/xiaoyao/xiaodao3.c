inherit ROOM;

void create()
{
        set("short", "林间小道");
        set("long", @LONG
这是一条从南到北的林间小道，沿途风景极之清幽，参天
古树，拔地而起，两旁百花争艳。令人留连忘返。
LONG);
        set("exits", ([
                "south" : __DIR__"qingcaop",
                "north" : __DIR__"muwu2",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "xiaoyao");
        setup();
        replace_program(ROOM);
}
