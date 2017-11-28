inherit ROOM;

void create()
{
	set("short", "大镇街");
	set("long", @LONG
佛山自古与朱仙、景德、汉口并称天下四大镇，端的是民
丰物阜，市廛繁华。一条大街横亘东西。南边是南门，通往南
海。北边出北门跨南岭可达中原。
LONG);
	set("objects", ([
	        "/d/city/npc/liumangtou": 1,
	]));
	set("outdoors", "foshan");
	set("exits", ([
	        "north" : __DIR__"northgate",
	        "south" : __DIR__"southgate",
	        "west"  : __DIR__"street2",
	        "east"  : __DIR__"street4",
	]));
	setup();
	replace_program(ROOM);
}

