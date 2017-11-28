// Room: jianzhong 剑冢
// Modify by Rcwiz for hero.cd
// 获得玄铁重剑、无名剑

#include <ansi.h>

inherit ROOM;

string look_fen();
string look_stone();
string look_sword2();
string look_sword3();

#define XUANTIE "/clone/lonely/xuantiejian"
#define NONAME "/clone/lonely/noname"

void create()
{
        set("short", "剑冢");
        set("long",@LONG
只见许多石块堆著一个大坟。这坟（fen）背向山谷，俯仰空阔。 坟
旁立有一大石（stone），上刻：「剑冢」二字。站在此处， 山风刺骨，
俯瞰莲花峰（lianhua）下景色壮丽无比。
LONG);
        set("outdoors", "huashan");

        set("item_desc", ([
                "stone"          : (: look_stone :),
                "fen"            : (: look_fen :),
                "fir sword"      : NOR + GRN "你拿起这柄剑，只觉着手轻飘飘的浑似无物，原来是柄竹剑。但见剑下的石刻道：\n"
                                   HIM "「四十岁後，不滞於物，草木竹石均可为剑。自此精修，渐进於无剑胜有剑之境。 」 \n" NOR,
                "sec sword"      : (: look_sword2 :),
                "thi sword"      : (: look_sword3 :), 
                "piece"          : HIW "你拿起长条石片 ，见石片下的青石上也刻有两行小字：\n"
                                   HIM "「紫薇软剑，三十岁前所用，误伤义不祥，乃弃之深谷。」 \n" NOR,
                "sec piece"      : HIW "细看石刻，见两行小字道：「重剑无锋，大巧不工。四十岁前恃之横行天下。」 \n" NOR,
                "thi piece"      : HIW "石上刻有两行小字：「凌厉刚猛，无坚不摧，弱冠前以之与河朔群雄争锋。」 \n" NOR,
                "big stone"      : NOR + WHT "一堆石头，似乎独孤求败所遗留之剑就在下面。\n" NOR,
                "lianhua"        : HIG "景色壮丽无比，可以从这里（jump lianhua）到莲花峰。\n" NOR,
 
        ]));

        setup();
}

void init()
{
        add_action("do_move", "move");
        add_action("do_pick", "pick");
        add_action("do_jump", "jump");
}

string look_stone()
{
        string msg;

        msg = NOR + WHT "只见大石上「剑冢」两个大字之旁，尚有两行字体较小的石刻：\n"
              HIR "「剑魔独孤求败既无敌於天下，乃埋剑於斯。呜呼！群雄束手，长剑空"
              "利，不亦悲夫！」 \n" NOR;

        return msg;
}

string look_fen()
{
        object me = this_player();
        object ob, noname, xuantie;
        string msg;
        
        if (! ob = find_object(__FILE__));
                 ob = load_object(__FILE__);
        
        if (! ob->query_temp("moved"))
                 return NOR + WHT "想必这就是剑魔独孤求败埋剑的地方，上面堆满了大石（big stone）。\n" NOR;
        
        if (! noname = find_object(NONAME));
                 noname = load_object(NONAME);

        if (! xuantie = find_object(XUANTIE));
                 xuantie = load_object(XUANTIE);
        
        // 第一（fir sword）是竹剑，第二是玄铁剑，最右是无名剑
        if (! environment(noname) && ! environment(xuantie))
                 msg = NOR + WHT "剑冢下露出并列着的三柄长剑。\n在第一（fir sword）、第二（sec sword）把剑之"
                       "间，另有一块长条石片（piece）。\n三柄剑和石片并列於一块大青石之上。\n" NOR;

        else if (! environment(noname) && environment(xuantie))
                 msg = NOR + WHT "剑冢下露出并列着的两柄长剑，在第一（fir sword）的右边"
                       "另有一块长条石片（piece）。\n而第二把剑已不知去向，只留下石片（se"
                       "c piece）上所刻的小字。\n两柄剑和石片并列於一块大青石之上。 \n" NOR;

        else if (environment(noname) && ! environment(xuantie))
                 msg = NOR + WHT "剑冢下露出并列着的两柄长剑。\n在第一（fir sword）、第二（sec sword）把剑之"
                       "间，另有一块长条石片（piece）。\n而最右首的剑已不知去向，只留下"
                       "石片（thi piece）上所刻的小字。\n两柄剑和石片并列於一块大青石之上。 \n" NOR;

        else     msg = NOR + WHT "剑冢下露出并列着的一柄长剑，在第一（fir sword）的右边"
                       "另有一块长条石片（piece）。\n其余的两把剑已不知去向，只留下"
                       "石片（sec piece、thi piece）上所刻的小字。\n这柄剑和石片并列"
                       "於一块大青石之上。 \n" NOR;

        return msg;
}

