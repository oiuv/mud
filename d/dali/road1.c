inherit ROOM;
void create()
{
	set("short", "官道");
	set("long", @LONG
这是一条蜿蜒崎岖的山间土路，是由中原通向大理的官道。
此处属川南，向西南去的盘山路通上云贵山区，继而可达南昭
大理国，此去向北不远就是蜀中名川峨嵋山。东去不远可以到
达云南昆明。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    "northeast"  : "/d/emei/qsjie2",
	    "southwest"  : __DIR__"road2",
	    "east"  : "/d/kunming/xroad2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

