// backupd.c

#include <ansi.h>
#include <localtime.h>
#include <command.h>

inherit F_DBASE;

#define BACKUP_DATE     15               // the oldest's backup (days) 保留半个月内的备份

STATIC_VAR_TAG int state;

#define SLEEPING        0
#define GET_READY       1
#define GET_READY_2     2
#define BACKUPING       3

#define CMD_RM          "/cmds/wiz/rm"
#define CMD_CP          "/cmds/wiz/cp"

STATIC_VAR_TAG int *tlist = ({ 0, 550, 559, 600 });
STATIC_VAR_TAG int *hlist = ({ 45, 1, 1, 1 });

// 通知一次准备的时间：凌晨5:50分
// 通知再次准备的时间：凌晨5:59分
// 开始进行备份的时间：凌晨6:00分
// 凌晨六点以后到第二天凌晨5:50分之前属于休眠状态

// 提供给外面的接口函数
void backup_data();

// 内部使用的函数
private void remove_backup(mixed lt);
private void check_all_player();
private void change_state(int new_state);
private void sys_info(string msg);
private int assure_not_exist(string bkdir);
private int is_recent_time(int y, int m, int d, int cy, int cm, int cd);

// return the time of prompt
int is_backuping()              { return state != SLEEPING; }

// return the time of backup
int query_backup_time()         { return tlist[BACKUPING]; }

void create()
{
        seteuid(ROOT_UID);
        set("channel_id", "备份精灵");
        sys_info("备份系统已经启动。");
        state = SLEEPING;
        set_heart_beat(hlist[state]);
}

int clean_up()
{
        return 1;
}

void heart_beat()
{
        mixed lt;
        int ti;

        seteuid(ROOT_UID);
        lt = localtime(time());
        ti = lt[LT_HOUR] * 100 + lt[LT_MIN];

        switch(state)
        {
        case SLEEPING:
                if (ti < tlist[GET_READY] || ti > tlist[GET_READY_2])
                        // not change state
                        break;
                // chanage state to "GET_READY";
                change_state(GET_READY);
                break;

        case GET_READY:
                if (ti < tlist[GET_READY_2])
                        break;

                // change state to "GET_READY_2";
                change_state(GET_READY_2);
                break;

        case GET_READY_2:
                if (ti < tlist[BACKUPING])
                        break;

                // change state to "GET_READY_2";
                change_state(BACKUPING);

                // the last function will change to "SLEEPING" state
                // after backing
                break;

        default:
                change_state(SLEEPING);
                break;
        }

        // reset heart beat
        set_heart_beat(hlist[state]);
}

private void change_state(int new_state)
{
        mixed lt;

        lt = localtime(time());
        switch (new_state)
        {
        case GET_READY:
        case GET_READY_2:
                if (lt[LT_HOUR] * 100 + lt[LT_MIN] != tlist[BACKUPING])
                {
                        message_system(sprintf("现在是 %d 点 %d 分，系统将在 %d 点 %d 分"
                                       "自动备份所有玩家的数据，期间游戏会有停滞。",
                                       lt[LT_HOUR], lt[LT_MIN],
                                       (tlist[BACKUPING] / 100) % 100,
                                       tlist[BACKUPING] % 100));
                        break;
                } else
                        new_state = BACKUPING;

        case BACKUPING:
                state = new_state;
                message_system(sprintf(HIY "现在是 %d 点 %d 分，系统开始"
                                       "自动备份所有玩家数据，请稍候..." NOR,
                                       lt[LT_HOUR], lt[LT_MIN]));

                backup_data();

                message_system(sprintf(HIC "系统已经处理完备份工作。" NOR,
                                       lt[LT_HOUR], lt[LT_MIN]));

                // after backup, change state to SLEEPING
                new_state = SLEEPING;
                break;

        case SLEEPING:
                break;
        }

        // change to new state
        state = new_state;
        return;
}

