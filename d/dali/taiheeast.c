//Room: /d/dali/taiheeast.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","太和东街");
	set("long",@LONG
太和街连贯阳苜咩城南北门，延伸三里，是城内主要街道。街面
是由碗口大的彩色石块铺成，青兰紫绿，煞是好看。城内居民族裔繁
杂，习俗各异，饮食穿着无不异于中原。北面是薛氏成衣铺，南面是
药铺。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "west"   : __DIR__"taihejiekou",
	    "east"   : __DIR__"stoneshop",
	    "north"  : __DIR__"garments",
	    "south"  : __DIR__"yaoshop",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

