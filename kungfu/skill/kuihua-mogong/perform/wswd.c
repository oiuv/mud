#include <ansi.h>
#include <combat.h>

#define WSWD "��" HIR "��"BLU"˫"HIM"��"HIW"��" NOR "��"
#define WS "��" HIR "��"BLU"˫" NOR "��"
#define WD "��" HIM"��"HIW"��" NOR "��"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
    string msg;
    int ap, dp;
    int damage;

    if( !target ) target = offensive_target(me);
	
	    if (userp(me) && ! me->query("can_perform/kuihua-mogong/ws"))
        return notify_fail("����ʹ�õ��⹦��û�����ֹ��ܡ�\n");

    if( !target || !me->is_fighting(target) || !living(target) )
		return notify_fail("��˫�޶�ֻ�ܶ�ս���еĶ���ʹ�á�\n");

    if( ! objectp(weapon = me->query_temp("weapon")) 
		|| (string)weapon->query("skill_type") != "sword"
        || me->query_skill_mapped("sword") != "kuihua-mogong" ) 
            return  notify_fail("�������޷�ʹ�þ�����\n");
			
    if (me->query_skill("kuihua-mogong", 1) < 400)
        return notify_fail("����Ŀǰ����Ϊ������������������"WS"\n");
	
    if (me->query("max_neili") < 7000)
        return notify_fail("���������Ϊ����������ʩչ"WSWD"��\n");
	
    if (me->query("neili") < 1000)
        return notify_fail("���������������"WS"���裡\n");
	        
	if (! living(target))
        return notify_fail("�Է����Ѿ������ˣ��ò�����ô�����ɣ�\n");
	ap = me->query_skill("kuihua-mogong", 1) + me->query("dex") * 20 + me->query_skill("martial-cognize", 1);
    dp = target->query_skill("parry",1) + target->query("dex") * 20 + target->query_skill("martial-cognize", 1);
    msg =HIM "$NͻȻ����һתգ�ۼ�ʹ������ħ�����ռ�����----"NOR""WSWD""HIM"֮"NOR""WS"\n"HIW"$N����ӨȻ�й⣬�ƺ�������ħ��֮�С�\n"
    "$N����" + weapon->name() + "������˫��Ӱ����$n��\n";

        if (ap *2/3 + random(ap) < dp)
        {
            msg += HIG "Ȼ��$n" HIG "�ֵ��÷�����$N" HIG
            "�Ĺ���һһ���⡣\n" NOR;
			me->start_busy(2);
            me->add("neili", -300);
        } else
        {
			me->start_busy(1);
            me->add("neili",-500);
            damage = ap + random(ap * 1 / 4) - random(100);
            msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 80,
              HIY "$n" BLU "ֻ�����Ѿ����������ħ��֮�У�"HIY"$N����"+weapon->name()+
              WHT "��ͬ�����еĹ��㣬�Ӹ�����λ���˹��������޿ɱܣ�\n" NOR);  
			  
        }
		//ȡ����˫δ����ʱ�޶��޷��������趨 by MK
        if(me->query("can_perform/kuihua-mogong/wd"))
            call_out("perform2", 0, me, target);
        else       //ûѧ���޶�
            call_out("check_wd", 3, me);

        message_vision(msg, me, target);
			
    return 1;
}
int perform2(object me, object target)
{       int ap, dp;
        string msg;
        int damage;	

        if (!me || !target) return notify_fail("�����Ѿ����������ˣ�\n");
        if(!living(target))
            return notify_fail("�����Ѿ�������ս���ˡ�\n");
	    if(me->query("neili") < 1000)
            return notify_fail("���Ҫ�ٳ�"WD"��ȴ�����Լ������������ˣ�\n");
		ap = me->query_skill("kuihua-mogong", 1) + me->query("dex") * 20 + me->query_skill("martial-cognize", 1);
        dp = target->query_skill("parry",1) + target->query("dex") * 20 + target->query_skill("martial-cognize", 1);
		
        msg =HIM "˵ʱ����ʱ�죬$N������תʹ����"NOR""WSWD"֮"WD""HIM"ʽ��ɲ�Ǽ���������ܲ���\n"NOR""HIM"$n�����༸��ֹͣ������������������$N\n"NOR;

        if (ap *3/ 5 + random(ap) < dp)
        {
            msg += HIG "��ʱ$n��ס����" HIG "�ֵ��÷�����$N" HIG"�Ĺ���һһ���⡣\n" NOR;
			  me->start_busy(2);
              me->add("neili", -300);
        } else
        {
			me->start_busy(1);
            me->add("neili",-600);
            damage = ap + random(ap * 1 / 2) - random(100);
            msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 100,
              HIY "$n" BLU "ֻ��������ͬ�򽣴���һ�㣬"HIY"$N"
              WHT "��ͬ����һ�㣬�Ʊ�Ҫȡ$n������\n" NOR);
        }
        message_vision(msg, me, target);
        return 1;
}
int check_wd(object me)
{ 
    if(me->query("int") + random(80) >= 100) {
        tell_object(me, HIW "\n��ͻȻ�������򣬶Ըղ�ʹ�ù��Ŀ���ħ��֮"WS""HIW"ʽ������ĥ��\n���ˣ�����Ҳ����Ү����ѧ����"WSWD""HIW"֮"WD""HIW"ʽ��\n" NOR); 
        me->set("can_perform/kuihua-mogong/wd",1);
    }
    return 1;
}
