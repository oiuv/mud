// dispel.c

#include <ansi.h>

int exert(object me, object target)
{
        int i;
        int still_ill;
        string force_name;
        string *cnds;
        mapping conditions;

        if (me->query("neili") < 300)
        {
                write("你的内力不足，无法运满一个周天。\n");
                return 1;
        }

        force_name = to_chinese(me->query_skill_mapped("force"));

        if (me == target)
        {
                message_vision(HIW "$N" HIW "深吸一口气，又缓缓的吐了出来。\n" NOR, me);
                tell_object(me, YEL "你默运" + force_name + YEL "，开始排除身"
                                "体中的异常症状。\n" NOR);
                me->add("neili", -100);
        } else
        {
        	if (me->is_fighting(target))
        	{
        		write("你们正打得热闹呢，还有心思干这个？\n");
                        return 1;
                }

                if (target->is_fighting())
                {
                	write("对方正在打架，还是等他打完了再说吧。\n");
                        return 1;
                }

                if (target->is_busy())
                {
                	write("对方现在正忙着呢，等他空了些再说吧。\n");
                        return 1;
                }

                message_vision(HIW "$N" HIW "深吸一口气，将手掌粘到$n"
                               HIW "的背后。\n" NOR, me, target);
                tell_object(me, YEL "你默运" + force_name + YEL "，开"
                                "始帮助" + target->name() + YEL "排除"
                                "身体中的异常症状。\n" NOR);
                tell_object(target, YEL + me->name() + YEL "正在运功帮"
                                    "助你排除身体中的异常症状。\n" NOR);
                me->add("neili", -250);
        }

        still_ill = 0;
        conditions = target->query_condition(); 
        if (conditions)
        {
                cnds = keys(conditions);
                for (i = 0; i < sizeof(cnds); i++)
                {
                        switch(target->dispel_condition(me, cnds[i]))
                        {
                        case 0:
                                continue;
                        case -1:
                                still_ill = 1;
                                continue;
                        }
        
                        if (me == target)
                        {
                                tell_object(me, WHT "你调息完毕，将内力收回丹"
					    "田。\n" NOR);
                                me->start_busy(1 + random(2));
                        } else
                        {
                                tell_object(me, WHT "你调息完毕，将内力收回"
					    "丹田。\n" NOR);
                                tell_object(target, WHT "你觉得内息一畅，看来是" +
                                            me->name() + "收功了。\n");
                                me->start_busy(2 + random(3));
                                target->start_busy(1 + random(2));
                                message_vision(WHT "$N" WHT "将手掌从$n" WHT "背后"
                                               "收了回来。\n" NOR, me, target);
                        }
                        return 1;
                }
        }

        if (still_ill)
        {
                if (me == target)
                {
                        tell_object(me, MAG "你调息良久，没有一点效果。\n" NOR);
                        message_vision(HIG "$N" HIG "脸色变了变，有些不"
				       "太自然。\n" NOR, me);
                        me->start_busy(3 + random(3));
                } else
                {
                        tell_object(me, MAG "你运功良久，没能发挥半点作用。\n" NOR);
                        tell_object(target, MAG "你觉得内息一阵紊乱，说不出"
				            "的难受。\n看来" + me->name() +
					    "是不能给予你帮助了。\n" NOR);

                        message_vision(HIG "$N将手掌从$n背后收了回来，脸色"
					   "说不出的难看。\n" NOR, me, target);

                        me->start_busy(6 + random(6));
                        target->start_busy(4 + random(4));
                }
        } else
        {
                if (me == target)
                {
                        tell_object(me, "结果你没发现自己有任何异常。\n");
                        message_vision(WHT "$N" WHT "眉角微微一动，随即恢"
				       "复正常。\n" NOR, me);
                        me->start_busy(1);
                } else
                {
                        tell_object(me, "结果你没发现" + target->name() +
                                   "有任何异常。\n");
                        tell_object(target, "你觉得内息一畅，看来是" +
                                    me->name() + "收功了，大概你本来没有什"
				    "么异常吧。\n");
                        message_vision(WHT "$N" WHT "将手掌从$n" WHT "背后收了"
				       "回来。\n" NOR, me, target);
                        me->start_busy(2);
                        target->start_busy(1);
                }
        }

	return 1;
}
