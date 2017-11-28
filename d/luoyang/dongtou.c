inherit ROOM;

void create()
{
	set("short", "东城根");
	set("long", @LONG
这里是洛阳内城东墙脚。很是冷清，几乎没有人会来这里，你的面前
除了高大的城墙，满地的尘土和杂草就什么也没有了。但是，突然你看见
两个穿着黑马褂的中年人正在墙脚处交头接耳，窃窃私语，他们到底在干
什么？
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"southwest" : __DIR__"nantou",
  		"north" : __DIR__"suishi3",
	]));
        set("objects", ([
                "/d/beijing/npc/dipi" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
