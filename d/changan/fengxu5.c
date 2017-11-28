//Room: fengxu5.c

inherit ROOM;

void create ()
{
        set ("short", "冯诩道");
        set ("long", @LONG
冯诩道是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。西面是青龙街，东面是长
安城的巡捕房。
LONG);
        set("exits", 
        ([ //sizeof() == 3
		"north" : __DIR__"fengxu4",
        	"west" : __DIR__"qinglong3",
        	"east" : __DIR__"xunbufang",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
