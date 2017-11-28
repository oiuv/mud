inherit ROOM;

void create()
{
	set("short", "瓷器店");
	set("long", @LONG
在这里你能够买到各种你所需要的瓷器，价格昂贵的有，价格低廉的
也有，平时，当地居民到这里来买一些盆啊碟啊碗啊之类的最方便不过了。
当然象景德镇的陶瓷艺术品和洛阳的唐三彩这里也有的卖。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"south" : __DIR__"eroad3",
	]));
        set("objects", ([
                __DIR__"npc/han" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
