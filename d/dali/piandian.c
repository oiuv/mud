//Room: /d/dali/piandian.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","偏殿");
	set("long",@LONG
这里是大理国皇宫的偏殿，大理皇帝常在这里接见心腹大臣，
但现在显得空空荡荡的，往西是长廊。
LONG);
	set("exits",([ /* sizeof() == 1 */
	    "west"  : __DIR__"hualang",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

