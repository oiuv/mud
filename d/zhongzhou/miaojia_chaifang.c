inherit ROOM;

void create()
{
	set("short", "柴房");
	set("long", @LONG
这是一间矮小的瓦房，平时作为堆放杂物所用。房屋里布
满了蛛网，地面满是灰尘。看样子已经很久没有人打扫了。柴
房的一角斜放着几捆干柴。
LONG);
	set("exits", ([
  		"north" : __DIR__"miaojia_dayuan",
	]));
	set("no_clean_up", 0);
        set("objects", ([
                "/d/wudu/obj/ganchai" : 2,
        ]));
	setup();
        replace_program(ROOM);
}
