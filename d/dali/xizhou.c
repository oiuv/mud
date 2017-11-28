//Room: /d/dali/xizhou.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","喜州城");
	set("long",@LONG
喜州又名大鳖城，是大理南部大城，自唐代已极繁荣，邑居人户
尤众，商贸甚繁荣，有大量他国客商来此交易，采购大理产的金银、
丝织品、象牙、皮毛等，其中又以来自印度的客商最多，前来贩丝绸
往波斯甚至更远的西方。
LONG);
	set("objects", ([
	   __DIR__"npc/keshang": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "north"      : __DIR__"tianweijing",
	    "east"       : __DIR__"kedian",
	    "southwest"  : __DIR__"zhulin",
	    "south"      : __DIR__"feilihu",
	]));
	setup();
	replace_program(ROOM);
}

