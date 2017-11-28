inherit ROOM;

void create()
{
	set("short", "南城根");
	set("long", @LONG
这里是洛阳内城南墙脚。很是冷清，几乎没有人会来这里，你的面前
除了高大的城墙，满地的尘土和杂草就什么也没有了。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"northwest" : __DIR__"xitou",
  		"east" : __DIR__"suishi9",
	]));
        set("objects", ([
                "/d/kaifeng/npc/qigai" : 1,
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
