inherit ROOM;

void create()
{
        set("short", "观日台");
        set("long", @LONG
这里是终南山上的观日台，不知哪朝哪代何人在这里修筑
了这个平台，用来观瞻日出的美景。这里的山势非常陡峻，往
下一看，悬崖壁立，脚下白云飘过，真不知身在何境。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "north" : __DIR__"shijie9",
        ]));
        set("objects",([
                __DIR__"npc/youke" : 1,
                __DIR__"npc/xiangke" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
