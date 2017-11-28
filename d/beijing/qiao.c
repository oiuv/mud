#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "金水桥");
	set("long", @LONG
一座不大的拱桥，横架在紫禁城的护城河两岸，通过金水桥向北走便是紫
禁城的正门了，那里守卫深严，坚实的城墙高高的耸立着。桥的南面是著名的
天安门广场，在这便可以听见嘈杂的人声，过往穿梭其中的人们络绎不绝，热
闹非凡。
LONG NOR);
	set("exits", ([
		"south" : __DIR__"tiananmen",
		"north" : __DIR__"hgmen_s",
	]));
	set("objects", ([
		__DIR__"npc/bing1" : 2,
		__DIR__"npc/xiaofan" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

