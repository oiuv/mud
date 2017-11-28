inherit ROOM;

void create()
{
	set("short", "兰薪寺");
	set("long", @LONG
这座寺庙刚刚建成不久，一切都是崭新的，就连寺里的老主持也是刚
从京城定国寺请来的。寺里有两个小和尚正在扫地，因为是新庙，所以来
祭拜的人很少。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"west" : __DIR__"xiaoxiang2",
	]));
        set("objects", ([
                "/d/kaifeng/npc/oldwomen" : 1,
                "/d/kaifeng/npc/zhike" : 1,
                "/clone/npc/walker" : 1,
        ]));

	setup();
	replace_program(ROOM);
}
