// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "莲花峰");
	set("long", @LONG
莲花峰其实是由五座山峰攒簇而成，状如莲花，因以为名。东
面有危崖万仞，叫五花崖。登上莲花峰后，可看到在盘道中的游人
如小蚁般往来穿梭，故此莲花峰又叫望人峰。往上走便是莲花峰的
峰顶。
LONG );
	set("exits", ([
		"westup" : __DIR__"tianjie",
		"northup" : __DIR__"shixin",
	]));
	set("outdoors", "taishan");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

