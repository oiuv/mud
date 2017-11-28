inherit ROOM;

void create()
{
        set("short", "郭府大院");
        set("long", @LONG
这是个大院子，东西两边都是练武场，不少人在这里习武
强身，这里很吵，乱哄哄的，你看见不时有扛着东西的，挑着
水的匆匆而过。
LONG);
        set("no_fight", 1);
        set("exits", ([
                "south" : __DIR__"guofu_gate",
                "north" : __DIR__"guofu_dayuan2",
                "east" : __DIR__"guofu_lang2",
                "west" : __DIR__"guofu_lang1",
        ]));
        set("valid_startroom", 1);
        setup();
        "/clone/board/wuguan_b.c"->foo();
        replace_program(ROOM);
}
