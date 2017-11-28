//Room: /d/dali/hualang.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","花廊");
	set("long",@LONG
这里是大理国皇宫的花廊，走廊下到处是奇花异草，往北是正
殿，往南是御花园，往西是御膳房，往东是偏殿。
LONG);
	set("objects", ([
	   __DIR__"npc/gongnu": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "south"  : __DIR__"yuhuayuan",
	    "north"  : __DIR__"zhengdian",
	    "east"   : __DIR__"piandian",
	    "west"   : __DIR__"yushanfang",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}


