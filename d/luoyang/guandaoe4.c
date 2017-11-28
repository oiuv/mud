inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
这是一条宽阔笔直，尘土飞扬的大官道，足可容得下十马并驰。往东
通向函谷关可以达扬州城，往西则可以到达东都洛阳古城。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"guandaoe3",
  		"east" : "/d/changan/hanguguan",
	]));

	setup();
	replace_program(ROOM);
}
