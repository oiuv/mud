// chinese-anthem.c 义勇军进行曲

#include <ansi.h>

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "chuixiao-jifa" ||
                                        usage == "tanqin-jifa" ||
                                        usage == "guzheng-jifa"; }

int valid_learn(object me)
{
        return 1;
}

int practice_skill(object me)
{
        object ob;

        if ((int)me->query("jing") < 80)
                return notify_fail("你的精神不够好，没法练习了。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你现在实在是太累了。\n");

        me->receive_damage("jing", 50);
        me->receive_damage("qi", 50);

        return 1;
}

void do_effect(object me)
{
        object *obs;
        object attacker;
        object target;
        string msg;
        int lvl;
        int i;

        lvl = me->query_skill("chinese-anthem", 1);

        if (lvl < 200) return;
        
        // special effort
        target = 0;
        attacker = 0;
        obs = all_inventory(environment(me));
        for (i = 0; i < sizeof(obs); i++)
        {
		if (obs[i] == me || ! living(obs[i]))
			continue;

                if (obs[i]->is_fighting() && (target = obs[i]->query_competitor()) &&
                    target->query("nation") == "日本")
                {
                        attacker = obs[i];
                        break;
                }
	}

        message("vision", HIY "你听了这首慷慨激昂的国歌，不禁激"
                "动万分，说不出的兴奋。\n" NOR, obs, ({ me }));
        tell_object(me, HIY "你演奏完了这首慷慨激昂的国歌，不禁激"
                "动万分，说不出的兴奋。\n" NOR);
        if (attacker)
        {
                if (attacker->query("gender") == "女性")
                        msg = HIR "\n一时间$N" HIR "不觉是心潮澎湃，不能"
                              "自已，杏目圆睁，口中一声娇喝：“倭贼！受死吧！”\n" NOR;
                else
                        msg = HIR "\n一时间$N" HIR "不觉是热血沸腾，对$n"
                              HIR "大喝道：“东洋倭贼，还不受死？”\n" NOR;
                message_vision(msg, attacker, target);
                
                i = (lvl - 200) / 10;
                if (i > 10) i = 10;
                while (i--)
                        COMBAT_D->do_attack(attacker, target, attacker->query_temp("weapon"), 0);
        }
}
