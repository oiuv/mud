// tieqin-yin.c 铁琴音

#include <ansi.h>

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "tanqin-jifa"; }

int valid_learn(object me)
{
        if (me->query_skill("tanqin-jifa", 1) < 100)
                return notify_fail("你的弹琴技法水平不够，还是先练好再说吧！\n");

        if (me->query_skill("tanqin-jifa", 1) < me->query_skill("tieqin-yin", 1))
                return notify_fail("你的弹琴技法水平有限，无法领会更精妙的铁琴音。\n");

        return 1;
}

int practice_skill(object me)
{
        object ob;

        if (! objectp(ob = me->query_temp("handing")) ||
            ! ob->valid_as_qin())
                return notify_fail("你不拿琴在手上，怎么练习？\n");

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

        lvl = me->query_skill("tanqin-jifa", 1) / 2 +
              me->query_skill("tieqin-yin", 1);

        if (environment(me)->query("no_fight")
           || environment(me)->query("skybook")
           || lvl < 150)
                return;

        lvl = lvl / 5 + me->query_skill("force");
        lvl /= 2;

        obs = all_inventory(environment(me));
        for (i = 0; i < sizeof(obs); i++)
        {
                if (! obs[i]->is_character() || obs[i] == me || ! living(obs[i]))
                        continue;

                // 被死亡保护的玩家不受伤害
                if ((int)obs[i]->query_condition("die_guard"))
                        continue;

                if (me->query_skill("tieqin-yin") * 2 / 3 <
                    obs[i]->query_skill("tieqin-yin"))
                        continue;

                if (lvl + random(lvl) < obs[i]->query_skill("force"))
                {
                        tell_object(obs[i], HIM "你听了心中不禁微微一动，发现这"
                                            "曲子颇有奥妙之处。\n" NOR);
                        continue;
                }

                damage = me->query("max_neili") - obs[i]->query("max_neili");
                if (damage < 500)
                {
                        tell_object(obs[i], HIM "你忽然觉得一阵迷乱，连忙运了一"
                                            "口气，才清醒过来。\n" NOR);
                        continue;
                }

                damage /= 10;
                me->want_kill(obs[i]);
                me->fight_ob(obs[i]);
                obs[i]->kill_ob(me);
                obs[i]->receive_damage("jing", damage * 2 / 3, me);
                obs[i]->receive_wound("jing", damage * 2 / 9, me);
                
                tell_object(obs[i], HIM "你听得心神不定，只感呼吸不畅，鼓膜受震"
                                    "，几欲晕倒。\n" NOR);
        }
}
