// restore.c

#include <ansi.h>
#include <localtime.h>
#include <command.h>

inherit F_CLEAN_UP;

private string get_backup_data_dir(string user, int day);
private void   clear_user_data(object ob);
int     help(object me);

int main(object me, string arg)
{
        int day;
        string user;
        string dir;
        string flogin, fuser;
        string dump_apply;
        string msg;
        object ob, link_ob;
        int clear_flag;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (BACKUP_D->is_backuping())
        {
                write("注意：自动备份马上就要开始工作，现在不能执行恢复操作。\n");
                return 1;
        }

	if (! arg)
                return help(me);

        if (sscanf(arg, "-c %s", arg) || sscanf(arg, "%s -c", arg))
                // 调入该玩家以后清除必要的数据
                clear_flag = 1;
        else
                clear_flag = 0;

        if (sscanf(arg, "%s from %d", user, day) != 2)
        {
                if (sscanf(arg, "%s from last", user) == 1)
                        day = 1;
                else
                if (sscanf(arg, "%s from temp", user) == 1)
                        day = 0;
                else
                if (sscanf(arg, "%s from dump/%s", user, dump_apply) == 2)
                        day = -1;
                else
                {
                        user = arg;
                        day = 1;
                }
        }

        if (day < -1 || day > 7)
        {
                write("没有这个备份数据区。\n");
                return 1;
        }

	seteuid(getuid());
        if (day == -1)
        {
                // restore from dump
                dir = DUMP_DIR + dump_apply;
                if (dir[strlen(dir) - 1] != '/')
                        dir += "/";
        } else
        if (day == 0)
                // restore from temp
                dir = TEMP_DIR;
        else
                // restore from backup
                dir = get_backup_data_dir(user, day);

        flogin = "login/" + user[0..0] + "/" + user + __SAVE_EXTENSION__;
        fuser  = "user/"  + user[0..0] + "/" + user + __SAVE_EXTENSION__;

        msg = HIM "开始恢复玩家(" + user + ")的备份数据。\n\n" NOR;
        // check the backup data
        if (file_size(dir + flogin) < 0)
        {
                write(sprintf("%s缺少文件：%s，无法恢复。\n", msg, dir + flogin));
                return 1;
        }

        if (file_size(dir + fuser) < 0)
        {
                write(sprintf("%s缺少文件：%s，无法恢复。\n", msg, dir + fuser));
                return 1;
        }

        // remove current user's data
        if (file_size(DATA_DIR + flogin) >= 0 ||
            file_size(DATA_DIR + fuser) >= 0)
        {
                if (dir == TEMP_DIR)
                {
                        msg += "恢复保存在暂存区中的数据。\n";
                } else
                if (file_size(TEMP_DIR + flogin) >= 0 ||
                    file_size(TEMP_DIR + fuser) >= 0)
                {
                        msg += "由于暂存区(/temp/)下面已经存放了玩家"
                               "的数据，因此本次不作暂存。\n";
                } else
                {
                        // move current user's data to /temp/
                        assure_file(TEMP_DIR + flogin);
                        assure_file(TEMP_DIR + fuser);
                        cp(DATA_DIR + flogin, TEMP_DIR + flogin);
                        cp(DATA_DIR + fuser,  TEMP_DIR + fuser);
                        msg += "玩家目前的数据暂时保存到暂存区(/temp/)下。\n";
                }
                rm(DATA_DIR + flogin);
                rm(DATA_DIR + fuser);
                msg += "删除玩家目前的档案。\n";
        }

        // after remove, if the data existed ?
        if (file_size(DATA_DIR + flogin) >= 0 ||
            file_size(DATA_DIR + fuser) >= 0)
        {
                write(sprintf("%s没有能够成功的删除玩家现在的档案(%s)和(%s)。\n"
                       "请先查证然后再执行备份操作。\n",
                       msg, DATA_DIR + flogin, DATA_DIR + fuser));
                return 1;
        }

        // ok. copy the backup data to /data/
        assure_file(DATA_DIR + flogin);
        assure_file(DATA_DIR + fuser);
        cp(dir + flogin, DATA_DIR + flogin);
        cp(dir + fuser,  DATA_DIR + fuser);
        msg += sprintf("从(%s)中复制玩家的档案数据。\n", dir);

        // success ?
        if (file_size(DATA_DIR + flogin) < 0 ||
            file_size(DATA_DIR + fuser) < 0)
        {
                write(sprintf("%s没有能够成功的从(%s)中复制玩家的档案。\n",
                       msg, dir));
                return 1;
        }
        msg += sprintf("档案复制成功。\n");
        log_file("backup", sprintf("user %s has been restore by %s from %s.\n",
                                   user, geteuid(me), dir));

        // the player online?
        if (! (ob = find_player(user)))
        {
                write(msg);
                EXAMINE_CMD->main(me, "-u " + user);
                if (objectp(ob = find_player(user)))
                {
                        if (clear_flag)
                        {
                                tell_object(me, HIG "清除了玩家" + ob->name(1) + "的某些相关数据。\n" NOR);
                                clear_user_data(ob);
                        }
                } else
                        tell_object(me, HIG "无法载入该玩家。\n" NOR);
                return 1;
        }

        // restore the object
        tell_object(ob, HIM "\n从磁盘中载入你的数据，并重新设置。\n" NOR);
        if (! ob->restore())
        {
                write(sprintf("%s该用户无法读取备份的数据。\n", msg));
                return 1;
        }
        if (objectp(link_ob = ob->query_temp("link_ob")))
                link_ob->restore();

        write(msg);

        // re-setup the user
        ob->delete_temp("user_setup");
        ob->setup();
        if (! environment(ob))
        {
                tell_object(ob, HIC "\n由于你现在所处的环境不正常，需"
                                "要移动到巫师会客室。\n" NOR);
                ob->move("/d/wizard/guest_room");
                ob->set("startroom", "/d/wizard/guest_room");
        }

        // force look
        tell_object(ob, HIY  "> l\n" NOR);
        catch(ob->force_me("look"));

        // force hp
        tell_object(ob, HIY  "> hp\n" NOR);
        catch(ob->force_me("hp"));

        // force show
        ob->write_prompt();
        tell_object(ob, HIY "check backup data now\n" +
                        HIC "请检查你目前的状况是否正确。\n" NOR);
        if (ob != me)
                tell_object(me, HIC "\n玩家已经重新设置。\n\n" NOR);

        if (clear_flag)
        {
                write(HIG "清除了玩家" + ob->name(1) + "的某些相关数据。\n" NOR);
                clear_user_data(ob);
        }
	return 1;
}

