//Room: fufeng1.c

inherit ROOM;

void create ()
{
        set ("short", "扶风道");
        set ("long", @LONG
扶风道是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。东边是白虎街。
LONG);
        set("exits", 
        ([ //sizeof() == 3
        	"south" : __DIR__"fufeng2",
        	"east" : __DIR__"baihu1",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
