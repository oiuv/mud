inherit ROOM;

void create()
{
        set("short", "访真桥");
        set("long", @LONG
跨过石阶，眼前是一座石头砌成的小小拱桥。桥上栏杆上
雕龙描凤，栩栩如生。这里的山势非常陡峻，往下一看，悬崖
壁立，脚下白云飘过，真不知身在何境。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "north" : __DIR__"yuzhengong",
                "southdown" : __DIR__"shijie7",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
