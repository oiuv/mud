// Room: /huanghe/huanghe_3.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "黄河");
	set("long", @LONG
葛水过了古浪，和源于酒泉西北的洪水河于新城合流。到了这里，
河水的去势逐渐加强，挟带着千万吨的高原泥沙，势不可挡地向西南奔
去。由于此处水流湍急，这里的鱼大多肉厚脂丰。名扬天下的黄河大鲤
鱼即产于此。
LONG );
	set("exits", ([
		"east" : __DIR__"huanghe_2",
		"west" : __DIR__"yongdeng",
	]));
	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

