inherit ROOM;

void create()
{
	set("short", "白塔二楼");
	set("long", @LONG
这里是报恩塔的第二楼，相传是前朝一位状元郎考取功名
后，卫报答母恩修建的报恩塔。由于这里地势高，让人忍不住
要登高眺望。
LONG);
	set("exits", ([  
  		"up" : __DIR__"baita2",
  		"down" : __DIR__"baita",
	]));
	set("no_clean_up", 0);

	setup();
	replace_program(ROOM);
}
