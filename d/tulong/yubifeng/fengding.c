// /guanwai/fengding.c

inherit ROOM;

void create()
{
        set("short", "玉笔峰");
        set("long", @long
只见山峰旁好大三个绞盘，互以竹索牵连，三盘互绞，升降竹篮，十馀名壮
汉扳动三个绞盘，又将篮子放了下去。篮子上下数次，那老僧与群豪都上了
峰顶。绞盘旁站着两名灰衣汉子。
long );
        set("exits", ([
                "east"    : __DIR__"damen",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
