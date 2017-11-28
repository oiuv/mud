inherit ROOM;
#include <ansi.h>

void create()
{
    set("short", "马房");
    set("long", @LONG
这里是郭府内的马房，马房里面臭烘烘的，还养了几十匹
马。你看过去，马身上都很脏了，早该洗洗了，马房的旁边有
个水池，里面有些清水。
LONG);
        set("no_fight", 1);
        set("exits", ([
                "east" : __DIR__"guofu_houyuan2",
        ]));
        set("objects", ([
           	__DIR__"npc/guanjia3" : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_sao", "sao");        
}

int do_sao(string arg)
{     
        object me, weapon;
        int costj, costq;

        me = this_player();

        if (me->query_temp("mark/扫完了"))
            	return notify_fail(CYN "马房管事嚷嚷道：喂喂喂，让你去覆命，还留"
                                   "在这里干嘛？\n" NOR);

        if (me->query_temp("job_name") != "打扫马房") 
            	return notify_fail(CYN "马房管事对你喝道：没事你瞎折腾什么？\n" NOR);

        if (me->is_busy())
		return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
		return notify_fail("你正在战斗中，无法专心干活！\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || weapon->query("id") != "sao zhou")
                return notify_fail(CYN "马房管事讥笑道：你是想用什么来打扫呀，用"
                                   "手吗？\n" NOR);

        if (! arg || arg != "mafang")
		return notify_fail("你要打扫什么？\n");

        costj = random((int)me->query("con") / 3) + 1;
        costq = random((int)me->query("str") / 3) + 1;

        if ((int)me->query("jing") < costj
	   || (int)me->query("qi") < costq)
	{
             	message_vision(HIR "\n$N" HIR "脚一滑，结果不小心滑倒在粪堆里，吃"
                               "了一大口马粪。\n" NOR, me);
             	me->add("food", 100);
             	me->unconcious();
             	return 1;
        }
        
        me->receive_damage("jing", costj);
        me->receive_damage("qi", costq);       
        me->start_busy(1 + random(2));

        if (! (int)me->query_condition("wuguan_job")
           && (int)me->query_temp("mark/扫") > 10 + random(10)
           && present("mafang guanshi", environment(me)))
	{
              	me->set_temp("mark/扫完了", 1);
              	message_vision(CYN "\n马房管事对$N" CYN "说：干的不错，好了，你可"
                               "以去向耶律大爷覆命(" HIY "task ok" NOR + CYN ")了"
                               "。\n" NOR, me);
              	return 1;
        }

        message_vision(HIM "$N" HIM "开始打扫马房，臭味使你不由闭紧了呼吸。\n" NOR, me);
        me->add_temp("mark/扫", 1);
		//技能上限由50↑70，提升速度增加3倍
        if ((int)me->query_skill("claw", 1) < 75
           && (int)me->query_skill("club", 1) < 75
           && me->can_improve_skill("claw")
           && me->can_improve_skill("club"))
        {
                write(HIC "你在扫地过程中对爪法及棍法有些体会。\n" NOR);
              //me->improve_skill("claw", (int)(me->query("int") / 6));
                me->improve_skill("claw", (int)(me->query("int") / 2));
              //me->improve_skill("club", (int)(me->query("int") / 6));
                me->improve_skill("club", (int)(me->query("int") / 2));
        }
        return 1;
}
