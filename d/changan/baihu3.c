//Room: baihu3.c

inherit ROOM;

void create ()
{
        set ("short", "白虎街");
        set ("long", @LONG
青龙街是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。北面东边传出朗朗的读书
声，那里是当朝的学府国子监。
LONG);
        set("exits", 
        ([ //sizeof() == 3
		"north" : __DIR__"guozijian",
        	"west" : __DIR__"baihu2",
        	"east" : __DIR__"fengxu1",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
