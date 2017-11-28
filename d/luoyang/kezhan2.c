// Room: /u/a/agah/kezhan2.c

inherit ROOM;

void create()
{
	set("short", "客栈二楼");
	set("long", @LONG
这里是二楼雅座，比起楼下就要高雅多了，景德镇的餐具，红木的桌
椅，在光照之下反射出淡淡的的光泽。推窗望去，洛阳城中心尽收眼底。
一群酒客推杯换盏，正喝的热闹。四周是客房，供人睡觉休息之用。
LONG
	);
	set("no_clean_up", 0);
	set("exits", ([ /* sizeof() == 5 */
  "east" : __DIR__"kefang1",
  "down" : __DIR__"kezhan",
  "south" : __DIR__"kefang2",
  "west" : __DIR__"kefang3",
  "north" : __DIR__"kefang4",
]));

	setup();
	replace_program(ROOM);
}
