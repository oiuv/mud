inherit ROOM;

void create()
{
	set("short", "昆仑山麓");
        set("long", @long
整个昆仑山脉雪山连绵，冰河垂悬。远望昆仑，有如横卧
云彩间的银色玉龙。每年春天以后，冰雪融化，汇成一股股清
澈溪流，流入长江，黄河。
long);
        set("exits",([
	        "northup" : __DIR__"shanmen",
                "east" : __DIR__"shankou",
        ]));
	set("outdoors", "kunlun");
	setup();
	replace_program(ROOM);
}
