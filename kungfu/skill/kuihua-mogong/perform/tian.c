// wu.c �޷�����
// �������߿��֣������ý������붼����

#include <ansi.h>

inherit F_SSERVER;

#define WU "��" HIC "�޷�����" NOR "��"
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int count;
        int lvl;
        int i;
 
        if (userp(me) && ! me->query("can_perform/kuihua-mogong/tian"))
                return notify_fail("����ʹ�õ��⹦��û�����ֹ��ܡ�\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail(WU "ֻ�ܶ�ս���еĶ���ʹ�á�\n");
 
	if (me->query("neili") < 340)
		return notify_fail("��������������޷�ʩչ" WU "��\n");

	if ((lvl = me->query_skill("kuihua-mogong", 1)) < 220)
		return notify_fail("��Ŀ���ħ����򲻹����޷�ʩչ" WU "��\n");

        if (me->query_skill_mapped("force") != "kuihua-mogong")
                return notify_fail("�㻹û�м�������ħ��Ϊ�ڹ����޷�ʩչ" WU "��\n");  

        if ((int)me->query("max_neili") < 3400)
                return notify_fail("���������Ϊ���㣬����ʩչ" WU "��\n");

        if (weapon = me->query_temp("weapon"))
        {
                if (weapon->query("skill_type") != "sword" &&
                    weapon->query("skill_type") != "pin")
                        return notify_fail("�������õĲ��ǽ�����ôʩ"
                                           "չ" WU "��\n");
        } else
        {
                if (me->query_skill_prepared("unarmed") != "kuihua-mogong")
                        return notify_fail("�㲢û��׼��ʹ�ÿ�"
                                           "��ħ�������ʩչ" WU "��\n");
        }

        if (weapon && me->query_skill_mapped("sword") != "kuihua-mogong")
                return notify_fail("��û��׼��ʹ�ÿ���ħ��������ʩչ" WU "��\n");

        if (! weapon && me->query_skill_prepared("unarmed") != "kuihua-mogong")
                return notify_fail("��û��׼��ʹ�ÿ���ħ��������ʩչ" WU "��\n");

       if (! living(target))
              return notify_fail("�Է����Ѿ������ˣ��ò�����ô�����ɣ�\n");

	msg = HIR "$N" HIR "Ĭ�˿���ħ�������α������ޱȣ������Ӳ�ͬ�ķ�λ��$n"
              HIR "�������У�\n" NOR;
        i = 5;
        if (lvl * 11 / 20 + random(lvl) > (int)target->query_skill("dodge", 1))
        {
                msg += HIR "$n" HIR "ֻ������ǰһ�����������ܶ���$N"
                       HIR "����Ӱ�����ɰ������⣬�������ˡ�\n" NOR;
                count = me->query_skill("kuihua-mogong", 1) / 5;
                me->add_temp("apply/attack", count);
                //��ǿ�˺�
                me->add_temp("apply/damage", count);
                me->add_temp("apply/unarmed_damage", count);
				i += 1+random(5); //��0~5�޸�Ϊ1~5
        } else
        {
                msg += CYN "$n" CYN "��$N" CYN "���ÿ죬����"
                       "�ҵ�������æ������С��Ӧ�ԡ�\n" NOR;
                count = 0;
        }

	message_combatd(msg, me, target);
	me->add("neili", -i * 30);

        while (i--)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(2) && ! target->is_busy())
                        target->start_busy(1);
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
        me->add_temp("apply/damage", -count);
        me->add_temp("apply/unarmed_damage", -count);
	me->start_busy(1 + random(4));
	return 1;
}
