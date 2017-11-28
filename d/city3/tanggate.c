inherit ROOM;

void create()
{
	set("short", "唐门大门");
	set("long", @LONG
这里就是名闻天下的唐门的大门。唐门建的十分巍峨，青
墙碧瓦下的铜包大门紧紧关闭，两边唐门弟子一溜排开，这个
架势看来是不好进去了。
LONG);
	set("outdoors", "chengdu");
	set("no_fight",1);
	set("exits", ([
		"north"  : __DIR__"northroad2",
	]));
	set("objects", ([
		//__DIR__"npc/tangdun" : 1,
		CLASS_D("tangmen") + "/tangrou" : 1,
	]));
	setup();
	replace_program(ROOM);
}
