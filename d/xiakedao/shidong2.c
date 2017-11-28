// Room: /xiakedao/shidong2.c

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
                "east" : __DIR__"shidong3",
                "west" : __FILE__,
                "south" : __FILE__,
                "north" : __DIR__"yingbin",
        ]));

        set("item_desc",([
	        "bi"  : (: look_bi :),
        ]));
        setup();
}

void init()
{       
        add_action("do_think", "think");
}

string look_bi()
{
       object me = this_player();
       string msg;
       
       if (me->query_skill("literate", 1)
           || me->query("learned_literate"))
       {
           msg = HIW "\n你走到石壁前，仔细观看石壁上的内容，发现石壁布满\n"
                 "蝌蚪形状的文字。你仔细推敲这些文字却一无所获。\n" NOR;                    
       }
       else   
       {
           msg = HIW "\n你走到石壁前，仔细观看石壁上的内容，发现石壁布满\n"
                 "蝌蚪形状的文字，由于你从未读过书，所以你并没有在\n"
                 "意那些文字。你猛然看到文字下面有很多图画，是用利\n"
                 "器所刻，上面画着各式各样的人物，却都全身裸露，但\n"
                 "可见其全身各处经络及经络走向。你越想越离奇，感觉\n"
                 "全身各处经脉微微颤动，禁不住自己想要跟着图中所刻\n"
                 "的经络走向学(think)起来。\n" NOR;
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
        if ((int)me->query_skill("force", 1) < 200)
                return notify_fail("你的基本内功火候不够，无法领悟石壁"
                                   "上的武功。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，无法学习石壁上的武功。\n");

        if ((int)me->query("jing") < 85)
                return notify_fail("你现在精神不济，过于疲倦，还是休息"
                                   "一会吧。\n");

        if ((int)me->query_skill("taixuan-gong", 1) >= 60)
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
