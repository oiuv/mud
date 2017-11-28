#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "诸神仙洞");
        set("long", @LONG
举目四望，周围尽是悬崖峭壁(bi)，猛一抬头看见洞口上
写着「诸神仙洞」四个大字。但是字体经过风雨的冲蚀已经磨
损，周围野草杂生，心中悲凉不已。
LONG);
	set("item_desc",([
	       "bi" :   "光突突的峭壁上垂下数根长腾(teng)。\n",  
               "teng" : YEL "看来很结实，可做攀爬之用。\n" NOR,
	]));

	set("exits",([
	       "enter":__DIR__"inzhushendong",
	]));	
	     	
       setup();
}

void init()
{              
	add_action("do_climb",({"climb","pa"}));
	
}

int do_climb(string arg)
{
	object me, here, shilin;
	string msg;
	int qi;

	me = this_player();
	qi = me->query("qi");
	
	if (! arg || arg != "teng")
		return notify_fail("你想往哪儿爬？\n");
	
	if ( !here = find_object(__DIR__"outzhushendong"))
		here = load_object(__DIR__"outzhushendong");
	if ( !shilin = find_object(__DIR__"shilinfeng"))
		shilin =load_object(__DIR__"shilinfeng");

       	msg = HIG "\n$N" HIG "拉着树藤往峭壁上爬去。\n"NOR;
	
       	if(qi < 100)
	{
		msg += HIM "\n$N" HIM "体力不知，从峭壁上摔了下来。\n" NOR;
		message_vision(msg, me);
		me->unconcious();
		return 1;
	}
	message_vision(msg, me);
	message("vision",HIG "\n"+me->name()+"从峭壁下面爬了上来。\n", shilin, me);
	me->move(shilin);

	return 1;

}