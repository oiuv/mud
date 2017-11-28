// Room: /xiakedao/shidong7.c

inherit ROOM;

#include <ansi.h>

string look_bi();

void create()
{
        set("short", "石洞");
        set("long", @LONG
这是一个石洞，四周点着八盏油灯，使得整个房间非常明
亮。山洞四周石壁(bi)上像是刻画着什么东西，你禁不住想看
看。
LONG );
        set("exits", ([
                "west" : __DIR__"shidong8",
                "north" : __DIR__"shidong6",
        ]));
        set("no_clean_up", 0);
        set("item_desc",([
	        "bi"  : (: look_bi :),
                "weapon": "图中人物手持刀剑，互相挥砍……\n",
        ]));
        setup();
}

void init()
{       
        add_action("do_think", "think");
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
           msg = HIC "\n你走到石壁前，仔细观看石壁上的内容，发现石壁布满\n"
                 "蝌蚪形状的文字，由于你从未读过书，所以你并没有在\n"
                 "意那些文字。你猛然看到文字下面有很多图画，是用利\n"
                 "器所刻。上面画着各式各样的人物，有的手持长剑，有\n"
                 "的手握钢刀……但见图中人物手中兵器(weapon)不尽相\n"
                 "同，每个人物的武功招式也不同，但是上面人物却仍旧\n"
                 "裸露全身，其周身经脉走向清晰无比，配合着各种招式，\n"
                 "你似乎隐隐觉得其中隐藏着太玄功更高深绝招，似乎是\n"
                 "跟武器运用有密切关系， 但你一时却也参悟(canwu)不\n"
                 "透，尽管如此，你却忍不住想跟着学(think)起来。\n" NOR;
       }

       return msg;
}

int do_think(string arg)
{
        object here, me = this_player();
        int add;

        if (! here = find_object(__DIR__"furong1"))
                here = load_object(__DIR__"furong1");

        if (me->query("special_skill/clever"))
		add = me->query_int() / 3;
        else
		add = me->query_int() / 10;

        if (! living(me) || arg != "bi")
                return notify_fail("你要参悟什么？\n");

        if (me->is_busy() || me->is_fighting())
                return notify_fail("你现在正忙着呢。\n");

        if (me->query_skill("literate", 1) || me->query("learned_literate"))
                return notify_fail("你发现石壁上的武功深奥之极，一时难以体会！\n");

        if ((int)me->query("int") < 38)
                return notify_fail("你若有所悟，然而总是有点不明白。\n");

        if ((int)me->query("dex") < 34)
                return notify_fail("你研究了半天，只觉招式始终无法随意施展。\n");
        /*if ((int)me->query("int") < 28)
                return notify_fail("你若有所悟，然而总是有点不明白。\n");

        if ((int)me->query("dex") < 28)
                return notify_fail("你研究了半天，发觉身法不够灵便，招式始终无法随意施展。\n");
        
        if ((int)me->query("con") < 28)
                return notify_fail("你研究了半天，只觉得根骨有些差，招式始终无法随意施展。\n");
        
        if ((int)me->query("str") < 28)
                return notify_fail("你研究了半天，感觉膂力有些低，招式始终无法随意施展。\n");
*/

        if ((int)me->query_skill("force", 1) < 220)
                return notify_fail("你的基本内功火候不够，无法领悟石壁"
                                   "上的武功。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，无法学习石壁上的武功。\n");

        if ((int)me->query("jing") < 85)
                return notify_fail("你现在精神不济，过于疲倦，还是休息"
                                   "一会吧。\n");

        if ((int)me->query_skill("taixuan-gong", 1) < 120)
                return notify_fail("你觉得石壁上记载的武功对你来说过于复杂，一"
                                   "时难以领悟。\n");
        
        if ((int)me->query_skill("taixuan-gong", 1) >= 180)
                return notify_fail("你觉得石壁上记载的武功对你来说太浅了，结果你"
                                   "什么也没学到。\n");

        me->receive_damage("jing", 75);

        if (me->can_improve_skill("taixuan-gong"))
                me->improve_skill("taixuan-gong", add);

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详墙上所记载的神功，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「太玄功」有了新的领悟。\n" NOR);
        return 1;
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

    if (witch != "weapon")
          return notify_fail("你想参悟什么？\n");

    if (where != "bi")
          return notify_fail("这里没什么给你参悟的啊！\n");

    if (me->query_skill("literate", 1)
        || me->query("learned_literate"))
          return notify_fail("你对着石壁想了半天也没发现什么！\n");

    if ((int)me->query_skill("force", 1) < 240)
          return notify_fail("你的内功修为不够，无法领悟如何利用"
                             "太玄功来驾御兵器！\n");

    if ((int)me->query("max_neili") < 6000)
          return notify_fail("你的内力修为不足，无法领悟如何利用"
                             "太玄功来驾御兵器！\n");

    if ((int)me->query("jing") < 100)
          return notify_fail("你的精力无法集中，无法领悟如何利用"
                             "太玄功来驾御兵器！\n");

    if (me->query_skill("taixuan-gong", 1) < 200)
          return notify_fail("你对太玄功所知实在有限，无法领悟如何利用"
                             "太玄功来驾御兵器！\n");

    if (me->query("can_learned/taixuan-gong/enable_weapon"))
          return notify_fail("石壁上的绝技你早已融会贯通，不必再参悟了。\n");

    me->receive_damage("jing", 95);

    me->start_busy(3 + random(5));

    if (random(6) == 1)
    {
        me->add("canwu_taixuan/count", 1);

        if (me->query("canwu_taixuan/count") >= 50)
        {
            write(HIM "猛然间，你一声长啸，胸中豁然贯通，再无疑虑。\n" NOR);
            write(HIC "你终于通晓了如何利用太玄功来驾御兵器。\n" NOR);

            me->set("can_learned/taixuan-gong/enable_weapon", 1);
            me->delete("canwu_taixuan/count");

            if (me->can_improve_skill("force"))
                    me->improve_skill("force", 1500000);
            if (me->can_improve_skill("taixuan-gong"))
                    me->improve_skill("taixuan-gong", 1500000);
            if (me->can_improve_skill("martial-cognize"))
                    me->improve_skill("martial-cognize", 1500000);

            return 1;
        }

        write(HIC "你对如何利用太玄功来驾御兵器有了更新的认识，但其中仍然有许"
                  "多不解之处。\n" NOR);
        return 1;   
    }
    else return notify_fail("你仔细研究石壁上所刻画的内容，但却没什么效果！\n");

}