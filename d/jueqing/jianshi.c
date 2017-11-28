#include <ansi.h>

#define JUNZI   "/clone/lonely/junzijian"
#define SHUNV   "/clone/lonely/shunvjian"

inherit ROOM;

string look_hua();

void create()
{
        set("short", "剑室");
        set("long", @LONG
只见室中的壁上、桌上、架上、摆满了各类兵刃，式样繁
多，十之八九都是古剑，或长逾七尺，或短仅数寸，有的铁斑
驳，有的寒光逼人，直看得人眼光撩乱。不远处的墙壁上挂着
有一副古画(hua)。
LONG);
        set("item_desc", ([
               "hua" : ( : look_hua :),
        ]));

        set("exits", ([
               "south" : __DIR__"houtang",
        ]));

        set("no_clean_up", 0);
        setup();
}

string look_hua()
{
      object ob, junzi, shunv;
      string msg;

      if (! ob = find_object(__DIR__"jianshi"))
              ob = load_object(__DIR__"jianshi");

      if (! ob->query_temp("marks/拉"))
              return HIW "古画已经破旧不堪，画中一对男女各持一柄无锋之剑。\n" NOR;

      msg = HIY "画已被人撕破。" NOR;

      junzi = find_object(JUNZI);
      shunv = find_object(SHUNV);


      if (! junzi) junzi = load_object(JUNZI);
      if (! shunv) shunv = load_object(SHUNV);

      if (! environment(junzi) && ! environment(shunv))    
      { 
              msg += HIY "但见画后有二柄无锋之剑，看上去像是一对。\n" NOR;
              return msg;          
      } else
      if (! environment(junzi) || ! environment(shunv))
      {
              msg += HIY "但见画后有一柄铁口斑驳，寒光逼人的宝剑。\n" NOR;
              return msg;
      }

      msg += HIY "画后空空如也，什么都没有。\n" NOR;
      return msg;
}

void init()
{       
        add_action("do_pull", ({ "pull" }));
        add_action("do_pick", ({ "pick" }));
}

int do_pull(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || arg != "hua")
                return notify_fail("你要做什么？\n");

        if (! ob = find_object(__DIR__"jianshi"))
                ob = load_object(__DIR__"jianshi");

        if(ob->query_temp("marks/拉"))
        {
                write("画已经被拉破了。\n");
                return 1;
        }

        message_vision(HIG "只听见“咔嚓”一声，$N " HIG "将墙上的画"
                       "拉破了。\n" NOR, me);
        ob->set_temp("marks/拉", 1);

        return 1;
}

int do_pick(string arg)
{
        object ob,me;
        object junzi,shunv;

        me = this_player();

        if (! ob = find_object(__DIR__"jianshi"))
                ob = load_object(__DIR__"jianshi");

        if (! arg || (arg != "junzi jian" && arg != "shunv jian" ))
                return notify_fail("你要拿什么？\n");
        
        if (ob->query_temp("marks/君") && ob->query_temp("marks/女")
            || ! ob->query_temp("marks/拉"))
                return notify_fail("你要拿什么？\n");

        junzi = find_object(JUNZI);
        shunv = find_object(SHUNV);

        if (! junzi) junzi = load_object(JUNZI);
        if (! shunv) shunv = load_object(SHUNV);

        if (arg == "junzi jian")
        {
                 if (! environment(junzi))
                 {
                         junzi->move(me, 1);
                         message_vision(HIC "$N" HIC "将墙上的「君子剑」"
                                        "取了下来。\n" NOR, me);
                         return 1;
                 } else
                         return notify_fail(NOR + YEL "君子剑已被拿走。\n" NOR);
        }   

        if (! environment(shunv))
        {
                shunv->move(me, 1);
                message_vision(HIC "$N" HIC "将墙上的「淑女剑」"
                               "取了下来。\n" NOR, me);
                return 1;
        } else
                return notify_fail(NOR + YEL "淑女剑已被拿走。\n" NOR);        

        return 1;
}
