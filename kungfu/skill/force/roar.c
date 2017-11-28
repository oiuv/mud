// roar.c
// By Vin for heros.cn

#include <ansi.h>
inherit F_CLEAN_UP;

int exert(object me, object target)
{
        object *ob;
        int f, i, skill, damage;
        string msg;

        f = me->query_skill_mapped("force");
        skill = me->query_skill("force");

        if (me->query_skill_mapped("force") != "longxiang-gong"
           && me->query_skill_mapped("force") != "tianhuan-shenjue"
           && me->query_skill_mapped("force") != "huntian-qigong"
           && me->query_skill_mapped("force") != "jiuyang-shengong"
           && me->query_skill_mapped("force") != "jiuyin-shengong"
           && me->query_skill_mapped("force") != "kuihua-mogong"
           && me->query_skill_mapped("force") != "xixing-dafa"
           && me->query_skill_mapped("force") != "zhanshen-xinjing"
           && me->query_skill_mapped("force") != "yijinjing"
           && me->query_skill_mapped("force") != "hunyuan-gong")
                return notify_fail("你所学的内功中没有这种功能。\n");

        if (skill < 180)
                return notify_fail("你的内功修为不够。\n");

        if (environment(me)->query("no_fight"))
                return notify_fail("在这里不能攻击他人。\n");

        // 执行天书任务的特殊房间防止龙吟中断剧情。
        if (environment(me)->query("skybook"))
                return notify_fail("在这里不能攻击他人。\n");

        if ((int)me->query("neili") < 800)
                return notify_fail("你的真气不够。\n");

        me->add("neili", -300);

        me->start_busy(5);

        switch (f)
        {
        case "longxiang-gong" :
                msg = HIW "$N" HIW "运转真气，面无表情，歌声如梵唱般"
                      "贯入众人耳中。\n" NOR;
                break;

        case "huntian-qigong" :
                msg = HIY "$N" HIY "深深吸入一囗气，运足内力发出一阵"
                      "长啸，音传百里，慑人心神。\n" NOR;
                break;

        case "jiuyang-shengong" :
                msg = HIY "$N" HIY "仰天长啸，声音绵泊不绝，众人无不"
                      "听得心驰神摇。\n" NOR;
                break;

        case "jiuyin-shengong" :
                msg = HIY "$N" HIY "气凝丹田，猛然一声断喝，声音远远"
                      "的传了开去，激荡不止。\n" NOR;
                break;

        case "kuihua-mogong" :
                msg = HIY "$N" HIY "蓦地极嘶长呼，声音凄厉之极，令人"
                      "毛骨悚然。\n" NOR;
                break;

        case "yijinjing" :
        case "hunyuan-gong" :
                msg = HIY "$N" HIY "深深吸入一囗气，运起金刚禅狮子吼"
                      "，发出惊天动地的一声巨吼。\n" NOR;
                break;

        default:
                msg = HIY "$N" HIY "深深吸入一囗气，体内" + to_chinese(f) +
                      HIY "真气急剧迸发，陡然一声巨啸。\n" NOR;
                break;
        }
        msg += "\n";
        message_combatd(msg, me);

        ob = all_inventory(environment(me));

        for (i = 0; i < sizeof(ob); i++)
        {

                if (! living(ob[i]) || ob[i] == me)
                        continue;

                if (skill / 2 + random(skill / 2) < (int)ob[i]->query("con") * 2)
                        continue;

                // 被死亡保护的玩家不受伤害
                if ((int)ob[i]->query_condition("die_guard"))
                        continue;

                damage = skill - ((int)ob[i]->query("max_neili") / 10);

                if (damage > 0)
                {
                        ob[i]->receive_damage("jing", damage * 2, me);

                        if ((int)ob[i]->query("neili") < skill * 2)
                                ob[i]->receive_wound("jing", damage, me);

                        tell_object(ob[i], HIR "突然间你只觉两耳一阵轰鸣，眼前金"
                                           "星乱冒，整个头便是要裂开一般。\n" NOR);

                        switch (random(3))
        		{
        		case 0 :
                		msg = WHT "突然只见" + ob[i]->name() + WHT "两手"
                                      "抱头，双目凸出，嘴角泛出些许白沫，喉咙咯咯"
                                      "作响。\n" NOR;
                		break;

		        case 1 :
                		msg = WHT "顿时听得" + ob[i]->name() + WHT "一声"
                                      "惨叫，两眼发直，全身不住颤抖，蓦地呕出一口"
                                      "鲜血。\n" NOR;
                		break;

		        default :
                		msg = WHT "却见" + ob[i]->name() + WHT "竟摔倒在"
                                      "地，发出声声哀嚎，双目双耳及鼻孔均渗出丝丝"
                                      "鲜血。\n" NOR;
                		break;
        		}
                        message("vision", msg, environment(ob[i]), ({ob[i]}));

                        if ((int)ob[i]->query("jing") < 1
                           || (int)ob[i]->query("eff_jing") < 1)
                                ob[i]->unconcious(me);

                        if (objectp(ob[i]) && ! living(ob[i]))
                        {
                                ob[i]->add("jing", 10);
                                ob[i]->add("eff_jing", 10);
                        }
                }
                me->want_kill(ob[i]);
                me->fight_ob(ob[i]);
                ob[i]->kill_ob(me);
        }
        return 1;
}
