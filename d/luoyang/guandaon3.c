inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
这是一条宽阔笔直，尘土飞扬的大官道，足可容得下十马并驰。南边
是东都洛阳古城，往北直上可以到达华山。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"guandaon4",
  		"south" : __DIR__"guandaon2",
	]));

	setup();
	replace_program(ROOM);
}
