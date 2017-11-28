#include <ansi.h>
#include <combat.h>

#define DIE "「" HIR "阳关三叠" NOR "」"

inherit F_SSERVER;

string *xue_name = ({ 
"劳宫穴", "膻中穴", "曲池穴", "关元穴", "曲骨穴", "中极穴",
"承浆穴", "天突穴", "百会穴", "幽门穴", "章门穴", "大横穴",
"紫宫穴", "冷渊穴", "天井穴", "极泉穴", "清灵穴", "至阳穴", }); 

int perform(object me, object target)
{
        int damage;
        string msg, wp;
        object weapon;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/yiyang-zhi/die"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DIE "只能对战斗中的对手使用。\n");
 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(DIE "只能空手施展。\n");

        if ((int)me->query_skill("yiyang-zhi", 1) < 200)
                return notify_fail("你一阳指诀不够娴熟，难以施展" DIE "。\n");

        if ((int)me->query_skill("jingluo-xue", 1) < 200)
                return notify_fail("你对经络学了解不够，难以施展" DIE "。\n");

        if (me->query_skill_mapped("finger") != "yiyang-zhi")
                return notify_fail("你没有激发一阳指诀，难以施展" DIE "。\n");

        if (me->query_skill_prepared("finger") != "yiyang-zhi")
                return notify_fail("你没有准备一阳指诀，难以施展" DIE "。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功火候不够，难以施展" DIE "。\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，难以施展" DIE "。\n");

        if ((int)me->query("neili") < 1000)
                return notify_fail("你现在的真气不够，难以施展" DIE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        damage = (int)me->query_skill("finger");
        damage += random(damage);

        ap = me->query_skill("finger");
        dp = target->query_skill("parry");

        msg = HIW "突然间";

        if (objectp(weapon = target->query_temp("weapon")))
        {
                wp = weapon->name();
                msg += "$N" HIW "单指一扬，径点$n" HIW "持着" + wp + NOR + HIW
                       "的手腕上「" HIY "腕骨" HIW "」、「" HIY "阳谷" HIW "」"
                       "、「" HIY "养老" HIW "」三穴。\n" NOR;

                ap = me->query_skill("finger");
                dp = target->query_skill("force");

                if (ap / 3 + random(ap) > dp)
                {
                        msg += HIR "霎时间$n" HIR "只觉得手腕一麻，手中" + wp +
                               HIR "再也拿持不住，脱手掉在地上。\n\n" HIW "紧"
                               "接着";
                        me->add("neili", -150);
                        weapon->move(environment(target));
                } else
                {
                        msg += CYN "可是$n" CYN "将手中" + wp + NOR + CYN "转"
                               "动如轮，终于化解了这一招。\n\n" HIW "紧接着";
                        me->add("neili", -100);
                }
        }

        msg += "$N" HIW "凝气于指，一式「" HIR "阳关三叠" HIW "」点出，顿时一股"
               "纯阳的内力直袭$n" HIW "胸口！\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70,
                                           HIR "结果$n" HIR "被$N" HIR "一指点中"
                                           HIY + xue_name[random(sizeof(xue_name))] +
                                           HIR "，全身真气逆流而上，登时呕出一大"
                                           "口鲜血。\n" NOR);

		target->add_temp("yiyang-zhi/die", 1);
        } else
        {
                msg += CYN "可是$p" CYN "镇定自如，全力化解了$P"
                       CYN "这精妙的一指。\n" NOR;
        }

        ap = me->query_skill("finger");
        dp = target->query_skill("dodge");

        msg += "\n" HIW "接着$N" HIW "踏前一步，体内真气迸发，隔空一指劲点$n" HIW
               "而去，指气纵横，嗤然作响！\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 80,
                                           HIR "结果$n" HIR "被$N" HIR "一指点中"
                                           HIY + xue_name[random(sizeof(xue_name))] +
                                           HIR "，全身真气逆流而上，登时呕出一大"
                                           "口鲜血。\n" NOR);

		target->add_temp("yiyang-zhi/die", 1);
        } else
        {
                msg += CYN "可是$p" CYN "镇定自如，全力化解了$P"
                       CYN "这精妙的一指。\n" NOR;
        }

        ap = me->query_skill("finger");
        dp = target->query_skill("force");

        msg += "\n" HIW "最后$N" HIW "一声猛喝，单指“嗤”的一声点出，纯阳指力同"
               "时笼罩$n" HIW "全身诸多要穴！\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 90,
                                           HIR "结果$n" HIR "被$N" HIR "一指点中"
                                           HIY + xue_name[random(sizeof(xue_name))] +
                                           HIR "，全身真气逆流而上，登时呕出一大"
                                           "口鲜血。\n" NOR);

		target->add_temp("yiyang-zhi/die", 1);
        } else
        {
                msg += CYN "可是$p" CYN "镇定自如，全力化解了$P"
                       CYN "这精妙的一指。\n" NOR;
        }

        if (target->query_temp("yiyang-zhi/die", 1) == 3
           && target->query("neili"))
        {
                msg += HIY "\n$n" HIY "被$N" HIY "三指连中，全身真气涣"
                       "散，宛如黄河决堤，内力登时狂泻而出。\n\n" NOR;
		target->set("neili", 0);
        }
        //me->start_busy(4 + random(4));
        me->start_busy(3 + random(3));
        me->add("neili", -800);
	target->delete_temp("yiyang-zhi/die");
        message_combatd(msg, me, target);

        if (! target->query("neili"))
                tell_object(target, HIC "你只觉丹田内竟似空空如也，一时"
                                    "说不出的难受。\n" NOR);

        return 1;
}
