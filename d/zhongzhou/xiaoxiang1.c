inherit ROOM;

void create()
{
	set("short", "小巷");
	set("long", @LONG
前面看起来好象要到小巷底了，巷中行人越发稀少。西北
角上好象有一座破烂房子，远远望去烟雾弥漫，陈旧不堪，原
来是座破庙。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"northwest" : __DIR__"guandimiao",
  		"east" : __DIR__"xiaoxiang",
	]));
	set("outdoors", "zhongzhou");

	setup();
	replace_program(ROOM);
}
