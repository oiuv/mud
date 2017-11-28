// Room: /u/zqb/tiezhang/pubu.c

inherit ROOM;

void create()
{
	set("short", "瀑布");
	set("long", @LONG
山路行到这里，忽听远处传来隐隐水声，转过一道山梁，只见一道白龙
似的大瀑布从对面双峰之间奔腾而下，空山寂寂，那水声不断在山谷中激荡
回响，声势甚是惊人。
LONG	);
	set("exits", ([ /* sizeof() == 2 */
  "northup" : __DIR__"xzfeng",
  "eastdown" : __DIR__"sblu-1",
]));
	set("no_clean_up", 0);

	setup();
}