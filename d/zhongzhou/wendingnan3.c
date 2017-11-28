inherit ROOM;

void create()
{
	set("short", "文定南街");
	set("long", @LONG
这是中州城文定南街，宽敞的街道让人不竟心情一畅。西
面有一家不小的房子，两个女子绽放出迷人的微笑，肯定是个
放松的好地方。东北角有条黑胡胡的小胡同。
LONG);
	set("outdoors", "zhongzhou");
	set("objects", ([
  		"/d/beijing/npc/boy3" : 2,
	]));

	set("exits", ([
  		"south" : __DIR__"wendingnan4",
  		"northeast" : __DIR__"hutong",
  		"north" : __DIR__"wendingnan2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
