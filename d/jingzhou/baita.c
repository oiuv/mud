inherit ROOM;

void create()
{
	set("short", "白塔");
	set("long", @LONG
这里是一座三层高的白塔，相传是前朝一位状元郎考取功
名后，卫报答母恩修建的报恩塔。
LONG);
	set("exits", ([  
  		"up" : __DIR__"baita1",
  		"south" : __DIR__"dongdajie1",
	]));
	set("no_clean_up", 0);
        set("objects", ([
                "/d/beijing/npc/shusheng2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
