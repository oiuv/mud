// from NT MudLIB
// ziqi.c 紫气东来

#include <ansi.h>

inherit F_SSERVER;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
//      string msg;
//      mapping buff,data;
        int /*d_count,count,*/ qi, maxqi, skill;
		object weapon = me->query_temp("weapon");
		skill = me->query_skill("zixia-shengong", 1);

        if((int)me->query_temp("ziqi"))
				return notify_fail(HIG"你已经在运起紫气东来了。\n");

        if((int)me->query("neili") < 200 )
                return notify_fail("你的内力还不够！\n");

        if(skill < 150)
                return notify_fail("你的紫霞神功的修为不够，不能使用紫气东来! \n");

        // 必须有兵器。加兵器威力
		if ( ! weapon || weapon->query("skill_type") != "sword" )
				return notify_fail("你没有剑.怎么用紫气东来呀? \n");

        qi = me->query("qi");
        maxqi = me->query("max_qi");
		
		message_combatd(MAG "$N" MAG "猛吸一口气，脸上紫气大盛！手中的兵器隐隐透出一层紫光。。。\n" NOR, me);
		
        if( qi > (maxqi * 0.4) )
        {
                me->add_temp("apply/damage", skill / 10);
				me->add_temp("apply/sword", skill / 10);
				me->set_temp("ziqi", 1);
				me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill / 10 :), skill);
				me->add("neili", -200);
        }
        else
        {
                message_combatd(HIR "$N" HIR "拼尽毕生功力想提起紫气东来，但自己受伤太重，没能成功!\n" NOR, me);
        }
        
        if( me->is_fighting() ) me->start_busy(3);
        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("ziqi"))
        {
                me->add_temp("apply/damage", -amount);
                me->add_temp("apply/sword", -amount);
                me->delete_temp("ziqi");
                tell_object(me, "你的紫气东来运行完毕，紫气渐渐隐去。\n");
        }
}