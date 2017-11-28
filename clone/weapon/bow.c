// bow.c

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name("短弓", ({ "short bow", "bow", "duan gong", "gong" }));
        set_weight(2000);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "张");
                set("long", "一张短弓，打造得颇为精致，具有不错的准确度。\n");
                set("value", 20000);
                set("power", 100000);   // 攻击威力
                set("accuracy", 120);   // 准确度120%
        }
        setup();
}

void init()
{
        if (this_player() == environment())
                add_action("do_shot", "shot");
}

int do_shot(string arg)
{
        string target, item;
        object me, victim;
        object ob;
        object env;
        int amount;
        int my_exp, v_exp;
        int ap;
        string msg;

        me = this_player();
        if (me->query_temp("handing") != this_object())
                return notify_fail("你得先把" + name() + "拿(hand)在手中才行。\n");

        env = environment(me);
        if (! env || env->query("no_fight"))
                return notify_fail("这里不能战斗。\n");

        if (me->is_busy())
                return notify_fail("你现在忙着呢。\n");

        if (me->query("jing") < 80)
                return notify_fail("你现在精神不够好，无法使用" + name() +
                                   "攻击对手。\n");

        if (userp(me))
	{
	        if (! arg)
        	        return notify_fail("你想攻击谁？\n");

        	if (sscanf(arg, "%s with %s", target, item) != 2)
                	return notify_fail("你要用什么攻击对手？(shot <对"
                                           "象> with <利器>)\n");

        	if (! objectp(ob = present(item, me)))
                	return notify_fail("你身上没有 " + item + " 这样物"
                                           "品可以发射。\n");

	        if (! ob->is_arrow())
        	        return notify_fail("这不是箭，你无法发射。\n");

	        if ((amount = ob->query_amount()) < 1)
        	        return notify_fail("你身上的" + ob->name() + "不够"
                                           "用了。\n");

	        if (! objectp(victim = present(target, env)))
        	        return notify_fail("这里没有这个人。\n");

	        if (! victim->is_character() || victim->query("not_living"))
        	        return notify_fail("看清楚了，那不是活人！\n");

	        if (! me->is_fighting(victim))
        	        return notify_fail("你只能射击战斗中的对手。\n");
	} else
	{
        	if (! objectp(ob = present("arrow", me))
                   || ! ob->is_arrow()
                   || (amount = ob->query_amount()) < 1)
        	        return notify_fail("射击失败。\n");

                me->clean_up_enemy();
                victim = me->select_opponent();
	}

        if (me->query("special_skill/accuracy"))
	        my_exp = me->query("combat_exp") * 3;//强化精准射击
		else
	        my_exp = me->query("combat_exp");

        v_exp = victim->query("combat_exp");

        if (my_exp < 100000)
                return notify_fail("你实战经验太浅，难以运用" + name() + "射击对手。\n");

        switch (random(3))
        {
        case 0:
                msg = HIY "$N" HIY "左手猛地抬起" + name() + HIY "，随手抽出一"
                      + ob->query("base_unit") + ob->name() + HIY "，「嗖」的一"
                      "声直射$n" HIY "而去！\n" NOR;
                break;

        case 1:
                msg = HIY "电光火石间$N" HIY "举起" + name() + HIY "陡然射出一"
                      + ob->query("base_unit") + ob->name() + HIY "，带着箭啸直"
                      "奔$n" HIY "而去！\n" NOR;
                break;

        default:
                msg = HIY "霎时只听「嗖」的一声破空声响，那" + ob->query("base_unit")
                      + ob->name() + HIY "已从$N" HIY "的" + name() + HIY "弦上"
                      "射出，飞贯向$n" HIY "！\n" NOR;
                break;
        }

        ap = my_exp * query("accuracy") / 100;
        if (userp(victim)) ap /= 2;

        if (v_exp / 2 + random(v_exp) > query("power") && 
            ap / 5 + random(ap) < v_exp || random(v_exp) > 300000)
        {
                switch (random(3))
                {
                case 0:
                        msg += CYN "却见$n" CYN "轻轻一闪，已将$N" CYN "射出"
                               "的箭避了开去。\n" NOR;
                        break;
                case 1:
                        msg += CYN "只见$n" CYN "不慌不忙，身子向一旁横移数"
                               "尺，躲开了$N" CYN "这一招。\n" NOR;
                        break;
                default:
                        msg += CYN "可是$n" CYN "身子往后一仰，顿时让$N" CYN
                               "射出的箭落空。\n";
                        break;
                }
        } else
        {
                msg += COMBAT_D->do_damage(me, victim, ob,
                                           ob->query("weapon_prop/damage"),
                                           ob->query("wound_percent"),
                                           HIR "只见$p" HIR "一个闪避不及，正中$P"
                                           HIR "这一" + ob->name() + HIR "，登时"
                                           "鲜血飞溅！\n" NOR);
        }
        ob->add_amount(-1);
        me->start_busy(2);
        me->receive_damage("jing", 10);

        message_combatd(msg, me, victim);
        return 1;
}
