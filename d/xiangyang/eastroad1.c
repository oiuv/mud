// Room: /d/xiangyang/eastroad1.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "东内大街");
	set("long", @LONG
这是一条青石铺就的大街。西面是一堵盖着红色琉璃瓦的
高墙，里面是襄阳守城大将王坚的府邸大院。东面是是一座镖
局，北面是用青石铺的大街道。南面是一个大的十字街道，只
见人来人往，非常热闹。
LONG );
        set("outdoors", "xiangyang");

	set("no_clean_up", 0);
	set("exits", ([
		"northwest"  : __DIR__"biaoju",
		"south" : __DIR__"eastjie2",
		"north" : __DIR__"eastroad2",
	]));
	setup();
	replace_program(ROOM);
}

