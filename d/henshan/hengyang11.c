inherit ROOM;

void create()
{
	set("short", "衡阳西街");
	set("long", @LONG
这里是衡阳城西街，这见路人匆匆向东而行，南边是有一
个马厩，北面是一家装饰很典雅的店铺，店铺入门处挂满了风
铃。
LONG);
        set("outdoors", "henshan");

	set("exits", ([
	        "east"   : __DIR__"hengyang1",
	        "west"   : __DIR__"hsroad4",
	        "south"  : __DIR__"majiu",
	        "north"  : __DIR__"lingyinge",
	]));

	setup();
	replace_program(ROOM);
}

