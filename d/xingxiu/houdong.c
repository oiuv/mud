#include <ansi.h>

inherit ROOM;

#define MUDING "/clone/misc/swmuding"

string look_desk();
string look_pet();

void create()
{
        set("short", "日月后洞");
        set("long", @LONG
这里是星宿派日月洞后洞，星宿老仙有时候会在这里闭关
练功。只见洞内灯火通明，似乎比日月洞宽敞了许多。正前方
有一个精致的石桌（desk），石桌上摆着各式水果，想必是星
宿派弟子送来孝敬老仙的。
LONG);
        set("exits", ([
             "south"      : __DIR__"riyuedong",
             "southwest"  : __DIR__"riyuedong1",
        ]));

        set("item_desc", ([
                "desk" :  (: look_desk :),
                "pet"  :  (: look_pet :),
        ]));
               
        setup();

}

string look_desk()
{
       object me = this_player();
       object ob;

       ob = find_object(MUDING);
       if (! ob) ob = load_object(MUDING);       

       if (me->query_temp("move"))
       {
              if (! environment(ob))
                     write(HIC "看来这个石桌被人移动过！底下露出一个小洞，只见洞中放着一"
                           "个木鼎(mu ding)模样的容器！\n你试图想将它拿(pick)出来！\n" NOR);
              else 
                     write(HIW "看来这个石桌被人移动过！底下露出一个小洞，只见洞中空空如也！\n" NOR);
       }

       if (me->query_skill("poison", 1) < 160)
              return NOR + WHT "这是一张很精致的石桌，石桌上雕刻着各种像是毒物（pet）模样的"
                     "图案。阵阵奇特香气\n从石桌中散发出来，你顿感觉头晕目眩，胸闷之极。\n" NOR;

       return NOR + WHT "这是一张很精致的石桌，石桌上雕刻着各种像是毒物（pet）模样的"
              "图案。阵阵奇特香气\n从石桌中散发出来，你心中一惊：“不好，这桌子上竟涂有剧毒！”\n" NOR;
}

string look_pet()
{
       object me = this_player();

       if (me->query("family/family_name") != "星宿派" ||
           me->query_skill("xingxiu-qishu", 1) < 160)
               return NOR + YEL "上面刻有蜈蚣，蜘蛛，蝎子，蛇，蟾蜍五种毒物。\n" NOR;

       return NOR + WHT "上面刻有" HIY "金蜈蚣" NOR + WHT "，" NOR + BLU "黑寡妇" NOR + WHT
              "，"HIR "赤蝎子" NOR + WHT "，" HIW "千年灵蛇" NOR + WHT "，" HIY "花" HIM 
              "斑" NOR + GRN "毒蟾 " NOR + WHT"。你心中一惊：“难道这便是五圣剧毒？”\n" NOR;
}

void init()
{
       add_action("do_move", "move");
       add_action("do_pick", "pick");              
}

int do_move(string arg)
{
       object me = this_player();
       object ob;

       if (! arg || arg != "desk")
             return notify_fail("你想移动什么？\n");

       if (me->query_temp("move"))
             return notify_fail("你已经将石桌移开了！\n");
       
       ob = me->query_temp("armor/hands");

       if (!ob || ob->query("id") != "jinsi shoutao")
       {
             me->delete_temp("move");

             message_sort(HIC "\n$N" HIC "试图将石桌移开，但是$P手刚碰到石桌，却听到一声惨叫，$N" HIC
                            "倒在地上，连挣也没有挣扎便一命呜呼了！\n", me);

             me->die();

             return 1;
             
       }

       me->set_temp("move", 1);
       message_vision(HIG "$N" HIG "轻轻地将石桌移开！\n" NOR, me);
       
       return 1;
}

int do_pick(string arg)
{
      object ob, me;
      object hand;

      me = this_player();

      if (! arg || arg != "mu ding from desk" )
            return notify_fail("你要拿什么？\n");

      if (! me->query_temp("move"))
            return notify_fail("你要拿什么？桌子上没什么好拿的！\n");

      ob = find_object(MUDING);
      if (! ob) ob = load_object(MUDING); 

      if (environment(ob))
            return notify_fail("神木王鼎已经被人拿走了！看来你来晚了！\n");

      hand = me->query_temp("armor/hands");

      if (! hand || hand->query("id") != "jinsi shoutao")
      {
             me->delete_temp("move");
       
             message_sort(HIM "\n$N" HIM "将手伸进石桌试图拿取神木王鼎，但是突然一只赤蝎跳了出来一口"
                         "咬在$N" HIM "的手上，$N" HIM "怪叫一声，顿时毙命！\n" NOR, me);

             me->die();

             return 1;
      }
  
      message_sort(HIM "\n$N" HIM "将手伸进石桌试图拿取神木王鼎，突然一只赤蝎跳了出来一口"
                   "咬在$N" HIM "的" + hand->name() + HIM "上，但是$N" HIM "却丝毫无伤地将"
                   "神木王鼎取了出来！\n" NOR, me);

      ob->move(me);
      me->delete_temp("move");
   
      return 1;
}

