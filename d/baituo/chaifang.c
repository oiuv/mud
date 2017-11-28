inherit ROOM;

void create()
{
  	set("short", "柴房");
        set("long", @LONG
这是间不宽的柴房，木柴已经快烧光了，剩余的几堆干柴
乱七八糟摆放在地面，墙角放着一柄柴刀。
LONG);
  	set("exits", ([
      		"west" : __DIR__"chufang",
  	]));
  	set("objects", ([
    		"/d/wudu/obj/ganchai"   : 2,
    		"/clone/weapon/chaidao" : 1,
  	]));
 	setup();
 	replace_program(ROOM);
}
