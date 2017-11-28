//Room: /d/dali/jingzhuang7.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","第七层");
	set("long",@LONG
这里是经幢的顶部，圆弧形顶篷，向徵天穹。上面刻有诸天神佛，
飞天力士等。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "down"  : __DIR__"jingzhuang6",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

