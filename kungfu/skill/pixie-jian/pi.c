#include <ansi.h>
#include <combat.h>

#define PI "��" HIW "Ⱥа����" NOR "��"

inherit F_SSERVER;

string *finger_name = ({ "������ָ", "��������ָ", "����ʳָ",
                         "������ָ", "��������ָ", "����ʳָ", }); 

int perform(object me, object target)
{
        string msg;
        string name;
        object weapon;
        int i;
        int skill;
        int count;

        if (userp(me) && ! me->query("can_perform/pixie-jian/pi"))
                return notify_fail("����ʹ�õ��⹦��û�����ֹ��ܡ�\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(PI "ֻ�ܶ�ս���еĶ���ʹ�á�\n");

        weapon = me->query_temp("weapon");

        if (weapon && weapon->query("skill_type") != "sword" &&
            weapon->query("skill_type") != "pin")
                return notify_fail("��ʹ�õ��������ԣ�����ʩչ" PI "��\n");

        if (me->query_temp("weapon"))
                name = "����" + weapon->name();
        else
                name = finger_name[random(sizeof(finger_name))];

        skill = me->query_skill("pixie-jian", 1);

        if (skill < 120)
                return notify_fail("��ı�а����������죬����ʩչ" PI "��\n");

        if (me->query("neili") < 200)
                return notify_fail("�����ڵ��������㣬����ʩչ" PI "��\n");

        if (weapon && me->query_skill_mapped("sword") != "pixie-jian")
                return notify_fail("��û��׼��ʹ�ñ�а����������ʩչ" PI "��\n");

        if (! weapon && me->query_skill_prepared("unarmed") != "pixie-jian")
                return notify_fail("��û��׼��ʹ�ñ�а����������ʩչ" PI "��\n");

        if (! living(target))
                return notify_fail("�Է����Ѿ������ˣ��ò�����ô�����ɣ�\n");

        msg = HIW "$N" HIW "���κ�Ȼ��죬��ĳ���$n" HIW "��" + name +
              HIW "����������Ӱ����ʱ�����ǹ�һ������$n" HIW "��\n" NOR;
        message_combatd(msg, me, target);

		dp = target->query_skill("dodge", 1);
        if (skill / 2 + random(skill) > dp)
			count = skill / 4;
		else
			count = skill/15;
        me->add_temp("apply/attack", count);
        me->add_temp("apply/damage", count);
        me->add_temp("apply/unarmed_dage", count);

        me->add_temp("pixie-jian/hit_msg", 1);

        for (i = 0; i < 9; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (random(3) == 0 && ! target->is_busy())
                        target->start_busy(1);

        	COMBAT_D->do_attack(me, target, weapon, 0);
        }
        me->add("neili", -100);
        me->start_busy(1 + random(7));
        me->add_temp("apply/attack", -count);
        me->add_temp("apply/damage", -count);
        me->add_temp("apply/unarmed_dage", -count);
        me->delete_temp("pixie-jian/hit_msg");
        return 1;
}
