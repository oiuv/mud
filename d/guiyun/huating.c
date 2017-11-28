// Room: /guiyun/huating.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "花厅");
	set("long", @LONG
这是一间四方型的厅亭，没有牌匾，正面两方木柱，柱上挂了
幅缺了半阙的『诗词』(poem)。厅内摆设了几张桌椅。一个丫环正
在抹拭桌面。
LONG );
        set("outdoors", "guiyun");
//	set("no_clean_up", 0);

	set("exits", ([
		"north" : __DIR__"huayuan",
		"south" : __DIR__"dating",
		"east"  : __DIR__"nanxiangfang",
		"west"  : __DIR__"nvxiangfang",
	]));
	set("item_desc", ([
		"poem" :
"
      ┌─┐             ┌─┐
      │兵│             │  │
      │火│             │  │
      │有│             │  │
      │馀│             │  │
      │烬│             │  │
      │贫│             │  │
      │村│             │  │
      │才│             │  │
      │数│             │  │
      │家│             │  │
      └─┘             └─┘
",
	]));
	set("objects", ([
		__DIR__"npc/xiaolan" : 1,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
	mapping myfam;
	myfam = (mapping)me->query("family");

	if ((!myfam || myfam["family_name"] != "桃花岛") &&
		(dir == "east" || dir == "west") ) 
		return notify_fail("归云庄不留外客，你不能住在这里！\n");
	if (me->query("gender") != "男性" && dir == "east") 
		return notify_fail("男女有别，请到对面住！\n");

	if (me->query("gender") != "女性" && dir == "west") 
		return notify_fail("男女有别，请到对面住！\n");

	return ::valid_leave(me, dir);
}
