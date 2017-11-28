#include <ansi.h>
inherit ROOM;

void create()
{
    	set("short", "菜地");
        set("long", @LONG
这里是块菜地，菜地旁有几口大缸，里面盛满了水，可是
菜地看起来都干裂了，几棵菜蔫蔫的长着，看样子是因为缺水
太多的缘故吧。
LONG);
        set("no_fight", 1);
        set("exits", ([
            	"east" : __DIR__"guofu_houyuan3",
        ]));
        set("objects", ([
           	__DIR__"npc/guanjia6" : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_jiao", "jiao");
}

int do_jiao(string arg)
{      
        object me, weapon;
        int costj, costq;

        me = this_player();

        if (me->query_temp("mark/浇完了"))
            	return notify_fail(CYN "菜园管事嚷嚷道：喂喂喂，让你去覆命，还留"
                                   "在这里干嘛？\n" NOR);

        if (me->query_temp("job_name") != "浇菜地") 
            	return notify_fail(CYN "菜园管事对你喝道：没事你瞎折腾什么？\n" NOR);

        if (me->is_busy())
		return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
		return notify_fail("你正在战斗中，无法专心干活！\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || weapon->query("id") != "shui piao")
                return notify_fail(CYN "菜园管事讥笑道：你想用什么来舀水浇呀，用"
                                   "手吗？\n" NOR);

        if (! arg || arg != "shui" )
		return notify_fail("你要浇什么？\n");

        costj = random((int)me->query("con") / 3) + 1;
        costq = random((int)me->query("str") / 3) + 1;

        if ((int)me->query("jing") < costj
	   || (int)me->query("qi") < costq)
	{
              	message_vision(HIR "\n$N" HIR "弯腰到大缸里舀水，结果一失足栽进了缸"
                               "里。\n" NOR, me);
              	me->set("water", 600);
              	me->unconcious();
              	return 1;
        }

        me->receive_damage("jing", costj);
        me->receive_damage("qi", costq);
        me->start_busy(1 + random(2));

        if (! (int)me->query_condition("wuguan_job")
           && (int)me->query_temp("mark/浇") > 10 + (random(10))
           && present("caiyuan guanshi", environment(me)))
	{
                me->set_temp("mark/浇完了", 1);
                message_vision(CYN "\n菜园管事对$N" CYN "说：干的不错，好了，你可"
                               "以去向耶律大爷覆命(" HIY "task ok" NOR + CYN ")了"
                               "。\n" NOR, me);
                return 1;
        }

        message_vision(HIG "$N" HIG "用瓢从缸里舀起水，在菜地里浇起水来。\n" NOR, me);
        me->add_temp("mark/浇", 1);
		//技能上限由50↑70，提升速度增加3倍
        if ((int)me->query_skill("whip", 1) < 75
           && (int)me->query_skill("finger", 1) < 75
           && me->can_improve_skill("whip")
           && me->can_improve_skill("finger"))
	{
                write(HIC "你在浇水过程中对鞭法及指法有些体会。\n" NOR);
                me->improve_skill("whip", (int)(me->query("int") / 2));
                me->improve_skill("finger", (int)(me->query("int") / 2));
        }
        return 1;
}
