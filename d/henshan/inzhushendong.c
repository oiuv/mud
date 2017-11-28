#include <ansi.h>
inherit ROOM;

string look_bi();
string look_pic1();
string look_pic2();
string look_pic3();

void create()
{
        set("short", "诸神仙洞内");
        set("long", @LONG
四周很空旷，偶尔说话也能听见回声，但这里靠近洞口光
线还算不错。千百年来的尘土已将周围山壁(bi)掩盖。
LONG);
	set("item_desc",([
	       "bi" :  (: look_bi :),
               "pic1": (: look_pic1 :),
               "pic2": (: look_pic2 :),
               "pic3": (: look_pic3 :),
               
               
	]));

	set("exits",([
	       "out":__DIR__"outzhushendong",
	]));	
	     	
       setup();
}

string look_bi()
{
      object me = this_player();

      if (! me->query_temp("gua"))
          return NOR + WHT "尘土已将其掩盖，不知道后面藏有什么。你不禁想将尘土刮去看看"
                 "后面是什么样的。\n" NOR;
      
      return HIY "\n只见山壁上刻有三副巨图。图中人物个持宝剑，与人比武。\n"
             "第一副(pic1)的人物欲退反进，以守为攻。\n"
             "第二副(pic2)的人物手中之剑却突然化为无数把攻向对手。\n"
             "第三副(pic3)更为奇怪，那人物却突然一分为五，分使五种不同招式。\n"
             "你越看越奇怪，忍不住想跟着参悟起来。\n\n" NOR;
      
}

string look_pic1()
{
      object me = this_player();

      if (! me->query_temp("gua"))
          return NOR + WHT "这里没有你要看的东西。\n" NOR;

     return HIY "\n图中人物以守为攻，欲退反进，攻其不备。\n" NOR;
}

string look_pic2()
{
      object me = this_player();

      if (! me->query_temp("gua"))
          return NOR + WHT "这里没有你要看的东西。\n" NOR;

     return HIY "\n图中人物千剑齐发，令对手无从招架。\n" NOR;
}

string look_pic3()
{
      object me = this_player();

      if (! me->query_temp("gua"))
          return NOR + WHT "这里没有你要看的东西。\n" NOR;

     return HIY "\n图中人物一分为五，分使五招，但见招招精妙，气压群山。\n" NOR;
}

void init()
{              
	add_action("do_canwu",({"canwu","think"}));
        add_action("do_gua", ({"gua"}));
	
}

int do_gua(string arg)
{
    object me = this_player();

    if (me->is_busy())
          return notify_fail("你现在正忙着呢。\n");

    if (me->is_fighting())
          return notify_fail("你在战斗哦？！小心，来了！！！\n");

    if (! arg || arg != "bi")
          return notify_fail("你要刮什么？\n");

    write(HIG "\n你走到山壁旁，将山壁上的尘土一一刮去，后面景象一一显露了出来。\n" NOR);
    me->set_temp("gua", 1);
   
    return 1;
    
}
int do_canwu(string msg)
{
    object me = this_player();

    string where, witch;
    
    if (! msg)return notify_fail("你要参悟什么？\n");

    if (sscanf(msg, "%s from %s", witch, where) != 2)
          return notify_fail("你要参悟什么？\n");

    if (me->is_busy())
          return notify_fail("你现在正忙着呢。\n");

    if (me->is_fighting())
          return notify_fail("你在战斗哦？！小心，来了！！！\n");

    if (witch != "pic1"
        && witch != "pic2"
        && witch != "pic3")
          return notify_fail("你想参悟什么？\n");

    if (where != "bi")
          return notify_fail("这里没什么给你参悟的啊！\n");

    if ((int)me->query_skill("martial-cognize", 1) < 220)
          return notify_fail("你的武学修养不够，无法领悟石壁上的武功！\n");

    if ((int)me->query_skill("force", 1) < 180)
          return notify_fail("你的内功修为不够，无法贯通石壁上的绝学！\n");

    if ((int)me->query("max_neili") < 3000)
          return notify_fail("你的内力修为不足，无法贯通石壁上的绝学！\n");

    if ((int)me->query("jing") < 100)
          return notify_fail("你的精力无法集中，无法领悟石壁上的绝学！\n");

    if (me->query_skill("wushen-jian", 1) < 180)
          return notify_fail("你对衡山五神剑所知实在有限，无法领悟石壁上的绝学！\n");

    if (witch == "pic1" 
        && me->query("can_perform/wushen-jian/hui"))
          return notify_fail("这项绝学你不是已经会了吗？\n");

    else 
    if (witch == "pic2" 
        && me->query("can_perform/wushen-jian/qian"))
          return notify_fail("这项绝学你不是已经会了吗？\n");

    else 
    if (witch == "pic3" 
        && me->query("can_perform/wushen-jian/shen"))
          return notify_fail("这项绝学你不是已经会了吗？\n"); 

    me->receive_damage("jing", 95);

    me->start_busy(2 + random(4));

    if (random(2) == 1 && witch == "pic1")
    {
        me->add("wushen_perform/hui/count", 1);

        if (me->query("wushen_perform/hui/count") >= 10)
        {
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
            write(HIC "你终于通晓了绝学「回峰蜿蜒势」。\n" NOR);

            me->set("can_perform/wushen-jian/hui", 1);
            me->delete("wushen_perform/hui/count");

            if (me->can_improve_skill("sword"))
                    me->improve_skill("sword", 1500000);
            if (me->can_improve_skill("wushen-jian"))
                    me->improve_skill("wushen-jian", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);

            return 1;
        }

        write(HIC "你对「回峰蜿蜒势」这招有了新的认识，但是仍有许多不解之处。\n" NOR);
        me->start_busy(1 + random(2));
        return 1;   
    }

    else 
    if (random(4) == 1 && witch == "pic2")
    {
        me->add("wushen_perform/qian/count", 1);

        if (me->query("wushen_perform/qian/count") >= 16)
        {
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
            write(HIC "你终于通晓了绝学「千剑纵横势」。\n" NOR);

            me->set("can_perform/wushen-jian/qian", 1);
            me->delete("wushen_perform/qian/count");

            if (me->can_improve_skill("sword"))
                    me->improve_skill("sword", 1500000);
            if (me->can_improve_skill("wushen-jian"))
                    me->improve_skill("wushen-jian", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);

            return 1;
        }

        write(HIC "你对「千剑纵横势」这招有了新的认识，但是仍有许多不解之处。\n" NOR);
        me->start_busy(2 + random(3));
        return 1;   
    }

    else 
    if (random(5) == 1 && witch == "pic3")
    {
        me->add("wushen_perform/shen/count", 1);

        if (me->query("wushen_perform/shen/count") >= 20)
        {
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
            write(HIC "你终于通晓了绝学「五神朝元势」。\n" NOR);

            me->set("can_perform/wushen-jian/shen", 1);
            me->delete("wushen_perform/shen/count");

            if (me->can_improve_skill("sword"))
                    me->improve_skill("sword", 1500000);
            if (me->can_improve_skill("wushen-jian"))
                    me->improve_skill("wushen-jian", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);

            return 1;
        }

        write(HIC "你对「五神朝元势」这招有了新的认识，但是仍有许多不解之处。\n" NOR);                
        me->start_busy(2 + random(3));
        return 1;   
    }

    else return notify_fail("你试图从石壁上研究有关「衡山五神剑」的内容，但却没什么效果！\n");

}