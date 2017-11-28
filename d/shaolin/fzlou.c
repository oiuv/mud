// Room: /d/shaolin/fzlou.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "方丈楼");
	set("long", @LONG
这里的地上整整齐齐的排放着数十个黄布蒲团，北首有一个
红木讲坛，讲坛上放着个竹制的木鱼。东西边各放着一对美轮美
奂的大花瓶，上插檀香数枝，香烟缭绕，氤氲芬芳，室内一片祥
和之气。看来这里是方丈对僧众讲经说法的地方。
LONG );
	set("exits", ([
		"south" : __DIR__"wuchang",
		"up" : __DIR__"fzlou1",
		"north" : __DIR__"wuchang3",
		"east" : __DIR__"zoulang7",
		"west" : __DIR__"zoulang6",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

