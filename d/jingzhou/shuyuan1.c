inherit ROOM;

void create()
{
	set("short", "书院后院");
	set("long", @LONG
这里是萧湘书院的后院，打扫得非常干净，四周是过人高
的围墙，偶尔传来几声鸟语，让人觉得安静和谐，南边有一道
小门，通往一片竹林。
LONG);
	set("exits", ([
  		"north" : __DIR__"shuyuan",
  		"south" : __DIR__"shijie",
	]));
	set("no_clean_up", 0);

	setup();
	replace_program(ROOM);
}
