inherit ROOM;

void create()
{
        set("short", "前广场");
        set("long", @LONG
这里便是红花会的总舵了，只见广场前竖着几展大旗，正
迎风飘扬着。前方是一座红墙朱瓦的大宅，门口放着两头石狮
子，甚是威严壮观。广场站着几个红花会的会众，赤裸着上身
胸前佩着一朵大红花，神情严肃。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"hh_damen",
  		"west" : __DIR__"eroad3",
	]));
        set("objects", ([
                __DIR__"npc/honghua1" : 2,
        ]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
