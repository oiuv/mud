#include <room.h>
inherit ROOM;

void create()
{
    	set("short", "草地");
    	set("long", @LONG
这是扬州郊外的一片芳草地，落英缤纷，蜂歌蝶舞，朝露
夕光，沁人心脾。呼朋唤友开怀欢乐正其时。
LONG);
        set("outdoors", "city");
    	set("exits", ([
        	"east" : __DIR__"nanmen",
        	"west" : __DIR__"jiaowai9",
    	]));
    	set("no_clean_up", 0);
    	setup();
    	replace_program(ROOM);
}
