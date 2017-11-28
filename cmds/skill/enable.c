// enable.c

#include <ansi.h>

inherit F_CLEAN_UP;

mapping valid_types = ([
        "unarmed":      "拳脚",
        "sword":        "剑法",
        "blade":        "刀法",
        "staff":        "杖法",
        "hammer":       "锤法",
        "club" :        "棍法",
        "throwing":     "暗器",
        "force":        "内功",
        "parry":        "招架",
        "dodge":        "轻功",
        "magic":        "法术",
        "whip":         "鞭法",
        "dagger":       "短兵",
        "finger":       "指法",
        "hand":         "手法",
        "cuff":         "拳法",
        "claw":         "爪法",
        "strike":       "掌法",
        "medical":      "医术",
        "poison":       "毒技",
        "cooking":      "厨艺",
        "chuixiao-jifa" : "吹萧",
        "guzheng-jifa"  : "古筝",
        "tanqin-jifa"   : "弹琴",
]);

int main(object me, string arg)
{
        mapping map;
        //string *types, *skill, ski, map_to;
        string *skill, ski, map_to;
        string msg;
        int i, modify;

        seteuid(getuid());

        if (! arg)
        {
                map = me->query_skill_map();
                if (! mapp(map) || sizeof(map) == 0)
                        return notify_fail("你现在没有使用任何特殊技能。\n");

                skill = keys(valid_types);
                msg = "以下是你目前使用中的特殊技能。\n";
                for (i = 0; i < sizeof(skill); i++)
                {
                        if (undefinedp(map[skill[i]]))
                                continue;

                        if (! me->query_skill(skill[i]))
                                continue;

                        modify = me->query_temp("apply/" + skill[i]);
                        msg += sprintf("  %-20s： %-20s  有效等级：%s%3d\n" NOR,
                                valid_types[skill[i]] + " (" + skill[i] + ")",
                                undefinedp(map[skill[i]]) ? "无" : to_chinese(map[skill[i]]),
                                (modify==0 ? "" : (modify>0 ? HIC : HIR)),
                                me->query_skill(skill[i]));
                }
                write(msg);
                return 1;
        }

        if (arg == "?" )
        {
                msg = "以下是可以使用特殊技能的种类：\n";
                skill = sort_array(keys(valid_types), (: strcmp :) );
                for (i = 0; i < sizeof(skill); i++)
                        msg += sprintf("  %s (%s)\n", valid_types[skill[i]], skill[i]);
                write(msg);
                return 1;
        }

        if (sscanf(arg, "%s %s", ski, map_to) != 2)
                return notify_fail("指令格式：enable|jifa [<技能种类> <技能名称>|none]\n");

        if (undefinedp(valid_types[ski]))
                return notify_fail("没有这个技能种类，用 enable ? 可以查看有哪些种类。\n");

        if (map_to == "none")
        {
                me->map_skill(ski);
                me->reset_action();
                write(HIW "你从现在起取消" HIG + CHINESE_D->chinese(ski) +
                      HIW "的特殊技能。\n"NOR);
                return 1;
        } else if (map_to == ski)
        {
                write("「" + to_chinese(ski) + "」是所有" + valid_types[ski] +
                      "的基础，不需要 enable。\n");
                return 1;
        }

        if (me->query_skill_mapped(ski) == map_to)
                return notify_fail("你现在正激发这种技能呢。\n");

        if (me->query_skill(map_to, 1) < 1)
                return notify_fail("你不会这种技能。\n");

        if (me->query_skill(ski, 1) < 1)
                return notify_fail("你还不会半点" + to_chinese(ski) + "呢。\n");

        if (! SKILL_D(map_to)->valid_enable(ski))
                return notify_fail("这个技能不能当成这种用途。\n");

        me->map_skill(ski, map_to);
        me->reset_action();
        write(HIW "你从现在起用" HIR + CHINESE_D->chinese(map_to) +
              HIW "作为" HIG + CHINESE_D->chinese(ski) + HIW "的特殊技能。\n" NOR);

        if (ski == "magic")
        {
                write("你改用另一种法术系，精力必须重新锻练。\n");
                me->set("jingli", 0);
                me->receive_damage("jing", 0);
        }
        else if (ski == "force")
        {
                write("你改用另一种内功，内力必须重新锻练。\n");
                me->set("neili", 0);
                me->receive_damage("qi", 0);
        }

        return 1;
}
int help(object me)
{
        write(@HELP
指令格式 : enable|jifa [<技能种类> <技能名称> | none]
           enable|jifa ?

这个指令让你指定所要用的技能，需指明技能种类和技能名称。如果不加参
数则会显示出技能种类及你目前所使用的技能名称 ，如果加一个？会列出
所有能使用特殊技能的技能种类。

HELP );
        return 1;
}
