inherit ROOM;

void create()
{
	set("short", "村外草坡");
	set("long", @LONG
一大片山坡长满青草，正是放牧牛羊的好地方。这里地
势甚高，天空呈深蓝色，附近山岭树木已经甚少，基本上都
是低矮灌木或草地。不少附近的村民在此放牧。
LONG);
	set("objects",([
	    	__DIR__"npc/muyangren": 1,
	    	__DIR__"npc/muyangnu": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"west"      : __DIR__"wumeng",
	]));
	setup();
	replace_program(ROOM);
}