string look_sword2()
{
        object ob, xuantie;
        string msg;
        
        if (! ob = find_object(__FILE__));
                 ob = load_object(__FILE__);
        
        if (! ob->query_temp("moved"))
                 return "你要看什么？\n";
        
        if (! xuantie = find_object(XUANTIE));
                 xuantie = load_object(XUANTIE);

        if (environment(xuantie))
                 return "你要看什么？\n";

        msg = NOR + WHT "一把黑黝黝的铁剑，下面有一个石片（sec piece）。\n" NOR;

        if (objectp(xuantie))destruct(xuantie);
      
        return msg;
               
}

string look_sword3()
{
        object ob, noname;
        string msg;
        
        if (! ob = find_object(__FILE__));
                 ob = load_object(__FILE__);
        
        if (! ob->query_temp("moved"))
                 return "你要看什么？\n";
        
        if (! noname = find_object(NONAME));
                 noname = load_object(NONAME);

        if (environment(noname))
                 return "你要看什么？\n";

        msg = HIC "只见此剑长约四尺，青光闪闪，似是利器。下面有一个石片（thi piece）。\n" NOR;

        if (objectp(noname))destruct(noname);
      
        return msg;
               
}

int do_move(string arg)
{
        object me = this_player();
        object ob;

        if (me->is_busy() || me->is_fighting())
              return notify_fail("你忙完了再说吧！\n");

        if (! arg || arg != "big stone")
              return notify_fail("你要干什么？\n");
        
        if (! ob = find_object(__FILE__));
                 ob = load_object(__FILE__);

        if (ob->query_temp("moved"))
                 return notify_fail("上面的石头已经被移开了！\n");
 
                
        message_vision(HIG "$N" HIG "用力将剑冢上面的石头一块块地移开 ……\n", me);

        ob->set_temp("moved", 1);
 
        me->start_busy(1);
      
        return 1;
}

int do_pick(string arg)
{
        object me = this_player();
        object ob, noname, xuantie;

        if (me->is_busy() || me->is_fighting())
              return notify_fail("你忙完了再说吧！\n");

        if (! arg || 
            arg != "fir sword" &&
            arg != "sec sword" &&
            arg != "thi sword")
              return notify_fail("你要取什么？\n");
        
        if (! ob = find_object(__FILE__));
                 ob = load_object(__FILE__);

        if (! noname = find_object(NONAME));
                 noname = load_object(NONAME);

        if (! xuantie = find_object(XUANTIE));
                 xuantie = load_object(XUANTIE);

        if (! ob->query_temp("moved"))
                 return notify_fail("你要干什么？\n");

        switch(arg)
        {
              case "fir sword" : 
                     return notify_fail(HIC "你将竹剑拿起来看了看，觉得普通之极，便又放了回去。\n" NOR);

              case "sec sword":
                     if (environment(xuantie))
                           return notify_fail("上面的东西已被人拿走了！\n");

                     if (me->query("str") < 34)
                           return notify_fail("你将铁剑只提起数尺，呛的一声，竟然脱手掉下"
                                              "，在石上一碰，火花四溅，不禁吓了一跳。\n");

                     message_vision(HIM "$N" HIM "将玄铁重剑提了起来。\n" NOR, me);

                     xuantie->move(me);

                     return 1;

              case "thi sword":
                     if (environment(noname))
                           return notify_fail("上面的东西已被人拿走了！\n");
              
                     message_vision(HIM "$N" HIM "将无名剑提了起来。\n" NOR, me);

                     noname->move(me);

                     return 1;
        }
         
        me->start_busy(1);
      
        return 1;
}

int do_jump(string arg)
{
        object me = this_player();

        if (! arg || arg != "lianhua")
             return notify_fail("你要往哪儿跳？\n");

        if (me->query("qi") < 300)
             return notify_fail("你力气不加。\n");

        if (me->is_busy() || me->is_fighting())
             return notify_fail("等你忙完了再说。\n");

        me->start_busy(1 + random(3));

        message_sort(HIG "\n$N" HIG "纵身跳下 ……\n" NOR, me);

       me->move(__DIR__"lianhua");
      
       return 1;
}
