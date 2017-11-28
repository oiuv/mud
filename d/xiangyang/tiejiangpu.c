// Room: /d/xiangyang/tiejiangpu.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "兵器铺");
	set("long", @LONG
这里原来是一家极其简陋的铁匠铺。近年来蒙古大军屡次
进犯襄阳，这家铁匠铺被官府征用，作为官办作坊。目前规模
很大，一般用来为襄阳守军打造铠甲、兵器等，近来因襄阳需
筹备守城物资，奉郭夫人之命也生产一些铁钎、铁锤、伐木斧
头等。只见几十个铁匠正叮叮当当地忙个不停。
LONG );
	set("exits", ([
		"west" : __DIR__"southjie3",
	]));
	set("objects", ([
		__DIR__"npc/smith" : 1,
	]));
	setup();
	replace_program(ROOM);
}

