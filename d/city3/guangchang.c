inherit ROOM;

void create()
{
	set("short", "广场");
	set("long", @LONG
这里是成都提督府前广场。好空旷的地方，只有稀稀落落
几个没精打采的行人。北面就是提督府了，南边是提督街。广
场周围种了一圈遮阳树，但骄阳仍把地面晒得滚烫冒烟。
LONG );
        set("outdoors", "chengdu");
	set("exits", ([
	    	"east"  : __DIR__"shuduroad1",
	    	"west"  : __DIR__"shuduroad2",
	    	"south" : __DIR__"tiduroad",
	    	"north" : __DIR__"tidugate",
	]));

	set("objects", ([
                  "/d/city/npc/wujiang" : 2,
	]));
	setup();
}

int init()
{
       add_action("do_get", "get");
       add_action("do_eat", "eat");
       add_action("do_drink", "drink");
}

int do_drink()
{
       write("别在这里喝！\n");
       return 1;
}

int do_eat()
{
       write("要吃到别处吃！\n");
       return 1;
}

int do_get(string arg)
{
       object me = this_player();
      
       if (!arg)return 0;

       if (arg == "all")
       {
               write("不要贪心，还是一样一样地拣吧！\n");
               return 1;
       }
      
       if (me->is_busy() || me->is_fighting())
       {
               write("你还是忙完了再说吧！\n");
               return 1;
       }
       
       if (me->query_temp("pick_gift"))
       {
               write("你刚拣过了，等等再拣吧！\n");
               return 1;
       }
   
       me->set_temp("pick_gift", 1);
       call_out("clear_flag", 2, me);
       return 0;
}

void clear_flag(object me)
{
       if (objectp(me) && me->query_temp("pick_gift"))
                me->delete_temp("pick_gift");

       return;
}
