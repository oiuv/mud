inherit ROOM;

void create()
{
	set("short", "猪肉铺");
	set("long", @LONG
脏稀稀的木板上放着几块颜色灰暗，不堪入目的生肉。一堆绿头苍蝇
忙忙碌碌的飞起飞落。几个生了锈的铁勾上挂着半风干了的羊头，猪头，
和牛头。柜台的左角儿放着几个木匣，匣中放着些煮熟了的杂碎和排骨。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"zashua",
  		"south" : __DIR__"wanju",
  		"east" : __DIR__"hutong3",
	]));
        set("objects", ([
                "/d/beijing/npc/old1" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
