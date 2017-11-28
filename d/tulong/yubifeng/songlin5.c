// /guanwai/songlin2.c

inherit ROOM;

void create()
{
        set("short", "大松林");
        set("long", @LONG
这是一片茂密的松林，杂乱的生长在倾斜的山坡上。林中松树都是数百年的
老树，枝柯交横，树顶上压了数尺厚的白雪，是以林中雪少，反而好走。
LONG );
        set("exits", ([
                "west"    : __DIR__"songlin4",
                "north"    : __DIR__"songlin3",
                "south"    : __DIR__"fengdi",
                "east"  : __DIR__"songlin2",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
