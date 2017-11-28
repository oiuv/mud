// Room: /d/shaolin/jiebei.c
// Date: YZC 96/01/19

inherit ROOM;

string look_jiebei();

void create()
{
	set("short", "界碑");
	set("long", @LONG
界碑——未连接好的区域(jiebei)。
LONG
	);

	set("exits", ([
		"east" : __DIR__"shulin14",
		"northup" : __DIR__"qyping",
	]));

	set("outdoors", "shaolin");
	set("item_desc",([
		"stone"		:	(: look_jiebei :),
	]));
	setup();
}


string look_jiebei()
{
	return "由此往前，通向山顶。道路尚未修好。\n—时空书于侠客行\n";
}

