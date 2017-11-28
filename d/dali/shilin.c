//Room: /d/dali/shilin.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","路南石林");
	set("long",@LONG
在绿树丛中随处可见峭石插天，石笋丛集，石柱挺立，奇异诡质，
各呈异姿。这里石峰攒聚，如剑戟排空，莽莽苍苍，俨然一片林海，
蔚为壮观。更加丛山之中或飞瀑直泻，成叠水喷云，或山泉汇聚，成
明镜长湖。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northup"  : __DIR__"changhu",
	    "south"    : __DIR__"cangshan",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

