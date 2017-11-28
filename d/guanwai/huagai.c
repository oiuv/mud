// /guanwai/huagai.c

inherit ROOM;
#include <ansi.h>

int i = 0;

string* msg = ({
  HIC "\n突然，一阵洪亮声音从山峰间传来……\n\n" NOR,
  HIW "神秘高人：“可惜，可惜啊！”\n\n" NOR, 
  HIY "你不禁心中一惊，暗想：“此人内力惊人，难道是隐居在这山谷中的高人？”\n" NOR,
  HIY "你运起内力大声说道：“敢问前辈为何方高人，为何叹息？”\n\n" NOR,
  HIW "神秘高人道：“阁下可是中原苗家弟子？”\n\n" NOR,
  HIY "你回答道：“正是，前辈有何指教？莫非前辈认识尊师？\n\n" NOR,
  HIW "神秘高人顿了顿继续道：“往事休要再提……你刚才可是在演练刀剑归真？”\n\n" NOR,
  HIY "你叹了一口气道：“哎！只怕在下今生是无缘窥视刀剑归真之上乘境界了！”\n" NOR,
  HIY "你继续道：“在下穷尽毕生精力也未有缘学得半点胡家刀法的招式，既然这样，在下也只有认命了……”\n\n" NOR,
  HIW "神秘高人大笑道：“阁下何处此言，习武之人立于江湖，武功高低为次，「惩恶扬善、锄强扶弱」为主，阁下岂能\n"
      "为此而灰心失意？\n\n" NOR,
  HIY "你爽朗地笑道：“前辈果真高人，在下听得前辈教诲茅舍顿开，他日行走江湖定会以「惩恶扬善、锄强扶弱」为重！”\n\n" NOR,
  HIW "神秘高人大笑道：“难得阁下有此宽大胸襟，你我也算是有缘人，我就传你一个武功口诀，他日定会有用得到的地方！”\n\n" NOR,
  HIC "说罢，神秘高人将口诀一五一十的传授于你，你一一记于心中 ……\n\n" NOR,
  HIW "你忽然想起什么事情，急忙问道：“前辈，这武功可是 ………”\n\n" NOR,
  HIC "你发现你的声音回荡于山谷间，那神秘高人早已隐去！\n\n" NOR,
  HIC "你学会了「胡家刀法」！\n\n" NOR,
});

// 此处为胡家刀法解迷处
void create()
{
	set("short", "华盖峰");
	set("long", @LONG
长白东侧最高峰，自古以来，华盖峰就是风雨云雾的故道。云雾起处，
恰似掀开锅盖一般，雾气翻滚，池水云天，一脉相连，气壮华夏，故名华盖
峰。
LONG );
	set("exits", ([
		"north"     : __DIR__"tianhuo",
		"westdown"  : __DIR__"tianchi1",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();

}

void init()
{
        add_action("do_yanlian", "yanlian");
}

int do_yanlian(string arg)
{
       object me = this_player();
       object ob;

       if (!arg || arg != "daojian-guizhen")return 0;

       if (me->query_skill("miaojia-jian", 1) >= 250
           && me->query("character") == "光明磊落"
           && !(int)me->query_skill("hujia-daofa", 1)
           && ( (ob = me->query_temp("weapon")) && ((string)ob->query("skill_type") == "blade" 
           || (string)ob->query("skill_type") == "sword"))           
           && random(10) == 1 && me->query("shen") > 50000)
      { 
           if (me->query_temp("learn_now"))return notify_fail("等你忙完了再说。\n");
           me->set_temp("learn_now", 1);
           write("你开始演练刀剑归真。\n");
           write("但是你却发现你连一点胡家刀法都不会，难以继续演练，你长叹一声，心中暗怪命运总捉弄…\n");
           me->start_busy(3);
           remove_call_out("learn_blade");
           call_out("learn_blade", 3, me);    
      }
      else return 0;
     
      return 1;
}

int learn_blade(object me)
{  
     me->start_busy(3);
   
     write(msg[i]);

     if (i == sizeof(msg) - 1)
     {
          me->set_skill("hujia-daofa", 1);
          i = 0;
          me->delete_temp("learn_now");
          return 1;
     }
 
     remove_call_out("learn_blade");
     call_out("learn_blade", 3, me);
 
     i ++;

}
