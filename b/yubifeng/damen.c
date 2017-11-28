// /guanwai/damen.c

inherit ROOM;

void create()
{
        set("short", "山庄大门");
        set("long", @long
转过了几株雪松,只见前面一座五开间极大的石屋，屋前屋后都是白雪。
大门外写着“玉笔峰山庄”几个大字，此处气候酷寒，上下艰难，当初不
知道庄主花了多少的心思才能在此建成如此石室，不禁令人啧啧称奇。
long );
        set("exits", ([
                "enter"    : __DIR__"changlang",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
