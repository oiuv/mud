inherit ROOM;

void create()
{
	set("short", "西城根");
	set("long", @LONG
这里是洛阳内城南墙脚。很是冷清，几乎没有人会来这里，你的面前
除了高大的城墙，满地的尘土和杂草就什么也没有了。但是，忽然你眼睛
一花，有两个黑影从你的面前一闪而过，到底是发生了什么事情呢？
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"southeast" : __DIR__"nantou2",
  		"north" : __DIR__"suishi10",
	]));
        set("objects", ([
                "/d/city/npc/liumang" : 1,
                "/d/beijing/npc/hunhun" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
