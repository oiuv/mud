inherit ROOM;

void create()
{
	set("short", "水果店");
	set("long", @LONG
这间水果店地方不大，但却有着丰富的水果品种：如香蕉，苹果，橘
子，生梨，西瓜，荔枝等等，尤其是那荔枝，古语有诗云：“日啖荔枝三
百颗，不辞长做岭南人”。可见无论是当地居民还是来往游客都很喜欢光
顾这里。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"sroad6",
	]));
        set("objects", ([
                __DIR__"npc/xiaofan" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
