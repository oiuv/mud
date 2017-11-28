// Room: /qingcheng/tingquanting.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "听泉亭");
	set("long", @LONG
沿石梯向下，就是海棠溪。这里是溪上的听泉亭，四顾山环水
绕，古藤蔓蔓，飞泉溅落池中，如琴弦轻拨，如珠落玉盘，清绝幽
绝。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"westup"   : __DIR__"sandaoshi",
	]));
	set("objects", ([
		__DIR__"npc/luo" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

