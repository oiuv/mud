// /guanwai/dating.c

inherit ROOM;

void create()
{
        set("short", "大厅");
        set("long", @long
那厅极大，四角各生着一盆大炭火。厅上居中挂着一副木板对联，写着
廿二个大字："不来辽东大言天下无敌手,邂逅冀北方信世间有英雄"。
上款是“希孟仁兄正之”，下款是“妄人苗人凤深惭昔年狂言醉后涂鸦”。
long );
        set("exits", ([
                "south"    : __DIR__"changlang",
                "west"    : __DIR__"zoulang1",
                "east"    : __DIR__"zoulang2",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
