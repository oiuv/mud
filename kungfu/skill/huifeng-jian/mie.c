// mie.c  回风拂柳剑法「灭剑」

#include <ansi.h>
#include <combat.h>

#define MIE "「" HIR "灭剑" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/huifeng-jian/mie"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(MIE "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，无法施展" MIE "。\n");

        if (me->query_skill_mapped("sword") != "huifeng-jian")
                return notify_fail("你没有激发回风拂柳剑法，无法施展" MIE "。\n");

        if ((int)me->query_skill("huifeng-jian", 1) < 120)
                return notify_fail("你的回风拂柳剑法不够娴熟，无法施展" MIE "。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不够，无法施展" MIE "。\n");

        if ((int)me->query("neili") < 500)
               return notify_fail("你现在真气不够，无法施展" MIE "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "手中长剑剑芒跃动，剑光暴长，幻出死亡的色彩，剑尖渐"
              "渐逼近$n" HIR "，\n$n" HIR "看到漫天剑光，抽身后跃，可是只这一刹"
              "，$N" HIR "漫天剑影化为一剑直\n刺$n" HIR "前胸，快捷无伦，只有一"
              "剑！\n" NOR;

        if (random(me->query_skill("force")) > target->query_skill("force") / 2 ||
            random(me->query("combat_exp")) > (int)target->query("combat_exp") / 2)
        {
                me->start_busy(2);
                damage = (int)me->query_skill("huifeng-jian", 1);
                damage += random(damage);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80,
                                           HIR "$n" HIR "全然无法躲避，" + weapon->name() +
                                           HIR "端端正正扎进在$p" HIR "的胸口，鲜血登时飞溅"
                                           "而出。\n" NOR);
                me->add("neili", -150);
        } else
        {
                me->start_busy(3);
                msg += YEL "可是$p" YEL "轻轻一笑，侧身右转，伸"
                       "出两指，正弹在$P" YEL "的剑上，" + weapon->name() +
                       YEL "在$p" YEL "身侧划过，有惊无险。\n"NOR;
                me->add("neili", -60);
        }
        message_combatd(msg, me, target);
        return 1;
}
