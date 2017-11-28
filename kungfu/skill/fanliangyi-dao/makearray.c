// 双剑和壁

#include <ansi.h>
#include <skill.h>
#include <weapon.h>
#include <combat.h>

inherit F_SSERVER;

//int valid_enable(string usage) { return usage=="array"; }

//int form_array(object leader)
int perform(object leader, object target)
{
        object *member,ob, weapon;
        int i,j,n;
        int max,min,skill;

        member = leader->query_team();
        if (sizeof(member) != 2)
                return notify_fail("反两仪刀共需两人，少一个多一个都不行。\n");

        j = sizeof (member);
        for (i = 0; i < j; i++)
        {
                ob=member[i];
                if (! ob|| ! living(ob) || ! ob->is_character())
                        return notify_fail("你想和谁同使反两仪刀？\n");

                if (ob->query_temp("array/name"))
                        return notify_fail("他已经在刀阵中了。\n");

                if (environment(leader) != environment(ob))
                        return notify_fail("人数不够两人。\n");

                if (!ob->query_skill("fanliangyi-dao",1))
                        return notify_fail(ob->name() + "还不会反两仪刀法。\n");

                if (ob->is_ghost())
                        return notify_fail("只有阳间的人才能组刀阵。\n");

                if ((int)ob->query("max_neili") < 50)
                        return notify_fail(ob->query("name")+"的内力不够。\n");

                if (! (weapon = ob->query_temp("weapon")) ||
                    (string)weapon->query("skill_type") != "blade")
                        return notify_fail(ob->query("name") + "必须拿把刀做武器。\n");

                if ((int)ob->query_skill("fanliangyi-dao",1) < 30)
                        return notify_fail(ob->query("name") + "的反两仪刀法还不够熟练。\n");

                if ((string)ob->query_skill_mapped("blade") != "fanliangyi-dao")
                        return notify_fail(ob->query("name") + "必须使用反两仪刀法。\n");
        }

//get the average array skill of the team
        n = 0;
        for (i = 0; i < j; i++)
        {
                ob = member[i];
                n += (int)ob->query_skill("fanliangyi-dao", 1);
        }
        n /= 2;

//get the difference of the array skill,
//first get the max and mix skill level of the array
        max = member[0]->query_skill("fanliangyi-dao", 1);
        min = max;
        for (i = 0; i < j; i++)
        {
                skill=member[i]->query_skill("fanliangyi-dao", 1);
                if (skill > max)
                        max = skill;
                else
                if (skill < min)
                        min = skill;
        }

//and the leader is important
        n += leader->query_skill("fanliangyi-dao", 1) * 5;
        n /= max - min + 1;
        for (i = 0; i < j; i++)
        {
                ob=member[i];
                ob->set_temp("no_quit", 1);

                ob->set_temp("array/name", "fanliangyi-dao");
                ob->set_temp("array/level", n);

                ob->add_temp("apply/attack", n);
                ob->add_temp("apply/defense", n);
                ob->add_temp("apply/damage", n);
                ob->add_temp("apply/armor", n);
        }
        message_combatd(HIG "$N" HIG "率领$n" HIG "站定两仪方位，顿时两"
                        "人之间显得浑然天成、毫无破绽。\n" NOR, leader);
        return 1;
}

int dismiss_array(object person)
{
        int i,j,n;
        object *member, ob;

        member = person->query_team();
        j = sizeof(member);
        n = person->query_temp("array/level");
        for (i = 0; i < j; i++)
        {
                ob = member[i];
                ob->delete_temp("array");
                ob->add_temp("apply/attack", -n);
                ob->add_temp("apply/damage", -n);
                ob->add_temp("apply/defense", -n);
                ob->add_temp("apply/armor", -n);
                tell_object(ob, "刀阵解散了\n");
        }
}

//if the leader kills enemy, then all members in the array kill enemy
int array_kill(object leader, object enemy)
{
        object *member, ob;
        int i, j;
        member = leader->query_team();
        j = sizeof(member);

        for (i = 0;i < j; i++)
        {
                ob = member[i];
                ob->kill_ob(enemy);
        }

        return 1;
}

int effective_level() { return 10;}

int learn_bonus()
{
        return 0;
}

int practice_bonus()
{
        return 0;
}
int black_white_ness()
{
        return 0;
}
