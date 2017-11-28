// Room: /lingzhou/daodian.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "刀店");
	set("long", @LONG
这是一家以卖西域特产“英吉儿”小刀出名的兵器铺，上百把各
式各样的“英吉儿”小刀整整齐齐的摆放在柜台上，说是小刀却尺寸
型制大不相同，既有长仅一寸的柳叶飞刀、也有长达三尺的阿拉伯弯
刀。最多的还是长六寸，宽三分，背厚一黍，刃薄如纸的匕首柜台后
面的墙上也挂着些长剑，钢刀，铁杖等中原兵器。
LONG );
	set("exits", ([
		"north"  : __DIR__"xidajie",
	]));
	set("objects", ([
		__DIR__"npc/daodianhuoji" :1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

