inherit ROOM;

void create()
{
        set("short", "东大街");
        set("long", @LONG
东大街是开封府内东街区的主要通道。道路的两端店铺府
第不断。行人如缕，观光的，作生意的，攀交情的，以至走亲
访友的，南边不远就是山陕甘会馆。西面是开封铁塔。东面则
是名满天下的红花会的总舵所在。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"eroad2",
  		"west" : __DIR__"tieta",
  		"east" : __DIR__"hh_qguangchang",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
