inherit ROOM;

void create ()
{
        set ("short", "青龙街");
        set ("long", @LONG
青龙街是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。往北就是故皇宫的金水桥
了，南面有一条大路通向长安城南门。
LONG);
        set("exits", ([
                "north" : __DIR__"bridge2",
                "south" : __DIR__"nanan-dadao",
                "west" : __DIR__"qinglong1",
                "east" : __DIR__"qinglong3",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
