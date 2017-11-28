//Room: /d/dali/shanlu6.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","山路");
	set("long",@LONG
一条山路，两边是茂密的树林，西面是延绵不绝的大山，南面是一
望无际的西双版纳大森林，传说有邪教教众在其中活动。道路两旁间或
可见一些夷族的村镇。山路转向东蜿蜒着。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northwest"  : __DIR__"shanlu5",
	    "east"       : __DIR__"gudao",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

