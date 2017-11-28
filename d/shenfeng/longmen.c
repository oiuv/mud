inherit ROOM;

void create()
{
	set("short", "龙门客栈");
	set("long", @LONG
小酒家几乎从不打烊，酒铺看起来不差，老板娘长得很不
错，但不知为什么，里边冷冷清清，看不见一个客人。屋子里
布置得精雅而别致，每一样东西都是精心挑选的，正好摆在最
恰当的地方，厅当中供着一个手捧金元宝的财神爷，上面还贴
着张斗大的红“喜”字，无论谁走进这里，都可以看得出这地
方的主人，一定是整天在做着发财梦的穷小子。
LONG);
	set("objects", ([
  		__DIR__"npc/jinxiangyu" : 1,
	]));
	set("exits", ([
  		"south" : __DIR__"guandao2",
	]));

	setup();
	replace_program(ROOM);
}
