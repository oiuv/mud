// Room: /d/xiangyang/southjie1.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
这是一条宽阔的青石板街道，向南北两头延伸。南边就是
朱雀门，北面是中央广场，西面是钱庄，东面是襄阳城内的唯
一一家学堂。虽然襄阳战火不断，你仍能听到学堂里传来学生
们朗朗地读书声。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"xuetang",
		"west"  : __DIR__"qianzhuang",
		"south" : __DIR__"southjie2",
		"north" : __DIR__"guangchang",
	]));
	setup();
	replace_program(ROOM);
}
