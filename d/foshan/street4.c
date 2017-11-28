inherit ROOM;

void create()
{
	set("short", "东镇街");
	set("long", @LONG
凤家在佛山是首屈一指的大户，凤家的家丁常牵着狼狗鱼
肉乡里。一般的百姓只好忍辱偷生。一条大街横亘东西。路南
一家三开间门面的大酒楼，招牌上写着「英雄楼」三个金漆大
字，两边敞着窗户，酒楼里刀杓乱响，酒肉香气阵阵喷出。路
北有家烧饼油条铺，里面传出阵阵油烟香气。
LONG);
	set("objects", ([
	        "/clone/quarry/gou2" : 2,
	        __DIR__"npc/zhongxiaoer" : 1,
	        __DIR__"npc/zhongsisao"  : 1,
	]));
	set("outdoors", "foshan");
	set("exits", ([
	        "north" : __DIR__"youtiaopu",
	        "south" : __DIR__"yingxionglou",
	        "west"  : __DIR__"street3",
	        "east"  : __DIR__"street5",
	]));
	setup();
	replace_program(ROOM);
}