// return the directory of the user
// dir/login/?/??? & dir/user/?/??? would be the user's data
private string get_backup_data_dir(string user, int day)
{
        mixed lt;
        int now;

        lt = localtime(time());
        lt[LT_MON]++;   // the month is from 0..31 so I will adjust it
        now = lt[LT_HOUR] * 100 + lt[LT_MIN];
        if (now > BACKUP_D->query_backup_time())
        {
                // because the o'clock has pass through the backuping
                // time, so the most recently backup data is of today
                day--;
        }

        lt[LT_MDAY] -= day;
        if (lt[LT_MDAY] > 0)
                return sprintf("%s%d-%d-%d/", BACKUP_DIR,
                               lt[LT_YEAR], lt[LT_MON], lt[LT_MDAY]);

        lt[LT_MON]--;
        switch (lt[LT_MON])
        {
        case 2:
                if ((lt[LT_YEAR] % 4) == 0 && (lt[LT_YEAR] % 100) != 0)
                        lt[LT_MDAY] += 29;
                else
                        lt[LT_MDAY] += 28;
                break;

        case 1: case 3: case 5: case 7: case 8: case 10:
                lt[LT_MDAY] += 31;
                break;

        case 4: case 6: case 9: case 11:
                lt[LT_MDAY] += 30;
                break;

        case 0: // last year
                lt[LT_MDAY] += 31;
                lt[LT_MON] = 12;
                lt[LT_YEAR] --;
        }

        return sprintf("%s%d-%d-%d/", BACKUP_DIR,
                       lt[LT_YEAR], lt[LT_MON], lt[LT_MDAY]);
}

private void clear_user_data(object ob)
{
        ob->delete("private_room");
        ob->delete("can_summon");
        ob->delete("couple");
        ob->delete("brothers");
        ob->delete("league");
        ob->set("balance", 0);
}

int help(object me)
{
write(@HELP
指令格式：restore [-c] <玩家ID> from <last | 1..7 | temp | dump>

从备份区恢复一个玩家的数据。其中 last 等效于１，表示从最近一
次的备份中恢复。玩家数据恢复时，当前的数据将被保存到一个暂存
区(如果暂存区空)，如果对玩家恢复的备份不满意，可以从 temp 中
恢复。玩家的数据恢复时，如果玩家在线上，将执行 restore 操作，
如果玩家此时数据不正常：包括没有环境或是没有 setup，将重新更
新玩家。如果玩家不在线上，该命令会自动将玩家调入游戏。当你处
理完毕必要的数据以后可以将该玩家踢出(kickout)游戏。

执行玩恢复操作以后应该将玩家的数据从暂存区中清除掉。

系统 SHUTDOWN 或者崩溃以后，所有的存盘数据包括玩家数据将被保
存到 dump 目录中，这是为了防止系统重新启动以后出现故障导致数
据受到损失，因此也可以从 dump 中恢复数据。

使用 -c 参数可以在恢复玩家数据以后清除玩家所有相关性的数据。
这是针对那些自杀以后恢复得玩家而言的，由于他们自杀所以所有的
相关性数据都会被清除，恢复以后应该清除他们自身的这些数据，避
免数据不一致。

注意：在备份系统第一次提出提示以后一直到备份完毕的过程中，不
能执行有关恢复玩家数据的操作。

相关指令：cleartemp, clear
HELP );
    return 1;
}
