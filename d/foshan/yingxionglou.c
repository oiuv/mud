inherit ROOM;

void create()
{
	set("short", "英雄楼");
	set("long", @LONG
英雄楼乃是佛山大豪「南霸天」凤天南的家业。酒楼里桌
椅洁净。座中客人衣饰豪奢，十九是富商大贾。佛山地处交通
要地，来这吃饭的人还真不少。
LONG);
	set("objects", ([
	        __DIR__"npc/fengqi": 1,
	]));
	set("exits", ([
	        "north" : __DIR__"street4",
	        "south" : __DIR__"majiu",
	        "up"    : __DIR__"yingxionglou2",
	]));
	setup();
	replace_program(ROOM);
}

