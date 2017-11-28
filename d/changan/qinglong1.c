//Room: qinglong1.c

inherit ROOM;

void create ()
{
        set ("short", "青龙街");
        set ("long", @LONG
青龙街是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。南面有一座很具规模的寺
院。偶尔有颂经之声传出。
LONG);
        set("exits", 
        ([ //sizeof() == 3
		"south" : __DIR__"baoxiangsi",
        	"west" : __DIR__"fufeng5",
        	"east" : __DIR__"qinglong2",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
