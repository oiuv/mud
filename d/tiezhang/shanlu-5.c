// Room: /u/zqb/tiezhang/shanlu-5.c

inherit ROOM;

void create()
{
	set("short", "石板路");
	set("long", @LONG
你走在一条石板铺成的小路上，两旁是高大的垂柳，虽在骄阳似火的夏
日，依旧凉爽怡人。因为小指峰风光秀美，游人较多，因此这里的路也修砌
的很好。
LONG	);
	set("exits", ([ /* sizeof() == 2 */
  "westup" : __DIR__"sblu-1",
  "eastdown" : __DIR__"pingtai",
]));
	set("no_clean_up", 0);
	set("outdoors", "tiezhang");

	setup();
	replace_program(ROOM);
}
