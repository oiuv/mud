#include <ansi.h> 
inherit ROOM;

void create()
{
	set("short", "醉仙楼");
	set("long", @LONG
方圆数百里内提起扬州城醉仙楼可以说是无人不知，无人
不晓。当年苏学士云游到此，对醉仙楼的花雕酒赞不绝口，欣
然为其题匾，流下一段传遍海内的佳话，从此醉仙楼名声大震。
楼下布置简易，顾客多是匆匆的行人，买点包子、鸡腿、米酒
就赶路去了。楼上是雅座。
LONG );
	set("exits", ([
		"east" : __DIR__"majiu",
		"west" : __DIR__"beidajie2",
		"up" : __DIR__"zuixianlou2",
		"north" : __DIR__"wfoxd",
	]));
	set("objects", ([
		__DIR__"npc/xiaoer2" : 1,
	]));
 
    set("no_fight", 1);
	setup();
	//replace_program(ROOM);
}

int valid_leave(object me, string dir) 
{
        object ob = this_player();

        if (dir == "north" && ob->query("id") != "ivy") 
                return notify_fail(HIW "你感觉前方有一种奇异的力场拦住了你的去路。\n" NOR);

        return ::valid_leave(me, dir);
}