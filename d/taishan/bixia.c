// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "碧霞祠");
	set("long", @LONG
这是一座历史悠久而宏伟壮丽的祠院。相传建于唐代以前，宋
、元、明、清各代均曾增建。祠院设有东西两殿，分别称为东西宝
库，储存着进香客的捐施，两殿的屋瓦都是由铁铸成。从四方八面
来泰山上香的男女，都是先到碧霞祠，然后才到其他的庙宇。从这
里往东南走便可到达宝藏岭。
LONG );
	set("exits", ([
		"west" : __DIR__"weipin",
		"eastdown" : __DIR__"baozang",
	]));
	set("no_clean_up", 0);
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

