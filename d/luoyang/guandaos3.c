inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
这是一条宽阔笔直，尘土飞扬的大官道，足可容得下十马并驰。往南
通可以达襄阳城，往北不远便是东都洛阳古城了。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"guandaos2",
  		"south" : __DIR__"guandaos4",
	]));

	setup();
	replace_program(ROOM);
}
