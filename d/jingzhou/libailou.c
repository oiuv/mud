inherit ROOM;

void create()
{
        set("short", "饭馆");
	set("long", @LONG
这是一家湘西的小饭馆，布置颇为简易，顾客多是匆匆的
行人，买点包子、鸡腿、米酒就赶路去了。
LONG);
	set("exits", ([
		"west" : __DIR__"beidajie2",
       	]));
	set("objects", ([
                "/d/city/npc/xiaoer2" : 1,
	]));

	setup();
	replace_program(ROOM);
}

