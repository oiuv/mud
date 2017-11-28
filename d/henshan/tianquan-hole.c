#include <ansi.h>
inherit ROOM;

string look_bi(object me);

void create()
{
	set("short","天泉洞");
	set("long",@LONG
一进洞，便听见了泉水（quanshui）流动的声音，只见这口泉水从洞中一
角落处涌出来，旁边却立有一碑（bei）。 山洞正前是个大石壁（bi），壁上
刻有图画，石壁旁却插有一把木剑（mu jian）， 像是有人曾经在这里练过剑
。山洞西面是一张石床（bed），由此断定曾经有人在这里住过。

LONG
);

	set("exits",([
	      "out":__DIR__"xuanyadi",
	]));

	set("item_desc",([
	      "mu jian":"\n一把木剑深深地插在石壁中，直至剑柄，可见当初插剑之人功力何等深厚，实属罕见。\n",
	      "bed":"\n一张非常粗陋的石床，上面却沾满了灰尘。\n",
	      "quanshui":"\n一股清泉源源地从底下涌出，水质清澈，令人忍不住想喝(he)上两口。\n",
	      "bei":"\n上书："HIR"天 泉 之 水"NOR" 字峰遒劲有力。\n",
	      "bi":( : look_bi :),
	]));


	setup();

}

void init()
{
	add_action("do_he","he");
	add_action("do_xue","xue");
	add_action("do_ba","ba");

}

string look_bi(object me)
{
	string msg;	
	int furong,zigai;

	me=this_player();
	furong=me->query_skill("furong-jianfa",1);
	zigai=me->query_skill("zigai-jianfa",1);

	msg=HIC"\n你仔细一看，石壁上刻着五个手持长剑的小人，每人各使一招，细看下像是一套剑法。\n"NOR;

	if(zigai&&furong)msg+=HIY"你仔细琢磨，隐约觉得这套剑法像是[紫盖剑法]和[芙蓉剑法]的招式。\n"NOR;
	if(zigai&&!furong)msg+=HIY"你仔细琢磨，隐约觉得这套剑法像是有[紫盖剑法]的招式。\n"NOR;
	if(!zigai&&furong)msg+=HIY"你仔细琢磨，隐约觉得这套剑法像是有[芙蓉剑法]的招式。\n"NOR;
	msg+=HIC"你越看越起劲，忍不住想跟着学(xue)起来。\n"NOR;
	
	write(msg);
		
	write(@TEXT

  ●>              ●           ●             \  ●	           ●
  \ __           --v|\        \//>---           \//\            --v|^ 
  /<               /<         //> 	          <\              /<          
   								     
[天柱云气]    [泉鸣芙蓉]    [鹤翔紫盖]        [雁回祝融]       [石磬钟声]
								     
TEXT         
);


	return "";

}

int do_he(string arg)
{
	object me=this_player();
	
	if(!arg||arg!="quanshui")
		return notify_fail("你想喝什么？\n");

	if(me->is_fighting()||me->is_busy())
		return notify_fail("你现在正忙着呢。\n");
       
        if(me->query("D_TIANQUAN"))
                return notify_fail("你已经喝过天泉水了。\n");
	
	me->add("water",200);
	write("你俯下身喝了一口泉水，只觉得泉水甘甜无比，平生从未尝过。\n");

        me->set("D_TIANQUAN",1);
	
	return 1;
}

int do_xue(string arg)
{
	object me=this_player();
	int furong,zigai,hengshan,cost_qi,cost_neili,cost_jing,lvl_add;
	
	furong=me->query_skill("furong-jianfa",1);
	zigai=me->query_skill("zigai-jianfa",1);
	hengshan=me->query_skill("hengshan-jianfa",1);
	cost_qi=25;
	cost_neili=25;
	cost_jing=10;
	lvl_add=(int)( (me->query_skill("sword",1)+me->query_skill("literate",1))/2);


	if(!arg||(arg!="bi"&&arg!="石壁") )return 0;

	if(me->is_fighting()||me->is_busy())
	{
	write("你现在正忙着呢。\n");
	return 1;
	}
		
	if(!zigai||!furong||!hengshan)
	{
	write("石壁上的剑法像是几种剑法融合在一起的，你看来看去，不知所措。\n");
	return 1;
	}

	if(zigai<100||furong<120||hengshan<120)
	{
	write("石壁上的剑法你似乎学过一点，但是还是不能融会贯通。\n");	
	return 1;
	}

	if(me->query_skill("literate",1)<300)
	{
	write("也许是你的悟性太差，虽然学过上面的剑法，但还是将其不能融会贯通。\n");
	return 1;
	}

	if(me->query("max_neili")<5000)
	{
	write("你的内力修为太差，无法练习石壁上的剑法。\n");
	return 1;
	}

	if(me->query_skill("sword",1)<=me->query_skill("wushen-jian",1))
	{
	write("你的基础太差了，石壁上的剑法只能学到这个程度。\n");
	return 1;
	}

	if(me->query("jing")<=cost_jing)
	{
	write("你的精力无法集中。\n");
	return 1;
	}

	if(me->query("neili")<=cost_neili)
	{
	write("你的内力不足，无法继续练习。\n");
	return 1;
	}	

	if(me->query("qi")<=cost_qi+5)
	{
	write("你的体力不足，无法继续练习。\n");
	return 1;
	}
	
	if(me->query_skill("wushen-jian",1)>=120)
	{
	write("石壁上的剑法你已全部领悟，以后就靠自己勤加练习了。\n");
	return 1;
	}

	write("你以手作剑，将石壁上的剑法练习了一遍，觉得渐有所悟。\n");
	me->improve_skill("wushen-jian",lvl_add);
	me->receive_damage("qi",cost_qi);	
	me->receive_damage("jing",cost_jing);
	me->add("neili",-cost_neili);

	return 1;

}


int do_ba(string arg)
{
	object me=this_player(),jian,here;

	if(!here = find_object(__DIR__"tianquan-hole"))here = load_object(__DIR__"tianquan-hole");
	
	if(!arg||(arg!="jian"&&arg!="mu jian"&&arg!="木剑"))
		return notify_fail("你要拔什么？\n");
	
	if(me->query("neili")<5000)
	{
	message_vision(HIG"$N用力想要将木剑从石壁中拔出来，但是木剑却纹丝不动。\n"NOR,me);
	return 1;
	}		

	message_vision(HIG"唰~！的一声，$N已将木剑从石壁中拔了出来。\n"NOR,me);

	jian=new(__DIR__"obj/mujian");
	jian->move(me);

	return 1;
}
