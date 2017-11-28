#include <ansi.h>

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "chuixiao-jifa"; }

int valid_learn(object me)
{
        if (me->query_skill("chuixiao-jifa", 1) < 100)
                return notify_fail("你的吹萧技法水平不够，还是先练好再说吧！\n");

        if (me->query_skill("chuixiao-jifa", 1) < me->query_skill("bihai-chaosheng", 1))
                return notify_fail("你的吹萧技法水平有限，无法领会更精妙的碧海潮生曲。\n");

        return 1;
}

int practice_skill(object me)
{
        object ob;

        if (! objectp(ob = me->query_temp("handing")) ||
            ! ob->valid_as_xiao())
                return notify_fail("不拿根箫在手上，你怎么练习？\n");

        if ((int)me->query("jing") < 80)
                return notify_fail("你的精神不够好，没法练习了。\n");

        if ((int)me->query("qi") < 30)
                return notify_fail("你现在口干舌燥，实在是太累了。\n");

        me->receive_damage("jing", 45);
        me->receive_damage("qi", 20);

        return 1;
}

void do_effect(object me)
{
        object *obs;
        int lvl;
        int i;
        int damage;

        lvl = me->query_skill("chuixiao-jifa", 1) / 2 +
              me->query_skill("bihai-chaosheng", 1);

        if (environment(me)->query("no_fight")
           || environment(me)->query("skybook")
           || lvl < 150)
                return;

        lvl = lvl / 5 + me->query_skill("force");
        lvl /= 2;

        // special effort
        obs = all_inventory(environment(me));
        for (i = 0; i < sizeof(obs); i++)
        {
                if (! obs[i]->is_character() || obs[i] == me || ! living(obs[i]))
                        continue;

                // 被死亡保护的玩家不受伤害
                if ((int)obs[i]->query_condition("die_guard"))
                        continue;

                if (me->query_skill("bihai-chaosheng") * 2 / 3 <
                    obs[i]->query_skill("bihai-chaosheng"))
                        continue;

                if (lvl + random(lvl) < obs[i]->query_skill("force"))
                {
                        tell_object(obs[i], HIM "你听了心中不禁微微一动，发现这曲子颇有奥妙之处。\n" NOR);
                        continue;
                }

                damage = me->query("max_neili") - obs[i]->query("max_neili");
                if (damage < 500)
                {
                        tell_object(obs[i], HIM "你忽然觉得一阵迷乱，连忙运了一口气，才清醒过来。\n" NOR);
                        continue;
                }

                damage /= 10;
                me->want_kill(obs[i]);
                me->fight_ob(obs[i]);
                obs[i]->kill_ob(me);
                obs[i]->receive_damage("jing", damage, me);
                obs[i]->receive_wound("jing", damage / 3, me);
                
                tell_object(obs[i], HIM "你只觉得心迷神乱，忍不住要翩翩起舞……\n" NOR);
        }
}
