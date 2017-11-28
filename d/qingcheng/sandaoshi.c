// Room: /qingcheng/sandaoshi.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "三岛石");
	set("long", @LONG
三岛石上刻“降魔”二字，相传为张天师当年降魔，因巨石当
道，挥剑力劈，石裂为三，成为三块相连的岛石。石裂处自然生成
石梯。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"west"     : __DIR__"tianshidong",
		"eastdown" : __DIR__"tingquanting",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

