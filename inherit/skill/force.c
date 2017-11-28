// force.c

#include <ansi.h>

inherit SKILL;

int valid_learn(object me)
{
        if ((int)me->query_skill("force", 1) < 10)
                return notify_fail("你的基本内功火候不够，不能学习特殊内功。\n");

        return 1;
}

// hit effect called by combatd
mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int damage;
        int me_fac;
        int victim_fac;
        int f;
        int m_lvl;
        int v_lvl;
        string skill;
        mixed result;

        skill = victim->query_skill_mapped("force");
        if (stringp(skill))
        {
                if (result = SKILL_D(skill)->valid_damage(me, victim, damage_bonus))
                        return result;
        }

        me_fac = (int)me->query("neili");
        if (me_fac > (int)me->query("max_neili"))
                me_fac = (int)me->query("max_neili");

        victim_fac = (int)victim->query("neili");
        if (victim_fac > (int)victim->query("max_neili"))
                victim_fac = (int)victim->query("max_neili");

        if ((int)me->query("combat_exp") < (int)victim->query("combat_exp") * 20)
                me->add("neili", -factor);

        damage = me_fac / 20 + factor - victim_fac / 24;

        if (damage < 0)
        {
                v_lvl = victim->query_skill("force");
                m_lvl = me->query_skill("force");
                if (! me->query_temp("weapon") &&
                    m_lvl + random(m_lvl / 3) < v_lvl)
                {
                        result = ([ "damage" : damage * 2 ]);
                        damage = -damage;
                        me->receive_damage("qi", damage * 4, victim);
                        me->receive_wound("qi", damage * 4, victim);
                        if (damage < 10)
                                result += ([ "msg" : HIY "$N" HIY "受到$n"
                                                     HIY "的内力反震，闷哼一声。\n" NOR ]);
                        else if (damage < 20)
                                result += ([ "msg" : YEL "$N" YEL "被$n"
                                                     YEL "以内力反震，「嘿」地一声退了两步。\n" NOR ]);
                        else if (damage < 40)
                                result += ([ "msg" : HIC "$N" HIC "被$n"
                                                     HIC "以内力一震，胸口有如受到一记重锤，连退了五六步！\n" NOR ]);
                        else if (damage < 80)
                                result += ([ "msg" : HIR "$N" HIR "被$n"
                                                     HIR "的内力一震，眼前一黑，身子向后飞出丈许！\n" NOR ]);
                        else
                                result += ([ "msg" : RED "$N" RED "被$n"
                                                     RED "的内力一震，只觉浑身经脉欲断，气血倒流，几乎晕了过去。\n" NOR ]);
                        return result;
                }

                return damage;
        }

        damage -= victim->query_temp("apply/armor_vs_force");
        if (damage_bonus + damage < 0)
                return - damage_bonus;
        if ((f = random(me->query_skill("force"))) < damage)
                return f;

        return damage;
}

// can I exercise force?
int do_effect(object me)
{
        int lvl;
        int n;
        mapping skmap;
        string sk;

        if (! userp(me))
                // only user does effect
                return 0;

        n = 0;
        skmap = me->query_skills();
        if (! skmap || ! sizeof(skmap))
                return 0;

        foreach (sk in keys(skmap))
        {
                if (! SKILL_D(sk)->is_shaolin_skill())
                        continue;
                n += skmap[sk] * skmap[sk] / 100 * skmap[sk];
        }

        if (n < 10000)
                return 0;

        lvl = me->query_skill("buddhism", 1);
        lvl *= lvl * lvl / 25;

       // if ((me->query("reborn") && (int)me->query_skill("buddhism", 1) > 199) || (me->query("family/family_name") == "少林派" && (int)me->query_skill("buddhism", 1) > 299) || (int)me->query_skill("buddhism", 1) > 399)
       if ((me->query("reborn") && ((int)me->query_skill("buddhism", 1) > 299 || (me->query("family/family_name") == "少林派" && (int)me->query_skill("buddhism", 1) > 199))) ||
       	 (me->query("family/family_name") == "少林派" && (int)me->query_skill("buddhism", 1) > 399) || (int)me->query_skill("buddhism", 1) > 499)
        { 
                n = 1; 
        } else 
        { 
                lvl += lvl / 2; 
        } 


        if (lvl < n * 9 / 10)
        {
                write(RED "你只觉得心中一阵绞痛，完全无法控制内息，忍"
                      "不住大叫一声，黄豆般的汗珠涔涔而下。\n" NOR);
                message("vision", RED + me->name() + RED "忽然大叫一声，"
                        "黄豆般的汗珠涔涔而下，看样子痛苦之极。\n" NOR,
                        environment(me), ({ me }));
                me->receive_damage("jing", 200 + random(200));
                me->receive_damage("qi", 400 + random(400));
                return 1;
        } else
        if (lvl < n)
        {
                write(HIR "你只觉得内息一阵紊乱，四肢百骸顿时冰冷，手"
                      "足眉发都不由自主的颤动。\n" NOR);
                message("vision", HIR + me->name() + RED "浑身都不住的"
                        "抖动，连眉发都在微微颤动。\n" NOR,
                        environment(me), ({ me }));
                me->receive_damage("jing", 100 + random(100));
                me->receive_damage("qi", 200 + random(200));
                return 1;
        } else
        if (lvl < n * 11 / 10)
        {
                write(HIY "你觉得有点心烦意乱，丹田中热气如"
                      "焚，内力运行有些艰难。\n" NOR);
        } else
        if (lvl < n * 13 / 10)
        {
                write(HIC "你心中有点异样的感觉。\n" NOR);
        }
        return 0;
}


