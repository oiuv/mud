#include <room.h>
inherit ROOM;

void create()
{
    set("short", "密林");
    set("long", @LONG
扬州郊外的茂密树林，阴森可怖。抬头不见天日。这里也
是扬州命案发生最多的地方。鸟兽蛇虫游荡不穷。
LONG);
        set("outdoors", "city");
    	set("exits", ([
        	"north"     : __DIR__"jiaowai3",
        	"west"      : __DIR__"jiaowai5",
        	"southeast" : "/d/guiyun/shulin1",
    	]));
    	set("objects", ([
        	__DIR__"obj/shuzhi": 2,
        	__DIR__"obj/shitou": 2,
    	]));
    	setup();
    	replace_program(ROOM);
}

