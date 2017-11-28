//Room: /d/dali/xiaojing.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","山区小径");
	set("long",@LONG
这是清源山区的碎石小径，曲折蜿蜒，两旁林木茂盛，遮天蔽日。满径落
叶，柔软稀松。虫鸟啾啾。凉风习习。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "east"    : __DIR__"jinzhihe",
	    "westup"  : __DIR__"dadieshui",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

