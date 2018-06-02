// powerup.c

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
	int skill;

	if (target != me)
		return notify_fail("��ֻ���ñ�а���������Լ���ս������\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("�������������\n");

        if (me->query_skill("pixie-jian", 1) < 120)
                return notify_fail("��ı�а�������в����������˹���\n");

	if ((int)me->query_temp("powerup"))
		return notify_fail("���Ѿ����˹����ˡ�\n");

	skill = me->query_skill("force");

	me->add("neili", -100);
	me->receive_damage("qi", 0);

	message_combatd(HIR "$N" HIR "���κ�Ȼ��ù����쳣������"
                        "֮��Ʈ�������������޴�׽����\n" NOR, me);

	me->add_temp("apply/attack", skill / 3);
	me->add_temp("apply/dodge", skill * 2 / 5);
	me->set_temp("powerup", 1);

	me->start_call_out((: call_other, __FILE__, "remove_effect",
                           me, skill :), skill);

	if (me->is_fighting()) me->start_busy(3);

	return 1;
}

void remove_effect(object me, int level)
{
        if ((int)me->query_temp("powerup"))
        {
	        me->add_temp("apply/attack", -(level / 3));
	        me->add_temp("apply/dodge", -(level * 2 / 5));
	        me->delete_temp("powerup");
                tell_object(me, "��ı�а����������ϣ��������ջص��\n");
        }
}

