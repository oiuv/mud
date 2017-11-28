inherit ROOM;

void create ()
{
        set ("short", "白虎街");
        set ("long", @LONG
白虎街是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。往南就是故皇宫的金水桥
了，北面有一条大路通向长安城北门。
LONG);
        set("exits", ([
                "south" : __DIR__"bridge1",
                "north" : __DIR__"beian-dadao",
                "west" : __DIR__"baihu1",
                "east" : __DIR__"baihu3",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
