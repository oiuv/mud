inherit ROOM;

void create()
{
        set("short", "大道");
        set("long", @LONG
你走在一条碎石铺成的大道上。四周的田野已经被积雪覆盖，放眼望去
发现自己已经置身于无边无际的雪原中。狂风夹杂着雪花呼啸而过，冻得人
浑身发抖。北面的天边似乎有一缕炊烟升起。
LONG );
        set("exits", ([
                "north" : __DIR__"muqiao",
                "south" : __DIR__"road7",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
