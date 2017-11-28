inherit ROOM;

void create()
{
	set("short", "西镇街");
	set("long", @LONG
佛山镇的街道横亘东西。北边不远处有座破败的庙宇，南
面是一座宏伟的建筑，大门上写着「英雄会馆」四个大字。
LONG);
	set("objects", ([
	        "/d/city/npc/liumang": 1,
	]));
	set("outdoors", "foshan");
	set("exits", ([
	        "south" : __DIR__"pm_restroom",
	        "west"  : __DIR__"street1",
	        "east"  : __DIR__"street3",
	]));
	setup();
	replace_program(ROOM);
}

