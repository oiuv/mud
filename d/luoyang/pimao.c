inherit ROOM;

void create()
{
	set("short", "皮货店");
	set("long", @LONG
这是洛阳的一家皮货店，专卖各式各样的皮货。据说店主自开店以来
很少卖出什么真正的皮货，倒是传闻他总是零星地高价出售一些书画名家
曾经用过的笔砚。店内正堂挂有一满是尘土的细字长匾，匾上书有“童叟
无欺”四字。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"nroad4",
	]));
        set("objects", ([
                "/d/kaifeng/npc/huizhang" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
