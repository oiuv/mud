inherit ROOM;

void create()
{
        set("short", "东大街");
        set("long", @LONG
东大街是开封府内东街区的主要通道。道路的两端店铺府
第不断。行人如缕，观光的，作生意的，攀交情的，以至走亲
访友的。东面就是山陕甘会馆。西面有梯道可上角楼。
LONG);
        set("objects", ([
  		__DIR__"npc/qigai" : 1,
	]));

        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"eroad1",
  		"north" : __DIR__"eroad3",
  		"east" : __DIR__"huiguan",
  		"westup" : __DIR__"jiaolou2",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
