inherit ROOM;

void create()
{
	set("short", "南阳城");
	set("long", @LONG
这里便是当年诸葛先生的故居。南阳城虽不大，但因为地出
要冲，南来北往的客人也就特别多，所以也五脏俱全，酒楼，客
栈，马店，满城子都是。本地人口甚少，到处都是行色匆匆的江
湖客人。
LONG );
	set("exits", ([
		"south" : __DIR__"hanshui2",
		"north" : __DIR__"yidao3",
		"east" : __DIR__"kedian1",
		"west" : __DIR__"jiulou1",
	]));
	set("objects",([
		__DIR__"npc/xiao-fan" : 1,
	]));
	set("outdoors", "nanyang");
	setup();
	replace_program(ROOM);
}

