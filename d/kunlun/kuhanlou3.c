inherit ROOM;

void create()
{
        set("short", "苦寒楼三层");
        set("long", @LONG
很快就到了苦寒楼顶层。这里可以看到山门以及北边的诸
多昆仑山峰，四周的杉林随风摇摆，发出「哗哗哗哗」的声音。
山风夹着隐隐寒气，远处的景色单调而苍凉，你心里顿时生出
一种莫名寂寞的感觉。房间里的布置十分简单。往外看，有个
很大的红木窗台。
LONG);

        set("exits", ([
                "down" : __DIR__"kuhanlou2",
        ]));

        setup();
        replace_program(ROOM);

}

