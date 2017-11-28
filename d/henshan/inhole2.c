#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "水帘洞内");
        set("long", @LONG
这里阴风瑟瑟，一片漆黑,什么也看不见。唯有洞外有一丝
光亮。
LONG);

	set("exits",([		
	       "out"   :__DIR__"inhole1",	      
	]));	
	     	
       setup();
}

void init()
{
        add_action("do_use","use");
}

int do_use(string arg)
{
    object me,ob;
    me = this_player();

    if (! ob = find_object(__DIR__"inhole2"))
		ob=load_object(__DIR__"inhole2");	

    if (! arg || arg != "fire" ) return 0;
    if (! present("fire", me)) return 0;
   
        write(HIG"\n你点燃了火折，发现这里有出口。\n\n"); 
        me->set_temp("marks/走1",1);

        delete("long");
        set("long",@LONG
借着火光你发现这里有一些出口，但不知道通往何处。
LONG);  
            
        set("exits/west"  ,__DIR__"zigai1");
        set("exits/north" ,__DIR__"zigai2");
	         	
        return 1;
}

void reset()

{
         ::reset();

         delete("exits/west");
         delete("exits/north");

}
