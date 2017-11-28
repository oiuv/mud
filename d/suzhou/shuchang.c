// Room: /d/suzhou/shuchang.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "书场");
	set("long", @LONG
你走进书场，看见里面热热闹闹的，场子里都是听书的，
场子前面有一位说书先生，他看上去四五十岁，手中拿着一块
响板，正在聚精会神地说着评书--《杨家将》。你也逐渐被评
书的内容所吸引，场中的人们不时的发出惊叹和喝彩声，时不
时将铜板抛了上去。
LONG );
	set("outdoors", "suzhou");
//	set("no_clean_up", 0);
	set("exits", ([
		"south"  : __DIR__"xidajie2",
	]));
	set("objects", ([
		__DIR__"npc/gongzi": 1,
	]));
	setup();
	replace_program(ROOM);
}
