// Room: /d/xiangyang/nixianglou.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "觅香楼");
	set("long", @LONG
襄阳城里没有不知道“觅香楼”的。虽是抗战时期，来往
公务却多，饭后谈资也富，生意反见兴隆。楼下布置简易，顾
客多是匆匆的行人，买点包子、鸡腿、米酒就赶路去了。楼上
是雅座。抗战期间，厉行节约，不许挥霍，就没啥生意，只好
关了。
LONG );
	set("exits", ([
		"west" : __DIR__"southjie2",
	]));
	set("objects", ([
		__DIR__"npc/xiaoer2" : 1,
	]));
	setup();
	replace_program(ROOM);
}

