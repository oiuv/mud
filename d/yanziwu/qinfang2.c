//ROOM: /d/yanziwu/qinfang2.c

inherit ROOM;
void create()
{
        set("short", "沁芳阁二层");
        set("long",@LONG
这儿窗户半闭，嗅着透过来的阵阵清香，你觉得有些困倦。
一张大床上淡绿色的被褥发出淡淡的香气，睡了吧，你不由的
想到。
LONG );
        set("exits", ([
            "down"    : __DIR__"qinfang1",
        ]));
        set("sleep_room", 1);
        set("no_fight", 1);
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
