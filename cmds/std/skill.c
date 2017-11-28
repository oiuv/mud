// skill.c
// edit by smallfish
// Updated by vin for heros.cn

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

string *valid_types = ({
        "force",
        "dodge",
        "unarmed",
        "cuff",
        "strike",
        "finger",
        "hand",
        "claw",
        "sword",
        "blade",
        "staff",
        "hammer",
        "club",
        "whip",
        "dagger",
        "throwing",
        "parry",
        "magic",
        "medical",
        "poison",
        "chuixiao-jifa",
        "tanqin-jifa",
        "guzheng-jifa",
        "cooking",
});

int main(object me, string arg)
{
        string file, dir, filename;
        string msg, msg1;
        int i, j, l, is_force;
        mixed *all_file;

        seteuid(getuid());

        if (! arg)
                return notify_fail("指令格式：skill  <技能名称> | <技能中文名>\n");

        if (! stringp(file = SKILL_D(arg)) || file_size(file + ".c") <= 0)
        {
                // 英文的找不到？那就找中文名
                if (! stringp(arg = CHINESE_D->find_skill(arg)))
                        return notify_fail("没有这种技能存在。\n");

                // 根据中文名找到了英文名，看看是否真的有此技能
                if (! stringp(file = SKILL_D(arg)) || file_size(file + ".c") <= 0)
                        return notify_fail("没有这种技能存在。\n");
        }

        msg = "关于" + to_chinese(arg) + "的详细属性如下：\n";
        msg += HIC "≡" HIY "──────────────────"
               "────" HIC "≡\n" NOR;
        msg += WHT + "  武功名称：  " HIG + arg + "\n" + NOR;
        msg += WHT + "  中文名称：  " HIG + to_chinese(arg) + "\n" + NOR;

        is_force = 0;

        if (SKILL_D(arg)->valid_enable("force"))
                is_force = 1;

        if (member_array(arg, valid_types) != -1)
        {
                msg += WHT "  武功所属：  " HIG "基本武功\n" NOR;
                msg += HIC "≡" HIY "──────────────"
                       "────────" HIC "≡\n" NOR;
                write(msg);
                return 1;
        }

        if (! wizardp(me) && me->query_skill(arg) <= 0)
        {
                msg += HIC "≡" HIY "──────────────"
                       "────────" HIC "≡\n" NOR;
                write(msg);
                return 1;
        }

        // 查询武功的 pfm 情况
        msg1 = "";
        j = 0;
        dir = file;

        if (dir[strlen(dir) - 1] != '/')
                dir += "/";

        if (is_force)
                dir += "perform/";

        if (file_size(dir) != -2)
                msg1 += "";
        else
        {
                all_file = get_dir(dir);
                if (! sizeof(all_file))
                        msg1 += "";
                else
                {
                        for (i = 0; i < sizeof(all_file); i++)
                        {
                                filename = all_file[i];
                                l = strlen(filename);
                                if (filename[l - 1] == 'c' && filename[l - 2] == '.')
                                {
                                        j++;
                                        msg1 += sprintf(HIY "%s  " NOR, filename[0..l-3]);
                                }
                        }

                        if (msg1 != "")
                        {
                                msg += WHT "  武功绝招：  " NOR;
                                msg += msg1;
                                msg += "\n";
                        }
                }
        }

        // 查询内功的 exert 情况
        if (! is_force)
        {
                msg += HIC "≡" HIY "──────────────"
                       "────────" HIC "≡\n" NOR;
                write(msg);
                return 1;
        }

        msg1 = "";
        j = 0;

        dir = file;

        if (dir[strlen(dir) - 1] != '/')
                dir += "/";
 
        if (file_size(dir + "exert/") == -2)
                all_file = get_dir(dir + "exert/");
        else
        if (file_size(dir) == -2)
                all_file = get_dir(dir);
        else
        {
                msg += HIC "≡" HIY "──────────────"
                       "────────" HIC "≡\n" NOR;
                write(msg);
                return 1;
        }

        if (! sizeof(all_file))
        {
                write(msg);
                return 1;
        }

        for (i = 0; i < sizeof(all_file); i++)
        {
                filename = all_file[i];
                l = strlen(filename);
                if (filename[l - 1] == 'c' && filename[l - 2] == '.')
                {
                        j++;
                        msg1 += sprintf(HIW "%s  " NOR, filename[0..l-3]);
                }
        }

        if (msg1 != "")
        {
                msg += WHT "  内功功能：  " NOR;
                msg += msg1;
                msg += "\n";
        }

        msg += HIC "≡" HIY "──────────────────"
               "────" HIC "≡\n" NOR;
        write(msg);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式：skill  <技能名称> | <技能中文名>

这个指令让你检查指定的某种武功或技能（技能名称可输入中
文名）如果你本身具备这项技能，则会显示出该技能的绝招及
特殊功能。

相关指令：skills

HELP);
        return 1;
}
