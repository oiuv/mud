#include <ansi.h>
#include <combat.h>

#define GUAN "「" HIW "天洪地炉观" HIR "日" HIW "神诀" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, damage;
        int i, count;

        if (userp(me) && ! me->query("can_perform/guanri-jian/guan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(GUAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" GUAN "。\n");

        if ((int)me->query_skill("guanri-jian", 1) < 280)
                return notify_fail("你观日剑法不够娴熟，难以施展" GUAN "。\n");

        if (me->query_skill_mapped("sword") != "guanri-jian")
                return notify_fail("你没有激发观日剑法，难以施展" GUAN "。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不够，难以施展" GUAN "。\n");

        if ((int)me->query("neili") < 800)
                return notify_fail("你现在的真气不足，难以施展" GUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "施出观日剑法之「" HIW "天洪地炉观"
              HIR "日" HIW "神诀" NOR + WHT "」，将内力尽数注"
              "入" + weapon->name() + WHT "剑身直奔\n$n" WHT
              "而去。霎时间炽炎暴涨，热浪扑面卷来，四周空气便"
              "似沸腾一般。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("force");

        me->start_busy(3);
        me->add("neili", -600);

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 150,
                                           (: final, me, target, damage :));
        } else
        {
                me->start_busy(2);
                msg += CYN "可是$n" CYN "看破了$N" CYN "的企图，斜跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        count = me->query_skill("sword");
        me->add_temp("apply/attack", count);
        me->add_temp("apply/damage", count);

        message_combatd(WHT "紧跟着$N" WHT "一声冷笑，身形蓦地前跃丈"
                        "许，手中" + weapon->name() + WHT "「唰唰唰」"
                        "连出九剑。\n" NOR, me, target);

        for (i = 0; i < 9; i++)
      	{
               	if (! me->is_fighting(target))
               	        break;

                COMBAT_D->do_attack(me, target, weapon, 0);
        }
        me->add_temp("apply/attack", -count);
        me->add_temp("apply/damage", -count);

        return 1;
}

string final(object me, object target, int damage)
{
        int lvl = me->query_skill("guanri-jian", 1);

        target->affect_by("zhurong_jian",
                ([ "level"    : lvl + random(lvl),
                   "id"       : me->query("id"),
                   "duration" : lvl / 50 + random(lvl / 20) ]));

        return  HIR "只听$p" HIR "一声惨嚎，几柱鲜血射出，剑伤"
                "处竟腾起一道烈火，烧得嗤嗤作响。\n" NOR;
}
