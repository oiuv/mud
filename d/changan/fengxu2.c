//Room: fengxu2.c

inherit ROOM;

void create ()
{
        set ("short", "冯诩道");
        set ("long", @LONG
冯诩道是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。
LONG);
        set("exits", 
        ([ //sizeof() == 2
		"north" : __DIR__"fengxu1",
        	"south" : __DIR__"fengxu3",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
