// updateall.c
// by Doing

#include <ansi.h>

inherit F_CLEAN_UP;

int update_dir(object me, string dir, int continueable, int *total);
int update_file(object me, string file);

int main(object me, string arg)
{
    string dir;
    int continueable;
    int *total = ({0});

    if (! SECURITY_D->valid_grant(me, "(admin)"))
        return 0;

    seteuid(geteuid(me));

    continueable = 0;
    if (! arg || sscanf(arg, "%s %d", dir, continueable) != 2)
            dir = arg;

    if (! dir)
    {
        dir = me->query("cwd");
        if (! dir)
            return notify_fail("你要重新编译那个路径下档案？\n");
    } else
    {
        dir = resolve_path(me->query("cwd"), dir);
    }
    if (dir[strlen(dir) - 1] != '/')
        dir += "/";

    if (file_size(dir) != -2)
        return notify_fail("没有" + dir + "这个路径。\n");

    me->set("cwd", dir);

    message_system("整理批量档案中，请稍候...");
    if (! update_dir(me, dir, continueable, total))
    {
        write(HIR "编译遇到错误中止。\n" NOR);
    }

    if (total[0] > 0)
        write(HIC "总共有" + HIW + total[0] + HIC "个档案被成功编译！\n" NOR);
    else
        write(HIC "没有编译任何档案。\n" NOR);

    return 1;
}

int update_dir(object me, string dir, int continueable, int *total)
{
    int i;
    int l;
    int filecount, compcount;
    mixed *file;
    string filename;

    if (! is_root(previous_object()))
        return 0;
    // 不编译lib版本控制目录
    if (dir == "/.git/"
     || dir == "/cygdrive/"
     || dir == "/dev/"
     || dir == "/proc/"
     || dir == "/backup/"
     || dir == "/bin/"
     || dir == "/binaries/"
     || dir == "/data/"
     || dir == "/doc/"
     || dir == "/dump/"
     || dir == "/grant/"
     || dir == "/help/"
     || dir == "/log/"
     || dir == "/version/"
       )

        return 1;

    file = get_dir(dir, -1);
    if (! sizeof(file))
    {
        if (file_size(dir) == -2)
        {
            write(dir + "这个目录是空的。\n");
            log_file("empty_dir", dir + "\n");
        }
        else
            write("没有" + dir + "这个目录。\n");
            return 1;
    }

    write (HIY "开始编译目录" + dir + "下面的所有文件。\n" NOR);
    i = sizeof(file);
    compcount = 0;
    filecount = 0;
    while (i--)
        {
        reset_eval_cost();
        if (file[i][1] != -2)
                {
                    filecount++;
                    filename = file[i][0];
                    l = strlen(filename);
                    if (filename[l - 1] != 'c' || filename[l - 2] != '.')
                        continue;

                    if (! update_file(me, dir + filename) &&
                        ! continueable)
                            return 0;

                    compcount++;
                    total[0]++;
                    if ((compcount % 70) == 0)
                        write("\n");
                }

                // continue to compile next file
    }
        write(HIC "\n整理了目录" + dir + "下的" + HIW + filecount + HIC +
              "个文件，编译了其中" + HIW + compcount + HIC + "个档案。\n" NOR );

    i = sizeof(file);
    while (i--)
        {
        reset_eval_cost();
        if (file[i][1] == -2)
                {
                    file[i][0] += "/";
                    write("\n");
                    if (! update_dir(me, dir + file[i][0], continueable, total) &&
                        ! continueable)
                            return 0;
                }
        }
    return 1;
}

int update_file(object me, string file)
{
    object obj;
    object *inv;
    string err;
    int i;

    if (file == "/cmds/adm/updateall.c")
        // Don't re-compile the updateall.c
        return 1;

        write (".");
    if (obj = find_object(file))
        {
        if (obj == environment(me))
                {
            if (file_name(obj) == VOID_OB)
                return notify_fail("\n你不能在 VOID_OB 里重新编译 VOID_OB。\n");

            inv = all_inventory(obj);
            i = sizeof(inv);
            while(i--)
                        {
                if (userp(inv[i])) inv[i]->move(VOID_OB, 1);
                else inv[i] = 0;
                        }
        }
        destruct(obj);
    }

    if (obj) return notify_fail("\n无法清除旧程式码。\n");

    err = catch( call_other(file, "???") );
    if (err)
    {
        printf( "\n发生错误：\n%s\n", err );
            return 0;
    } else
    {
        if ((i = sizeof(inv)) && (obj = find_object(file)))
        {
            while(i--)
                if (inv[i] && userp(inv[i])) inv[i]->move(obj, 1);
        }
    }

    return 1;
}

int help(object me)
{
  write(@HELP
指令格式 : updateall <路径名> [1]

这个指令可以更新某个路径下的全部档案, 并将新档的内容载入记
忆体内. 如果后面尾随标志1， 则编译遇到错误时将不会中止。
HELP
    );
    return 1;
}
