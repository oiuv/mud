#include <ansi.h>
#include <combat.h>

#define FENG "「" HIR "风雷四击" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        string wname;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/fenglei-panfa/fenglei"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FENG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你目前所装备的武器无法使用出" FENG "。\n");

        if (me->query_skill_mapped("hammer") != "fenglei-panfa")
                return notify_fail("你没有激发风雷盘法，不能使用" FENG "。\n");

        if ((int)me->query_skill("fenglei-panfa", 1) < 150)
                return notify_fail("你的风雷盘法不够娴熟，还使不出" FENG "。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" FENG "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在真气不够，难以施展" FENG "。\n"NOR);

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wname = weapon->name();

        damage = (int)me->query_skill("fenglei-panfa", 1) / 2;
        damage += random(damage / 2);

        // 风起云涌
        ap = me->query_skill("hammer");
        dp = target->query_skill("dodge");
        msg = "\n" HIW "$N" HIW "喝道：“风起云涌！”身形陡然加快，单手高举"
               + wname + HIW "，便如狂风一般袭向$n" HIW "。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
                                           HIR "$p" HIR "一楞，只见$P" HIR "身形"
                                           "一闪，已晃至自己跟前，躲闪不及，被这"
                                           "招击个正中。\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "冷静非凡，丝毫不为这奇幻的招数"
                       "所动，凝神抵挡，不漏半点破绽！\n" NOR;
        }

        // 狂风骤雨
        ap = me->query_skill("hammer");
        dp = target->query_skill("dodge");
        msg += "\n" WHT "$N" WHT "喝道：“狂风骤雨！”手中" + wname + WHT "一"
               "阵狂舞，气势如虹，铺天盖地连续向$n" HIW "攻去。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 32,
                                           HIR "$p" HIR "一楞，只见$P" HIR "身形"
                                           "一闪，已晃至自己跟前，躲闪不及，被这"
                                           "招击个正中。\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "冷静非凡，丝毫不为这奇幻的招数"
                       "所动，凝神抵挡，不漏半点破绽！\n" NOR;
        }

        // 雷霆万钧
        ap = me->query_skill("hammer");
        dp = target->query_skill("force");
        msg += "\n" HIM "$N" HIM "喝道：“雷霆万钧！”跃至半空，手中" + wname
               + HIM "一个盘旋，携着万钧之劲凌空贯向$n" HIM "。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 33,
                                           HIR "$p" HIR "一楞，只见$P" HIR "身形"
                                           "一闪，已晃至自己跟前，躲闪不及，被这"
                                           "招击个正中。\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "冷静非凡，丝毫不为这奇幻的招数"
                       "所动，凝神抵挡，不漏半点破绽！\n" NOR;
        }

        // 电闪雷鸣
        ap = me->query_skill("hammer");
        dp = target->query_skill("parry");
        msg += "\n" HIY "$N" HIY "喝道：“电闪雷鸣！”猛地向前直冲数尺，手中"
               + wname + HIY "幻出一道黄芒，闪电一般射出。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 35,
                                           HIR "$p" HIR "一楞，只见$P" HIR "身形"
                                           "一闪，已晃至自己跟前，躲闪不及，被这"
                                           "招击个正中。\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "冷静非凡，丝毫不为这奇幻的招数"
                       "所动，凝神抵挡，不漏半点破绽！\n" NOR;
        }

        me->start_busy(2 + random(5));
        me->add("neili", -400 - random(100));
        message_combatd(msg, me, target);
        return 1;
}
