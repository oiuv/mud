#include <room.h>
inherit ROOM;

void create()
{
	set("short", "鲜花店");
	set("long", @LONG
这是一个小小的店面，剧说这儿的老板是个六十来岁的老头子，可是你此
时见到的却是一位年纪轻轻的小姑娘。此时她正在细心的为客户挑选花朵，态
度非常可人, 脸上的两个小酒窝里盛着天真烂漫的笑容。顿时你也想凑个趣，
在她这儿买几束花。
LONG );
       set("exits", ([
		"south" : __DIR__"yong_2",
	]));
	set("objects", ([
		__DIR__"npc/huanv" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

