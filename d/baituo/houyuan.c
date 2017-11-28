inherit ROOM;

void create()
{
        set("short","后院");
        set("long", @LONG
这里是一处僻静的后院，住着少庄主欧阳克的老奶妈张妈。
由于她年岁已高，她已经不干活了，在这里静养。
LONG);
  	set("outdoors", "baituo");
  	set("exits", ([
      		"southeast" : __DIR__"zhuyuan",
     	]));

  	set("objects", ([
    		__DIR__"npc/zhangma" : 1,
    	]));

 	setup();
 	replace_program(ROOM);
}
