#include <ansi.h>
#include <combat.h>

#define FENG "「" HIR "神笔封穴" NOR "」"

inherit F_SSERVER;
 
int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/shigu-bifa/feng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(FENG "只能对战斗中的对手使用。\n");

        weapon = me->query_temp("weapon");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所使用的武器不对，难以施展" FENG "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        skill = me->query_skill("shigu-bifa", 1);

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，难以施展" FENG "。\n");

        if (skill < 100)
                return notify_fail("你的石鼓打穴笔法修为有限，难以施展" FENG "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" FENG "。\n");

        if (me->query_skill_mapped("dagger") != "shigu-bifa")
                return notify_fail("你没有激发石鼓打穴笔法，难以施展" FENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "飞身一跃而起，贴至$n" HIR "跟前，手中" +
              weapon->name() + HIR "大起大落，气势恢弘，幻出一道闪电"
              "直射$n" HIR "要穴！\n" NOR;
 
        ap = me->query_skill("dagger");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -200);
                damage = 100 + ap / 5 + random(ap / 5);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$p" HIR "微微一楞，只觉胸口一麻，"
                                           "已被$N" HIR "点中要穴，整个上半身顿时"
                                           "瘫软无力，缓缓瘫倒。\n" NOR);
                me->start_busy(1);
                if (ap / 3 + random(ap) > dp && ! target->is_busy())
                        target->start_busy(ap / 25 + 2);
        } else
        {
                msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的招式，巧妙的一一拆解，没露半点"
                       "破绽！\n" NOR;
                me->add("neili", -50);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