// backup
// copy current /DATA to /BACKUP_DIR/yyyy.mm.dd, if the directory
// has been existed, then remove the directory first.
// after that, I will check wether the other directory in backup
// directiry was the backup of recently(BACKUP_DATE days), if not,
// I will remove it.
void backup_data()
{
        string bkdir;
        mixed lt;
        int count;

        if (! is_root(previous_object()))
        {
                write(HIR "YOU HAVE NO ACCESS TO BACKUP\n" NOR);
                return;
        }

        seteuid(getuid());

        sys_info("备份工作开始。");
        lt = localtime(time());

        // because LT_MON is from 0..11, so I must add 1
        lt[LT_MON]++;
        bkdir = sprintf("%s%d-%d-%d", BACKUP_DIR,
                        lt[LT_YEAR], lt[LT_MON], lt[LT_MDAY]);
        if (! assure_not_exist(bkdir))
        {
                sys_info(sprintf("备份失败：无法删除(%s)。", bkdir));
                return;
        }

        // backup data
        count = CMD_CP->copy_dir(DATA_DIR, bkdir);
        if (count)
                sys_info(sprintf("总共有%d个文件被保存到(%s)中。", count, bkdir));

        call_out("remove_backup", 1, lt);
}

// 删除以前的备份
void remove_backup(mixed lt)
{
        object *obs;
        mixed *file;
        int i;

        // clear the older backup data
        file = get_dir(BACKUP_DIR, -1);
        for (i = 0; i < sizeof(file); i++)
        {
                int y, m, d;

                reset_eval_cost();
                if (file[i][1] != -2)
                        // not directory
                        continue;

                if (sscanf(file[i][0], "%d-%d-%d", y, m, d) != 3)
                        // not backup directory
                        continue;

                if (is_recent_time(y, m, d, lt[LT_YEAR], lt[LT_MON], lt[LT_MDAY]))
                        // is the receant backup, won't delete
                        continue;

                CMD_RM->rm_dir(BACKUP_DIR + file[i][0]);
                sys_info(sprintf("备份(%s)已经被自动删除。", file[i][0]));
        }

        // update all loging object
        obs = users();
        for (i = 0; i < sizeof(obs); i++)
                if (obs[i]->is_loging_now())
                {
                        obs[i]->end_log();
                        obs[i]->start_log();
                }

        // 为了显示正确的时间，所以使用 call_out 呼叫。
        call_out("sys_info", 0, "备份工作完毕。");

        // 10s以后检查所有的玩家
        call_out("check_all_player", 1);
}

// 检查所有玩家
private void check_all_player()
{
        message_system("系统开始核查所有玩家，并清除长时间不上线的使用者...");
        sys_info("系统开始检查所有玩家。");

        EXAMINE_CMD->search_dir(0, 1);

        // 为了显示正确的时间，所以使用 call_out 呼叫。
        call_out("sys_info", 0, "系统检查所有玩家完毕。");
}

// check that y/m/d wether or not close cy/cm/cd(current time)
private int is_recent_time(int y, int m, int d, int cy, int cm, int cd)
{
        if (y > cy) return 1;   // future backup? laugh
        if (y == cy)
        {
                // the same year
                if (m > cm) return 1;   // maybe future backup
                if (m == cm)
                {
                        // the same month
                        if (d <= cd - BACKUP_DATE) return 0;
                        return 1;
                }
                if (m != cm - 1) return 0;
                switch (m)
                {
                case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                        cd += 31;
                        break;
                case 2:
                        cd += 28;
                        if ((y % 4) == 0 && (y % 100) != 0) cd++;
                        break;
                default:
                        cd += 30;
                        break;
                }
                if (d <= cd - BACKUP_DATE) return 0;
                return 1;
        }
        if (y != cy - 1) return 0;
        if (m != 12 || cm != 1) return 0;
        cd += 31;
        if (d <= cd - BACKUP_DATE) return 0;
        return 1;
}

private int assure_not_exist(string bkdir)
{
        switch (file_size(bkdir))
        {
        case -1:
                return 1;

        case -2:
                CMD_RM->rm_dir(bkdir);
                return (file_size(bkdir) == -1);

        default:
                return rm(bkdir);
        }
}

private void sys_info(string msg)
{
        CHANNEL_D->do_channel(this_object(), "sys", msg);
        log_file("backup", log_time() + ": " + msg + "\n");
}
