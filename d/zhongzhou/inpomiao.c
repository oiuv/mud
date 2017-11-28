inherit ROOM;

void create()
{
	set("short", "丐帮中州分舵");
	set("long", @LONG
这里是丐帮设在中州府的分舵。破庙角落中散放着一些稻
草和破棉被，正中的神像早已被人搬走，如今被一帮叫化子占
了地方，几只破瓦罐散落在庙中各处，原来是盛滴水的。
LONG);
	set("no_clean_up", 0);
	set("outdoors", "zhongzhou");
	set("exits", ([
  		"out" : __DIR__"guandimiao",
	]));
	set("objects", ([
                "/clone/npc/walker" : 1,
	]));
	setup();
	replace_program(ROOM);
}
