inherit ROOM;

void create()
{
        set("short", "粪窖");
        set("long", @LONG
一股臭味扑鼻而来，一堆金头苍蝇围着个小池子不断打转，
这是个方便僧人用来浇灌菜地的小粪池子，自然是比较不好闻
你还是赶快走开些吧，不小心会掉下去的。
LONG);
        set("objects", ([
  		__DIR__"npc/popi" : 1,
  		__DIR__"npc/wulai" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"maofang",
  		"north" : __DIR__"kongdi",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
