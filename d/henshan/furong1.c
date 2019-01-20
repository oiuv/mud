#include <ansi.h>
inherit ROOM;

string look_wall();
string look_net();

void create()
{
        set("short","芙蓉洞");
        set("long",@LONG
一进入洞中，阳光便射在头顶上，举目一望，原来洞顶有
一个小洞，阳光便是从中射进来的，一看四周，这里长满了芙
蓉花，正由于上面的小洞(dong)才使这些花不至于枯死也有充
足的阳光照射。不远处石壁(wall)上布满了蜘蛛网，看来这里
的主人已经很久没有来了。想到这里不禁苍凉之意顿起：「芙
蓉花开时，不见主人归」。
LONG);
   
        set("exits",([
                "out" : __DIR__"furong",
        ]));	

        set("item_desc",([
	        "wall"  : (: look_wall :),
	        "net"   : (: look_net :),

                "dong"  : HIY "阳光从洞外射进来，四周怪石(stone)突出，似乎可"
                          "以从这里爬(climb)上去。\n" NOR,

                "stone" : "只见这些突石有的坚韧如刀，有的层错如梯，各显其异。\n"
        ]));

        setup();
}	

void init()
{       
        add_action("do_pull", "pull");
        add_action("do_think", "think");
        add_action("do_climb", "climb");
}

int do_pull(string arg)
{
        object here;
 
        if (! here = find_object(__DIR__"furong1"))
                here = load_object(__DIR__"furong1");

       	if (! arg || arg != "net")
        {
                write("你要拉什么？\n");
                return 1;
        }

        if (here->query_temp("marks/拉"))
        {
                write("蜘蛛网已经被拉破了。\n");
                return 1;	
        }
    
        write(HIC "\n你把蜘蛛网拉了下来。\n" NOR);
        here->set_temp("marks/拉", 1);

        return 1;
}

int do_think(string arg)
{
        object here, me = this_player();
        int add;

        if (! here = find_object(__DIR__"furong1"))
                here = load_object(__DIR__"furong1");

        if (me->query("special_skill/clever"))
		add = me->query_int() * 5;
        else
		add = me->query_int() * 3;

        if (! here->query_temp("marks/拉"))
                return notify_fail("什么？\n");

        if (! living(me) || arg != "wall")
                return notify_fail("你要参悟什么？\n");

        if (me->is_busy() || me->is_fighting())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("sword", 1) < 30)
                return notify_fail("你的基本剑法火候不够，无法领悟石壁"
                                   "上的剑法。\n");

        if ((int)me->query_skill("furong-jian", 1) < 20)
                return notify_fail("你发现墙上所记载的剑法过于深奥，自"
                                   "己一时难以领会。\n");

        if ((int)me->query_skill("furong-jian", 1) > 120)
                return notify_fail("你发现墙上所记载的剑法过于肤浅，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query("jing") < 25)
                return notify_fail("你现在精神不济，过于疲倦，还是休息"
                                   "一会吧。\n");

        me->receive_damage("jing", 20);

        if (me->can_improve_skill("furong-jian"))
                me->improve_skill("furong-jian", add);

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详墙上所记载的剑法，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「芙蓉剑法」有了新的领悟。\n" NOR);
        return 1;
}

string look_wall()
{
        object here, me = this_player();
        string msg;

        if (! here = find_object(__DIR__"furong1"))
                here = load_object(__DIR__"furong1");

        if (here->query_temp("marks/拉"))
        {
        	message_sort(HIG "\n你走到石壁前，抹去上面多年来积蓄的灰"
                             "尘，发现上面所刻的竟是一套剑法。这些全部都"
                             "是用利器所刻，当可见当初刻绘之人功力深厚，"
                             "用心良苦。你不禁对这位前辈心生敬仰之情。只"
                             "见壁上全是一个个小人，每个人都使出不同的招"
                             "式，剑法精妙令人折服。\n" NOR, me);

		write(WHT @TEXT

  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃                                                 ****** ┃
  ┃   ●>        ●       ●        ●       ●     * 芙 * ┃
  ┃   \ __    ━v|\     \//>━    \//\__   ━v|^    * 蓉 * ┃
  ┃   /<        /<       /> 	    />        /<     * 剑 * ┃
  ┃						     * 法 * ┃
  ┃					             ****** ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
							     
TEXT NOR);
	        return "\n";
         }

	 msg = WHT "\n石壁上面布满了蜘蛛网(net)，显然很久没有人来过这里"
               "了。\n看到此处，你心中悲凉之意顿起！\n" NOR;

         return msg;
}

string look_net()
{
//	object me = this_player();
        object here;
        string msg;

        if (! here = find_object(__DIR__"furong1"))
                here = load_object(__DIR__"furong1");

        if (here->query_temp("marks/拉"))
                return "一张被拉破的蜘蛛网悬在半空。\n";

        msg = WHT "\n你走进细看，石壁上几只蜘蛛还在不停地吐丝织网，透过"
              "蛛网\n竟能隐约看见石壁上残留的一些文字。你不禁想拉开(pul"
              "l)蛛\n网看个究竟。\n" NOR;

        return  msg;
}

int do_climb(string arg)
{	
	object me = this_player();

  	if (! arg || arg != "stone")
		return notify_fail("你想爬什么？\n");

	write(HIG "\n你踩着洞中突出的石头上，很快爬出了洞口。\n\n" NOR);

	me->move(__DIR__"furongfeng");
	   
	return 1;
}