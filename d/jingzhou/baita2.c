inherit ROOM;

void create()
{
	set("short", "白塔三楼");
	set("long", @LONG
这里是报恩塔三楼，由于这里地势高，一阵微风吹来，说
不出的凉爽，荆州城的风光也尽收眼底。
LONG);
	set("exits", ([  
  		"down" : __DIR__"baita1",
	]));
        set("objects", ([
                "/d/beijing/npc/shiren" : 1,
        ]));
	set("no_clean_up", 0);

	setup();
	replace_program(ROOM);
}
