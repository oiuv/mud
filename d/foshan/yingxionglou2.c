inherit ROOM;

void create()
{
	set("short", "英雄楼");
	set("long", @LONG
英雄酒楼里桌椅洁净。座中客人衣饰豪奢，十九是富商大
贾。这里可以俯瞰佛山镇全景。
LONG);
	set("objects", ([
	        __DIR__"npc/pang": 1,
	        __DIR__"npc/shou": 1,
	]));
	set("exits", ([
	        "down" : __DIR__"yingxionglou",
	]));
	setup();
	replace_program(ROOM);
}

