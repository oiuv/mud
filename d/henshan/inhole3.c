#include <ansi.h>
inherit ROOM;

void enter_furong();

void create()
{
        set("short", "水帘洞内");
        set("long", @LONG
这里阴风瑟瑟，一片漆黑,什么也看不见，唯有洞口处有一
丝光亮。
LONG);

	set("exits",([		
	       "out"   :__DIR__"inhole1",         
	]));	
	     	
        setup();
	
}

void init()
{          
      add_action("do_use","use");	
      add_action("do_zou","zou");	
}


int do_use(string arg)
{ 
    object me;
    me = this_player();

    if (! arg) return 0;
    if (! present("fire", me)) return 0;
    if (arg == "fire" ) 
    {
      write(HIW"\n你点燃了火折，发现洞中似乎有一条路可以顺着走(zou)下去。\n\n"NOR);  
      
      delete("long");
      set("long",@LONG
借着火光你看到洞中怪石嶙峋，前方出现一条路不知通向
何处。
LONG);
              
      me->set_temp("marks/走1", 1);

      return 1;
    }
}

int do_zou(string arg)
{
       object me;
       me = this_player();

       if (me->query_temp("marks/走1") ) 
       {
        	tell_object(me, HIR "\n你拿着火折顺着路不停地走...\n\n" NOR);
  		
		call_out("enter_furong", 6);      	      
  
        	me->delete_temp("marks/走1");

        	return 1;
       }
       else 
       {
        	write("你想往哪儿走？\n");

        	return 1;
       }
}

void enter_furong()
{
	object me = this_player();

	tell_object(me, HIW "这条路弯弯曲曲，你感觉走了很久，道路越来越低，像"
			    "是通往另一个山峰的。\n\n" NOR);				

	me->move(__DIR__"furong");
}
