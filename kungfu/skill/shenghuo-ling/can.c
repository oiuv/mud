#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define CANXUE "「" HIR "残血令" NOR "」"

int perform(object me, object target)
{
        object weapon;
        string msg;
        int count;
        int skill;
        int i;

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/shenghuo-ling/can"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        skill = me->query_skill("shenghuo-ling", 1);

        if (! (me->is_fighting()))
                return notify_fail(CANXUE "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的兵器不对，不能使用圣火令法之"
                                   CANXUE "。\n");

        if (skill < 220)
                return notify_fail("你的圣火令法等级不够, 不能使用圣火令"
                                   "法之" CANXUE "。\n");

        if (me->query_skill("force") < 350)
                return notify_fail("你的内功火候不够，不能使用圣火令法之"
                                   CANXUE "。\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，不能使用圣火令法之"
                                   CANXUE "。\n");

        if (me->query("neili") < 400)
                return notify_fail("你的内力不够，不能使用圣火令法之" CANXUE "。\n");

        if (me->query_skill_mapped("sword") != "shenghuo-ling")
                return notify_fail("你没有激发圣火令法，无法使用" CANXUE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "一声长啸，手中" + weapon->name() +
              HIR "一转，招数顿时变得诡异无比，从意想不到的方"
              "位攻向$n" HIR "！\n" NOR;

        // 配合圣火令法本身具备的 max_hit带来额外的伤害。
        // 原著中该令法乃很难看透的招数，所以出现增加攻
        // 击的效率非常大。
        if (random(me->query_skill("sword")) > target->query_skill("parry") / 3)
        {
                msg += HIR "$n" HIR "完全无法看透$N" HIR "招中虚实，不由得心"
                       "生惧意，招式一滞，登时破绽百出。\n" NOR;
                count = me->query_skill("shenghuo-ling", 1) / 6;
                me->add_temp("shenghuo-ling/max_hit", 1);
        } else
        {
                msg += HIY "$n" HIY "见$N" HIY "来势汹涌，心底一惊，打起精"
                       "神小心接招。\n" NOR;
                count = 0;
        }

        message_combatd(msg, me, target);
        me->add("neili", -300);
        me->add_temp("apply/attack", count);

        for (i = 0; i < 7; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
        me->delete_temp("shenghuo-ling/max_hit");
        me->start_busy(1 + random(4));
        return 1;
}
