// Room: /qingcheng/zhuhezhuang.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "驻鹤庄");
	set("long", @LONG
驻鹤庄相传为仙人休息赏玩之所。常有成群丹顶鹤栖息、飞鸣
于林间。
LONG );
	set("exits", ([
		"south"    : __DIR__"tianran",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

