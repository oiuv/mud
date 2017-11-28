inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
这是一条宽阔笔直，尘土飞扬的大官道，它连接了东都长安和西都洛
阳。官道很是宽广，足可容得下十马并驰。往西直达长安的东门，而东边
则是洛阳古城。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"guandaow1",
  		"west" : __DIR__"guandaow3",
	]));

	setup();
	replace_program(ROOM);
}
