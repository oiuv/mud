inherit ROOM;

void create()
{
	set("short", "青石大道");
	set("long", @LONG
你走在一条青石大道上，人来人往非常繁忙，不时地有人骑着马匆匆而过。
大道两旁有一些小货摊，似乎是一处集市。往南就是名刹——天龙寺了。
LONG );
        set("outdoors", "tianlongsi");
	set("exits", ([
		"south" : __DIR__"damen",
		"east" : __DIR__"dadao3",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

