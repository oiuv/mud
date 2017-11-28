#include <ansi.h>
inherit F_CLEAN_UP;

int main(object me, string arg)
{
        mapping skill_status;
        object ob;
        string skill, obj;
        string *skills;
        string file;
        int i, j, level;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
                return notify_fail("指令格式：setsk <某人> [ <技"
                                   "能> | all ] <级别数>\n");

        if (sscanf(arg, "%s %s %d", obj, skill, level) != 3
           && sscanf(arg, "%s %d", skill, level) != 2)
                return notify_fail("指令格式：setsk <某人> [ <技"
                                   "能> | all ] <级别数>\n");

        if (sscanf(arg, "%s %d", skill, level) == 2)
        {
                ob = me;
        } else
        if (sscanf(arg, "%s %s %d", obj, skill, level) == 3)
        {
                ob = find_player(obj);

                if (! ob)
                        ob = find_living(obj);

                if (! ob)
                        ob = present(obj, environment(me));

                if (! ob)
                        return notify_fail("目标不存在，如果是设定自身"
                                           "技能，目标参数可作缺省。\n");
        }

        if (wiz_level(me) <= wiz_level(ob) && me != ob)
                return notify_fail("你只能给权限比自己低的人设定技能。\n");

        if (! is_root(me) && playerp(ob) && ! wizardp(ob))
                return notify_fail("只有天神才能给玩家设定技能。\n");

        if (skill == "all")
        {
                if (! (skill_status = ob->query_skills())
                   || ! sizeof(skill_status))
                        return notify_fail("目标没有学会任何技能，无法"
                                           "使用 all 参数。\n");

                skills  = keys(skill_status);
                j = sizeof(skill_status);

                write(WHT "\n");

                for (i = 0; i < j; i++)
                {
                        if (level == 0)
                        {
                                ob->delete_skill(skills[i]);
                                printf("目标：" CYN "%s" WHT "  取消技能："
                                       CYN "%s\n" WHT, ob->name() + "(" +
                                       ob->query("id") + ")", to_chinese(skills[i]) +
                                       "(" + skills[i] + ")");
                        } else
                        {
                                ob->set_skill(skills[i], level);
                                printf("目标：" CYN "%s" WHT "  设定技能："
                                       CYN "%-30s " WHT "等级：" CYN "%d\n"
                                       WHT, ob->name() + "(" + ob->query("id") + ")",
                                       to_chinese(skills[i]) + "(" + skills[i] + ")",
                                       level);
                        }
                }
                write("\n" NOR);
        } else
        {
                if (! stringp(file = SKILL_D(skill))
                   || file_size(file + ".c") <= 0)
                        return notify_fail("没有 " + skill + " 这种技能存在。\n");

                write(WHT);

                if (level == 0)
                {
                        ob->delete_skill(skill);
                        printf("目标：" CYN "%s" WHT "  取消技能："
                               CYN "%s\n" WHT, ob->name() + "(" +
                               ob->query("id") + ")", to_chinese(skill) +
                               "(" + skill + ")");
                } else
                {
                        ob->set_skill(skill, level);
                        printf("目标：" CYN "%s" WHT "  设定技能："
                               CYN "%-30s " WHT "等级：" CYN "%d\n"
                               WHT, ob->name() + "(" + ob->query("id") + ")",
                               to_chinese(skill) + "(" + skill + ")", level);
                }
                write(NOR);
        }
        return 1;
}

int help()
{
        write(@LONG
指令格式：setsk  <某人>  [ <技能> | all ]  <级别数>

用来设定某人的某种技能的级别数，如果第二项是 all则将其所有的
技能改为设定的级别数。如果选择了级别数为零则删除该人此项技能。
如果没有指定对象，则系统默认对象为使用者。

LONG);
        return 1;
}
