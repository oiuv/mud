//Room: baihu1.c

inherit ROOM;

void create ()
{
        set ("short", "白虎街");
        set ("long", @LONG
白虎街是长安城中心大街，青石板路笔直的伸展出去，一路上行人
比肩，笙歌处处。景物之美，直如神仙境地。西边是扶风道。北面
则是阴森森的大牢，有几个狱卒百无聊赖的呆在门口。
LONG);
        set("exits", 
        ([ //sizeof() == 2
        	"west" : __DIR__"fufeng1",
        	"east" : __DIR__"baihu2",
        ]));

	set("objects", ([
		"/clone/npc/xunbu" : 2,
	]));
        set("outdoors", "changan");
	set("no_fight", 1);
        setup();
        replace_program(ROOM);
}

