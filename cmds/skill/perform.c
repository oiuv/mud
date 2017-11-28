// perform.c

#include <ansi.h>

inherit F_CLEAN_UP;

private int do_perform(object me, string arg);

int main(object me, string arg)
{
        string and;
	int result;
        int busy;
        int lvl;
        string msg;
	
	seteuid(getuid());

	if (me->is_busy())
		return notify_fail("( 你上一个动作还没有完成，不能施用外功。)\n");

	if (! arg)
                return notify_fail("你要用外功做什麽？\n");

        if (me->query_temp("no_perform"))
                return notify_fail(HIR "你只觉全身力道竟似涣散了一般，全然无法控制。\n" NOR);

        if (me->query_temp("eff/jiuyin-shengong/xin"))
                return notify_fail(HIR "你只觉精神恍惚，精力无法集中！暂时不能使用外功！\n");

        if (sscanf(arg, "%s and %s", arg, and) == 2 ||
            sscanf(arg, "%s twice", arg) == 1 && (and = arg))
        {
                lvl = me->query_skill("zuoyou-hubo", 1);
                if (! lvl)
                        return notify_fail("你要干什么？以为自己有三头六臂啊！\n");
                        
                //转世特技循影擒踪
                  if (me->query_skill("count", 1) && ! me->query("special_skill/qinzong"))
                        return notify_fail("你杂学太多，心头烦乱，难以分心二用。\n");

                if (lvl <= 100)
                        return notify_fail("你的左右互搏修为太浅，难以分心二用。\n");

                if (! me->is_fighting())
                        return notify_fail("只有战斗中才能施展左右互搏。\n");

                if (lvl < 360 && random(lvl) < 100)
                {
                        me->start_busy(1);
                        write("你试图分心二用，但是手就是不听使唤。\n");
                        return 1;
                }
        }

        result = do_perform(me, arg);
        if (! and)
                return result;

        if (! result)
                write(query_notify_fail());
        else
        {
                switch (random(4))
                {
                case 0:
                        msg = HIY "$N" HIY "大喝一声，双手分"
                              "使两招，一起攻出。\n" NOR;
                        break;

                case 1:
                        msg = HIY "$N" HIY "双手齐出，分使不"
                              "同招式，令人眼花缭乱。\n" NOR;
                        break;

                case 2:
                        msg = HIY "$N" HIY "左右手分使两招，"
                              "毫不停滞，宛如两人同时攻出。\n" NOR;
                        break;

                case 3:
                        msg = HIY "$N" HIY "左手一招，右手一"
                              "招，两招来路各异，令人难以低档！\n" NOR;
                        break;
                }

                message_combatd(msg, me);
        }

        busy = me->query_busy();
        me->interrupt_busy(0);

        result = do_perform(me, and);
        if (! result)
                write(query_notify_fail());

        if (intp(busy) && intp(me->query_busy()) &&
            busy > me->query_busy())
        {
                me->interrupt_busy(0);
                me->start_busy();
        }

        return 1;
}

private int do_perform(object me, string arg)
{
	object weapon;
	string martial, skill;
//	int result;

	if (sscanf(arg, "%s.%s", martial, arg) != 2)
        {
		if (weapon = me->query_temp("weapon"))
			martial = weapon->query("skill_type");
		else
			martial = "unarmed";
	}

	me->clean_up_enemy();
	if (stringp(skill = me->query_skill_mapped(martial)))
        {
		notify_fail("你所使用的外功中没有这种功能。\n");
		if (SKILL_D(skill)->perform_action(me, arg))
                {
			if (random(120) < (int)me->query_skill(skill))
				me->improve_skill(skill, 1, 1);
			return 1;
		} else
                if (SKILL_D(martial)->perform_action(me, arg))
                {
			if (random(120) < (int)me->query_skill(martial, 1))
				me->improve_skill(martial, 1, 1);
			return 1;
		}
		return 0;
	}

	return notify_fail("你现在的" + to_chinese(martial)[4..7] +
			   "(" + martial + ")中并没有这种外功。\n");
}

int help (object me)
{
        write(@HELP
指令格式：perform | yong [<武功种类>.]<招式名称> [<施用对象>]
          perform | yong 招式1 [<对象1>] and 招式2 [<对象2>]
          perform | yong 招式1 [<对象1>] twice

如果你所学的外功(拳脚、剑法、刀法....)有一些特殊的攻击方式或
招式，可以用这个指令来使用，你必须先用 enable 指令指定你使用
的武功，不指定武功种类时，空手的外功是指你的拳脚功夫，使用武
器时则是兵刃的武功。

若是你的外功中有种类不同，但是招式名称相同的，或者不属於拳脚
跟武器技能的武功(如轻功)，可以用 <武功>.<招式>  的方式指定，
如：

perform sword.chan

换句话说，只要是 enable 中的武功有特殊招式的，都可以用这个指
令使用。

如果你精通左右互搏，可以同时使用两个招式攻击同一对手或则分别
攻击两人。左右互搏修炼的越是精深，则成功率越高。

使用 twice 参数表示左右手使用同样的招式。
HELP );
        return 1;
}