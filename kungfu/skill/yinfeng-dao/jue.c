#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define SHA "「" HIR "绝杀" NOR "」"

string final(object me, object targer, int lvl);

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int damage;
        int lvl;

        if (userp(me) && ! me->query("can_perform/yinfeng-dao/jue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHA "只能在战斗中使用。\n");

        if ((int)me->query_skill("yinfeng-dao", 1) < 140)
                return notify_fail("你的阴风刀还不够娴熟，无法施展" SHA "绝技！\n");

        if ((int)me->query_skill("force") < 260)
                return notify_fail("你内功火候不够，难以施展" SHA "绝技！\n");

        if ((int)me->query("max_neili") < 2400)
                return notify_fail("你的真气不够，无法施展" SHA "绝技！！\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你的真气不够，无法施展" SHA "绝技！！\n");

        if (me->query_skill_mapped("strike") != "yinfeng-dao") 
                return notify_fail("你没有激发阴风刀，无法使用" SHA "绝技！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "使出阴风刀「" HIR "绝 杀" HIW"」绝技，掌劲幻出一片片切骨寒"
              "气如飓风般裹向$n全身！\n" NOR;
 
        lvl = me->query_skill("yinfeng-dao", 1);

        ap = me->query_skill("strike") + me->query_skill("force");
        dp = target->query_skill("parry") + me->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70,
                                           (: final, me, target, lvl :));
              
                me->add("neili", -350);
                me->start_busy(1);
        } else
        {
                msg += CYN "可是$n急忙退闪，连消带打躲开了这一击。\n" NOR;
                me->start_busy(3);
                me->add("neili", -150);
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int lvl)
{
       target->affect_by("yinfeng_dao",
                       ([ "level"    : me->query("jiali") + random(me->query("jiali")),
                          "id"       : me->query("id"),
                          "duration" : lvl / 50 + random(lvl / 20) ]));

       return HIR "结果只听$n一声惨嚎，全身几处要穴同时被阴风寒劲砍中，疼若刮骨，鲜血狂泄而出！\n" NOR;
}

