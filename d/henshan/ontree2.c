#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "古树顶");
	set("long", @LONG
你极目远眺，四周尽是悬崖峭壁。一条树藤(teng)从你面
前垂下。忽然间你看见前面峭壁上似乎有一个山洞(hole)，但
是距离甚远却是怎么也过不去。
LONG);
        set("exits", ([ 
               "down" : __DIR__"ontree",
           ]));

	set("item_desc", ([
               "hole"    : HIC "\n太远了，看得不太清楚，看来得想个办法过去。\n"	NOR,
           
	       "teng"    : YEL"\n这些树藤看起来很结实，看来可以拉着根树藤跳过去。\n" NOR,
	]));


	setup();
}

void init()
{
       add_action("do_la", "la");
       add_action("do_tiao", "tiao");
      
}

int do_la(string arg)
{
	object me;

	me = this_player();
	
	if (! arg || arg != "teng")
		return notify_fail("你想干什么？\n");

        if (me->is_busy() || me->is_fighting())
                return notify_fail("等你忙完了再说。\n");

        if (me->query_temp("la_teng"))
                return notify_fail("你已经拉着了啊？\n");

        message_vision(NOR + YEL "$N" NOR + YEL "双手紧紧拉住树藤，看起来很"
                       "结实。\n" NOR, me);

        me->set_temp("la_teng", 1);
                  
	return 1; 
	
}

int do_tiao(string arg)
{
	object me;

	me = this_player();
	
	if (! arg || arg != "hole")
		return notify_fail("你想干什么？\n");

        if (me->is_busy() || me->is_fighting())
                return notify_fail("等你忙完了再说。\n");

        if (! me->query_temp("la_teng"))
                return notify_fail("太远了，这样恐怕跳不过去！\n");

        if (random(6) != 1)
        { 
              message_sort(HIC "\n$N" HIC "双手紧紧拉住树藤，腾空而起，向山洞跳去。但是树藤“啪~”的一声"
                           "在半空断掉，$N " HIC "重重地摔了下去……\n\n" NOR, me);
              me->move(__DIR__"xuanyadi");
              me->delete_temp("la_teng");
              me->unconcious();
              return 1;
       }

       message_sort(HIC "\n$N" HIC "双手紧紧拉住树藤，腾空而起，向山洞跳去，树藤在空中划出一道美妙的弧线。"
                    "$N" HIC "只觉耳边风声呼呼……很快$N" HIC "轻轻地落在了洞口，回头望见树藤在空中摇摆"
                    "着！\n\n" NOR, me);

      me->delete_temp("la_teng");
      me->move(__DIR__"outzhushendong");     
          
      return 1; 
	
}