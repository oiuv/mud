// Room: /lingzhou/jiangjunyuan.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "将军府大院");
	set("long", @LONG
这里是将军府的大院，当面一堵宽阔的白玉照壁，上书“忠心报国”
四个大字，落款是当今西夏皇帝李元昊。一色的青砖铺地，有几个仆役
正在院中洒扫，南面是内宅，东面是个小院。
LONG );
	set("exits", ([
		"east"  : __DIR__"xiaoyuan",
		"south" : __DIR__"neizai",
		"north" : __DIR__"jiangjungate",
	]));
	set("no_fight",1);
	set("objects", ([
		"/d/city/npc/jiading" : 2,
	]));
	setup();
	create_door("north" , "油木大门", "south" , DOOR_CLOSED);
}
