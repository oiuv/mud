inherit ROOM;

void create()
{
	set("short", "景云道");
	set("long", @LONG
景云大道位于洛阳城里的南面，是洛阳最繁华地段，青石板铺成的街
面，宽阔而整洁，一到晚上，一派灯红酒绿，尤为热闹。笑声、歌声、琴
声、箫声，汇成一片送入了你的耳朵，你不禁心猿意马，很想就此停步享
受一番。北边是一个热闹的洛阳中心广场。东边是一家客栈，名曰“白马
客栈”。西边则是方圆千里之内最大的一家当铺。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"kezhan",
  		"south" : __DIR__"sroad2",
  		"north" : __DIR__"center",
  		"west" : __DIR__"dangpu",
	]));
        set("objects", ([
                "/d/beijing/npc/youren" : 1,
                "/d/luoyang/npc/lang" : 1,
        ]));
	setup();
	//replace_program(ROOM);
}
