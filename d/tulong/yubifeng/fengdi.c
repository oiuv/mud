// /guanwai/fengdi.c

inherit ROOM;

void create()
{
        set("short", "玉笔峰下");
        set("long", @long
这座松林好长，走了半个时辰方始过完，一出松林，即到一座山峰脚下。山
峰虽非奇高，但宛如一根笔管般竖立在群山之中，陡削异常，壁立千仞，非
同小可。莫说是人，即令猿猴也是不易上去。        
long );
        set("exits", ([
                "north"    : __DIR__"songlin5",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
