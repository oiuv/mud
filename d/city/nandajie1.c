inherit ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
南大街是城里的繁华地段，一到晚上，一派灯红酒绿，尤
为热闹。笑声、琴声、箫声汇成一片送入了你的耳朵，你不禁
心猿意马，很想就此停步享受一番。北边是个热闹的广场。东
边是一家店铺，墙上写着一个大大的「当」字，仔细倾听，可
以听到压低的讨价还价的声音。西边则是一片喧嚣，夹杂着一
五一十的数钱声，原来那是方圆千里之内最大的一家赌场。
LONG );
        set("outdoors", "city");
	set("exits", ([
		"east"  : __DIR__"dangpu",
		"south" : __DIR__"nandajie2",
		"west"  : __DIR__"duchang",
		"north" : __DIR__"guangchang",
	]));
	set("objects", ([
		__DIR__"npc/hunhun" : 1,
		__DIR__"npc/liumang": 4,
		__DIR__"npc/liumangtou" : 1,
		"/clone/npc/xunbu" : 1,
	]));

	setup();
	replace_program(ROOM);
}

