//Room: qinglong3.c

inherit ROOM;
void create ()
{
        set ("short", "青龙街");
        set ("long", @LONG
青龙街是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。南面就是长安府的总督衙
门了。因为有它建在这里，所以这里的治安很好，大街上的行人也并不
用为安全担心。
LONG);
        set("exits", 
        ([ //sizeof() == 3
		"south" : __DIR__"yamen",
        	"west" : __DIR__"qinglong2",
        	"east" : __DIR__"fengxu5",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
