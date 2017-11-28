//Room: /d/dali/shizilukou.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","十字路口");
	set("long",@LONG
这是大理城内的主要商贸场所。形形色色的叫卖声在耳边此起彼
伏，连绵不绝。路上车水马龙，各色行人摩肩接踵，热闹非凡。大道
两旁高立了两座楼牌，西首是御林军的驻地，东面则是民居。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "north"  : __DIR__"center",
	    "south"  : __DIR__"southgate",
	    "east"   : __DIR__"dahejieeast",
	    "west"   : __DIR__"dahejiewest",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

