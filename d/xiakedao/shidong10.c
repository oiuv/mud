// shidong10.c 石洞

inherit ROOM;

#include <ansi.h>

string look_bi();

void create()
{
        set("short", "石洞");
        set("long", @LONG
这是一个石室，隐约可以感觉到四周是坚硬的石壁(bi)，
石洞内干干净净，一尘不染。
LONG );
        set("exits", ([
               "east" : __DIR__"shidong9",
               "out"  : __DIR__"dating",
        ]));

        set("objects", ([
               __DIR__"obj/baihongjian" : 1,
        ]));

        set("item_desc",([
	        "bi"  : (: look_bi :),
        ]));

        setup();
}

void init()
{       
        add_action("do_canwu", "canwu");
} 

string look_bi()
{
       object me = this_player();
       string msg;
       
       if (me->query_skill("literate", 1)
           || me->query("learned_literate"))
       {
           msg = HIC "\n你走到石壁前，仔细观看石壁上的内容，发现石壁布满\n"
                 "蝌蚪形状的文字。你仔细推敲这些文字却一无所获。\n" NOR;                    
       }
       else   
       {
           msg = HIW "\n你走到石壁前，仔细观看石壁上的内容，发现石壁布满\n"
                 "蝌蚪形状的文字，由于你从未读过书，所以你并没有在\n"
                 "意那些文字。你猛然看到文字下面有很多图画，是用利\n"
                 "器所刻。但见画中人物神情怪异，手舞足蹈，似乎是什\n"
                 "么厉害的神功绝技。你禁不住想……\n" NOR;
       }

       return msg;
}

int do_canwu(string msg)
{
    object me = this_player();

    string where, witch;
    
    if (! msg)return notify_fail("什么？\n");

    if (sscanf(msg, "%s from %s", witch, where) != 2)
          return notify_fail("干什么？\n");

    if (me->is_busy())
          return notify_fail("你现在正忙着呢。\n");

    if (me->is_fighting())
          return notify_fail("你在战斗哦？！小心，来了！！！\n");

     if (witch != "太玄激劲"
        && witch != "乘风破浪"
        && witch != "白首太玄经"
        && witch != "混天一气")
          return notify_fail("你想参悟什么？\n");

    if (where != "bi")
          return notify_fail("这里没什么给你参悟的啊！\n");

    if (me->query_skill("literate", 1)
        || me->query("learned_literate"))
          return notify_fail("你对着石壁想了半天也没发现什么！\n");

    if ((int)me->query_skill("force", 1) < 240)
          return notify_fail("你的内功修为不够，无法贯通石壁上的绝学！\n");

    if ((int)me->query("max_neili") < 6000)
          return notify_fail("你的内力修为不足，无法贯通石壁上的绝学！\n");

    if ((int)me->query("jing") < 100)
          return notify_fail("你的精力无法集中，无法领悟石壁上的绝学！\n");

    if (me->query_skill("taixuan-gong", 1) < 200)
          return notify_fail("你对太玄功所知实在有限，无法领悟石壁上的绝学！\n");

    if (witch == "混天一气" 
        && me->query("can_perform/taixuan-gong/hun"))
          return notify_fail("这项绝学你不是已经会了吗？\n");

    else 
    if (witch == "太玄激劲" 
        && me->query("can_perform/taixuan-gong/xuan"))
          return notify_fail("这项绝学你不是已经会了吗？\n");

     else  
    if (witch == "白首太玄经" 
        && me->query("can_perform/taixuan-gong/jing"))
          return notify_fail("这项绝学你不是已经会了吗？\n");

    else 
    if (witch == "乘风破浪" 
        && me->query("can_perform/taixuan-gong/po"))
          return notify_fail("这项绝学你不是已经会了吗？\n"); 

    me->receive_damage("jing", 95);

    me->start_busy(2 + random(4));

    if (random(13) == 1 && witch == "太玄激劲")
    {
        me->add("taixuan_perform/xuan/count", 1);

        if (me->query("taixuan_perform/xuan/count") >= 60)
        {
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
            write(HIC "你终于通晓了绝学「太玄激劲」。\n" NOR);

            me->set("can_perform/taixuan-gong/xuan", 1);
            me->delete("taixuan_perform/xuan/count");

            if (me->can_improve_skill("force"))
                    me->improve_skill("force", 1500000);
            if (me->can_improve_skill("taixuan-gong"))
                    me->improve_skill("taixuan-gong", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);

            return 1;
        }

        write(HIC "你对「太玄激劲」这招有了新的认识，但是仍有许多不解之处。\n" NOR);
        me->start_busy(2 + random(4));
        return 1;   
    }

    else 
    if (random(4) == 1 && witch == "混天一气")
    {
        me->add("taixuan_perform/hun/count", 1);

        if (me->query("taixuan_perform/hun/count") >= 30)
        {
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
            write(HIC "你终于通晓了绝学「混天一气」。\n" NOR);

            me->set("can_perform/taixuan-gong/hun", 1);
            me->delete("taixuan_perform/hun/count");

            if (me->can_improve_skill("force"))
                    me->improve_skill("force", 1500000);
            if (me->can_improve_skill("taixuan-gong"))
                    me->improve_skill("taixuan-gong", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);

            return 1;
        }

        write(HIC "你对「混天一气」这招有了新的认识，但是仍有许多不解之处。\n" NOR);
        me->start_busy(2 + random(4));
        return 1;   
    }

    else 
    if (random(12) == 1 && witch == "乘风破浪")
    {
        me->add("taixuan_perform/po/count", 1);

        if (me->query("taixuan_perform/po/count") >= 70)
        {
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
            write(HIC "你终于通晓了绝学「乘风破浪」。\n" NOR);

            me->set("can_perform/taixuan-gong/po", 1);
            me->delete("taixuan_perform/po/count");

            if (me->can_improve_skill("force"))
                    me->improve_skill("force", 1500000);
            if (me->can_improve_skill("taixuan-gong"))
                    me->improve_skill("taixuan-gong", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);

            return 1;
        }
       write(HIC "你对「乘风破浪」这招有了新的认识，但是仍有许多不解之处。\n" NOR); 
       me->start_busy(2 + random(4)); 
       return 1;  
    } 

    else  
    if (random(20) == 1 && witch == "白首太玄经")  
    {
        me->add("taixuan_perform/bai/count", 1); 

        if (me->query("taixuan_perform/bai/count") >= 100) 
        { 
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR); 
            write(HIC "你终于通晓了绝学「白首太玄经」。\n" NOR); 

            me->set("can_perform/taixuan-gong/jing", 1); 
            me->delete("taixuan_perform/bai/count"); 

            if (me->can_improve_skill("force"))
                    me->improve_skill("force", 1500000);
            if (me->can_improve_skill("taixuan-gong"))
                    me->improve_skill("taixuan-gong", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);
            return 1; 
        } 

        write(HIC "你对「白首太玄经」这招有了新的认识，但是仍有许多不解之处。\n" NOR); 
        me->start_busy(4 + random(4)); 
            return 1; 
        } 

    else return notify_fail("你试图从石壁上研究有关「" + witch + "」的内容，但却没什么效果！\n");

}
int valid_leave(object me,string dir)
{
        if (dir == "out")
                tell_object(me,"你走出了石洞，神秘地出现在大厅之中。\n");

        return ::valid_leave(me,dir);
}
