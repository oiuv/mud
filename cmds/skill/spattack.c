// spattack.c

#include <ansi.h>

inherit F_CLEAN_UP;

mapping weapon_name = ([
        "sword" : "剑",
        "blade" : "刀",
        "staff" : "杖",
        "whip"  : "鞭",
        "club"  : "棍",
]);

void do_remote_fight(object me, object couple, object target, int n);
void do_here_fight(object me, object couple, object target, int n);

int main(object me, string arg)
{
        int same_place;
        string couple_id;
        string couple_name;
        object couple;
        object target;

        if (environment(me)->query("no_fight"))
                return notify_fail("这里不能战斗。\n");

        if (! arg)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        } else
                target = present(arg, environment(me));

        if (! target || ! me->is_fighting(target))
                return notify_fail("会心一击只能对战斗中的对手使用。\n");

        if (! stringp(couple_id = me->query("couple/id")))
                return notify_fail("你还没有伴侣，使什么会心一击？\n");

        couple_name = me->query("couple/name");

        if (! objectp(couple = find_player(couple_id)))
                return notify_fail(couple_name + "不在这个世界上，无法给与你力量。\n");

        if (couple->is_ghost())
                return notify_fail(couple_name + "现在是鬼魂一个，无"
                                   "法穿越灵界给与你力量。\n");

        if (! living(couple))
                return notify_fail("你的心灵现在无法和" + couple_name + "沟通。\n");

        if (target == couple)
                return notify_fail("你有病啊！\n");

        same_place = (environment(couple) == environment(me));

        if (! same_place)
                do_remote_fight(me, couple, target, me->query("sex/" + couple->name(1)));
        else
                do_here_fight(me, couple, target, me->query("sex/" + couple->name(1)));
        return 1;
}

void do_remote_fight(object me, object couple, object target, int n)
{
        object weapon;
        string chinese_type;
        int need, cost;
        int enhance, count;
        string msg;

        if (n > 500) n = 500;
        need = 300 - n / 2;
        cost = 300 - n / 3;

        if (me->query("jingli") < need)
        {
                write("你试图和你的伴侣进行心灵上的沟通，但是"
                      "一时觉得精力不济，难以联系。\n");
                return;
        }

        if (couple->query("jingli") < need)
        {
                write("你隐隐约约的感觉到你伴侣"
                      "的灵力，但是非常微弱，很难捕捉到。\n");
                return;
        }

	if (me->is_busy())
        {
		write("( 你上一个动作还没有完成，不能施展会心一击。)\n");
                return;
        }

        if (random(2))
                tell_object(me, HIM "你心中默默的念着" + couple->name(1) +
                            HIM "的名字，隐隐感到那若即若离的"
                            "灵觉，穿透了无尽的虚空，和你心心相连。\n\n" NOR);
        else
                tell_object(me, HIM "穿过了缥缈的虚空，你仿佛看到" + couple->name(1) +
                            HIM "，给与着你无上的鼓舞和无尽的力量。\n\n" NOR);

        if (random(2))
                tell_object(couple, HIM "你似乎感觉到" + me->name(1) +
                            HIM "在你心灵深处呼唤你的名字，两人之"
                            "间有如心有灵犀，你默默的为" +
                            gender_pronoun(me->query("gender")) +
                            "祝福：去吧，我的爱人！\n" NOR);
        else
                tell_object(couple, HIM "冥冥你感到了" + me->name(1) +
                            HIM "对你的呼唤，这一刹那，你们在心灵上"
                            "全然相通，让你把无形的力量注入给对方，鼓舞着" +
                            gender_pronoun(me->query("gender")) + "。\n" NOR);

        me->add("jingli", -cost);
        couple->add("jingli", -cost);
        weapon = me->query_temp("weapon");
        if (weapon && (chinese_type = weapon_name[weapon->query("skill_type")]))
        {
                if (me->query("gender") == "女性")
                        msg = HIG "$N" HIG "弹" + chinese_type +
                              "轻吟，宛若黄莺出谷，飘身而进，手中的" +
                              weapon->name() + HIG "化作流星夜雨，披向$n"
                              HIG "。\n" NOR;
                else
                        msg = HIC "$N持" + chinese_type + "而进，竟然视$n有若无物，手中" +
                              weapon->name() + HIC "挥洒自如，荡起层层" +
                              chinese_type + "影，将$p困在当中。\n" NOR;
        } else
        {
                if (me->query("gender") == "女性")
                        msg = HIG "$N" HIG "轻声浅笑，飘然而进，身法惊艳"
                              "绝伦，有若九天玄女踏足红尘，举手投足之间没有任何破绽。\n" NOR;
                else
                        msg = HIC "$N" HIC "纵声长啸，一股杀气凛然而起，天"
                              "地登时色变，$N" HIC "挟风雷万钧之势，压向$n"
                              HIC "。\n" NOR;

        }

        message_vision(msg, me, target);
        enhance = ((int)couple->query_skill("force") + n / 10) / 5;
        count = 1 + random(3 + n / 100);
        if (count > 3)
                count = 3;
        me->add_temp("apply/attack", enhance);
        while (count--)
        {
                if (! me->is_fighting(target))
                        break;

                COMBAT_D->do_attack(me, target, me->query_temp("weapon"), 0);
        }
        me->add_temp("apply/attack", -enhance);
        me->start_bust(3);
        return;
}

void do_here_fight(object me, object couple, object target, int n)
{
        int need, cost;
        int enhance1, enhance2, count;
//      string msg;

        if (n > 500) n = 500;
        need = 300 - n / 2;
        cost = 300 - n / 3;

	if (me->is_busy())
        {
		write("( 你上一个动作还没有完成，不能施展会心一击。)\n");
                return;
        }

        if (couple->is_busy())
        {
                write("你的伴侣现在正忙，无法配合你进行会心一击。\n");
                return;
        }

        if (! couple->is_fighting(target))
                couple->fight_ob(target);

        message_vision(HIY "$N" HIY "和$n" HIY "两人眼神一交，心意已"
                       "然相通，不由的会心一笑，只见二人身形一错，霎时\n"
                       "已经向" + target->name() + "攻出数招！\n" NOR,
                       me, couple);

        enhance1 = ((int)couple->query_skill("force") + n / 10) / 5;
        enhance2 = ((int)me->query_skill("force") + n / 10) / 5;
        count = 2 + random(5 + n / 50);
        if (count > 6)
                count = 6;
        me->add_temp("apply/attack", enhance1);
        couple->add_temp("apply/attack", enhance2);
        while (count--)
        {
                if (me->is_fighting(target) && (count % 2) == 0)
                        COMBAT_D->do_attack(me, target, me->query_temp("weapon"), 0);
                else
                if (couple->is_fighting(target))
                        COMBAT_D->do_attack(couple, target, couple->query_temp("weapon"), 0);
                else
                        break;
        }

        me->start_busy(2);
        couple->start_busy(2);
        me->add_temp("apply/attack", -enhance1);
        couple->add_temp("apply/attack", -enhance2);
        return;
}

int help (object me)
{
        write(@HELP
指令格式：spattack [<施用对象>]

如果你结婚了，就可以使用会心一击，联手打击对你正在攻击的对手，
即使你的伴侣不在你的身边，也可以运用灵力穿过遥远的时空给与你
支持，当然这需要耗费精力，两个人灵肉结合的次数越多，耗费的精
力就越少。如果你的伴侣就在你的身边，则可以一起施展招数攻击对
手，不需要耗费精力，招数的威力与两的人灵肉结合的次数于伴侣的
内功等级相关。
HELP );
        return 1;
}