inherit ROOM;

void create()
{
	set("short", "武德道");
	set("long", @LONG
再往西就要到西内城门了，远远望去，可以看见守城的官兵正在检查
排队出城的路人，也许是太靠近城门的缘故，这里的人已不如前面那么多
了。北边有一家书店，名曰“老僧书店”，南边是一条幽静的碎石小路。
LONG);
        set("outdoors", "luoyang");
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"wroad4",
  		"north" : __DIR__"shudian",
  		"south" : __DIR__"suishi12",
  		"west" : __DIR__"xidoor",
	]));
        set("objects", ([
                "/d/beijing/npc/kid1" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
