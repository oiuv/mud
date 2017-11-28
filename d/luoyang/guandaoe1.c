inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
这是一条宽阔笔直，尘土飞扬的大官道，足可容得下十马并驰。往东
通向函谷关可以达扬州城，往西不远便是东都洛阳古城的东城边了。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"westup" : __DIR__"ebridge",
  		"east" : __DIR__"guandaoe2",
	]));

	setup();
	replace_program(ROOM);
}
