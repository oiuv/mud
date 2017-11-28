inherit ROOM;

void create()
{
	set("short", "苗家大院");
	set("long", @LONG
这是苗家庄园正厅前面的一个宽阔的大院，大院里种植着
各类花草，假山水池，琼楼高台，非常豪华。院内打扫得非常
干净，北边是一间厨房，南边也有一间小屋。
LONG);
	set("exits", ([
  		"west"  : __DIR__"miaojia_men",
  		"east"  : __DIR__"miaojia_zhengting",
  		"north" : __DIR__"miaojia_chufang",
  		"south" : __DIR__"miaojia_chaifang",
	]));
	set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}
