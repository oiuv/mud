#include <ansi.h>
#include <combat.h>

#define DUO "��" HIR "��Ӱ��Ŀ" NOR "��"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        int /*lvl,*/ ap, dp;

        if (userp(me) && ! me->query("can_perform/pixie-jian/duo"))
                return notify_fail("����ʹ�õ��⹦��û�����ֹ��ܡ�\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DUO "ֻ�ܶ�ս���еĶ���ʹ�á�\n");

        weapon = me->query_temp("weapon");

        if (weapon && weapon->query("skill_type") != "sword"
           && weapon->query("skill_type") != "pin")
                return notify_fail("��ʹ�õ��������ԣ�����ʩչ" DUO "��\n");

        if ((int)me->query_skill("pixie-jian", 1) < 80)
                return notify_fail("��ı�а����������죬����ʩչ" DUO "��\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("���������Ϊ���㣬����ʩչ" DUO "��\n");

        if (me->query("neili") < 100)
                return notify_fail("�����ڵ��������㣬����ʩչ" DUO "��\n");

        if (weapon && me->query_skill_mapped("sword") != "pixie-jian")
                return notify_fail("��û��׼��ʹ�ñ�а����������ʩչ" DUO "��\n");

        if (! weapon && me->query_skill_prepared("unarmed") != "pixie-jian")
                return notify_fail("��û��׼��ʹ�ñ�а����������ʩչ" DUO "��\n");

        if (! living(target))
                return notify_fail("�Է����Ѿ������ˣ��ò�����ô�����ɣ�\n");

        if (target->query_temp("block_msg/all"))
	        return notify_fail("�Է�����ʲôҲ���������ŵ������ɡ�\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
	{
                msg = HIR "$N" HIR "һ����Ц��������ϣ�������ָ��£���ֱ�"
                      "������Ѹ���쳣�ִ�$n" HIR "��˫Ŀ��\n" NOR;
        } else
	{
                msg = HIR "$N" HIR "һ����Ц��������ϣ�����" + weapon->name() +
                      HIR "һ�񣬽���һ�㱩�����ִ�$n" HIR "����˫Ŀ��\n" NOR;
	}

        ap = me->query_skill("sword") +
             me->query_skill("dodge");

        dp = target->query_skill("parry") +
             target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 30,
                                          (: final, me, target, damage :));
                me->start_busy(2);
                me->add("neili", -80);
        } else
        {
                msg += CYN "$n" CYN "�鼱������̧��Ҳ��$N"
                       CYN "�����۴�ȥ���ȵ�$P" CYN "�ؽ�Ծ����\n" NOR;
                me->start_busy(3);
                me->add("neili", -50);
        }
        message_combatd(msg, me, target);
        return 1;
}

string final(object me, object target, int ap)
{
        target->set_temp("block_msg/all", 1);
        call_out("cimu_end", 10 + random(ap / 30), me, target);
        return HIR "$n" HIR "ֻ��˫Ŀһ���ʹ����ǰһ�ڣ���ʲô"
               "Ҳ�������ˣ���ʱ����ʹ��������\n" NOR;
}

void cimu_end(object me, object target)
{
        if (target && target->query_temp("block_msg/all"))
        {
                if (living(target))
                {
                        message_combatd(HIC "$N" HIC "Ĩ��Ĩ���ŵ�"
                                        HIR "��Ѫ" HIC "�������ܿ�"
                                        "���ˡ�\n" NOR, target);

                        tell_object(target, HIR "������Ĩ������ǰ��"
                                            "��Ѫ���ܿ����ˡ�\n" NOR);
                }
                target->delete_temp("block_msg/all");
	}
	return;
}