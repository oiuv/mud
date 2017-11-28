#include <ansi.h>
inherit FORCE;

int valid_enable(string usage) 
{ 
        return usage == "force"; 
}

int valid_force(string force)
{
        return force == "suxin-jue" ||
               force == "quanzhen-xinfa";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("yunv-xinjing", 1);
        return lvl * lvl * 15 * 16 / 100 / 200;
}

int valid_learn(object me)
{
        if ( me->query("gender") == "无性")
                return notify_fail("你无根无性，阴阳难调，不能修习玉女心经。\n");

        if ((int)me->query_skill("force", 1) < 150)
                return notify_fail("你的基本内功火候还不够，不能修习玉女心经。\n");

        if ((int)me->query("int", 1) < 32)
                return notify_fail("你的先天悟性不足，无法领悟玉女心经。\n");

        if ((int)me->query("max_neili", 1) < 2000)
                return notify_fail("你的内力修为不足，难以领会玉女心经。\n");

        return ::valid_learn(me);
}

mixed hit_ob(object me, object victim)
{
        int lvl;
        int damage_bonus;
        string wn;
        object weapon;
        
        lvl = me->query_skill("yunv-xinjing", 1);

        if (lvl < 150
            || me->query("neili") < 300
            || ! objectp(weapon = me->query_temp("weapon"))
            || random(me->query_skill("force") / 6) < victim->query_con()
            || random(3) > 1
            || ! me->query("can_learn/yunv-xinjing/wall"))
                return 0;

        wn = weapon->name();

        if ((string)weapon->query("skill_type") == "sword"
            && me->query_skill_mapped("sword") == "suxin-jian")
        {
                me->add("neili", -50);
                damage_bonus = lvl / 5 + random(lvl / 5);

                victim->receive_damage("qi", damage_bonus, me);
                victim->receive_wound("qi", damage_bonus * 2 / 3, me);

                return HIW "$N" HIW "手中" + wn + HIW "忽的一振，将玉"
                       "女心经功力运于剑端，漫出无边寒意。\n" NOR;         
        } else
        if ((string)weapon->query("skill_type") == "whip"
            && me->query_skill_mapped("whip") == "yinsuo-jinling")
        {
                me->add("neili", -50);
                damage_bonus = lvl / 4 + random(lvl / 4);

                victim->receive_damage("qi", damage_bonus, me);
                victim->receive_wound("qi", damage_bonus * 2 / 3, me);

                return HIW "$N" HIW "一声娇喝，将玉女心经功力运至" + wn +
                       HIW "之上，姿势妙曼，令人肃然起敬。\n" NOR;         
        }
}

int practice_skill(object me)
{
        return notify_fail("玉女心经只能用学(learn)来增加熟练度。\n");
}

int difficult_level()
{
        return 400;
}
/*
string exert_function_file(string func)
{
        return __DIR__"yunv-xinfa/" + func;
}
*/
