inherit ROOM;

void create()
{
	set("short", "衡阳城");
	set("long", @LONG
这里就是衡阳县城。衡阳地处偏远，显见远不如中原繁华
了。
LONG);
        set("outdoors", "henshan");

	set("exits", ([
	       "east"   : __DIR__"hengyang2",
	       "west"   : __DIR__"hengyang1",
	       "south"  : __DIR__"chaguan",
	       "north"  : __DIR__"lingxingmen",
	]));

	setup();
	replace_program(ROOM);
}

