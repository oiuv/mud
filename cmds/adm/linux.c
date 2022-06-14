// linux.c
// by zjpwxh@sjpl 2004.5.5
// 注意不要直接转换根目录，文件太多的话会当掉哦

#include <ansi.h>
inherit F_CLEAN_UP;

#define CRLF sprintf("%c%c", 13, 10)
#define LF sprintf("%c", 10)

void convert_dir(object me, string dir, int *total);
int convert_file(object me, string file);

int main(object me, string arg)
{
    int *total = ({0});

    seteuid(geteuid(me));

    if (!arg)
    {
        arg = me->query("cwd");
        if (!arg)
            return notify_fail("指令格式：linux <路径>\n");
    }
    else
    {
        arg = resolve_path(me->query("cwd"), arg);
    }

    if (arg[strlen(arg) - 1] != '/')
        arg += "/";
    if (file_size(arg) != -2)
        return notify_fail("没有这个目录！\n");

    write(HIW "批量档案转换中，请稍候...\n" NOR);
    convert_dir(me, arg, total);

    if (total[0] > 0)
        write(HIC "总共有" + HIW + total[0] + HIC "个档案被成功转换为linux格式！\n" NOR);
    else
        write(HIC "没有转换任何档案。\n" NOR);
    return 1;
}

void convert_dir(object me, string dir, int *total)
{
    int i, count;
    mixed *file;
    string filename;

    file = get_dir(dir, -1);
    if (!sizeof(file))
    {
        if (file_size(dir) == -2)
        {
            write(dir + "这个目录是空的。\n");
            log_file("empty_dir", dir + "\n");
        }
        else
            write("没有" + dir + "这个目录。\n");
    }
    write(HIY "开始转换目录" + dir + "下面的所有文件。\n" NOR);

    count = 0;
    i = sizeof(file);

    while (i--)
    {
        reset_eval_cost();
        if (file[i][1] != -2)
        {
            filename = file[i][0];
            if (sscanf(file[i][0], "%*s.o"))
                continue;
            if (convert_file(me, dir + filename))
                ;
            {
                count++;
                total[0]++;
            }
            if ((count % 70) == 0)
                write("\n");
        }
    }
    write(HIC "\n转换了目录" + dir + "下的" + HIW + count + HIC + "个文件。\n" NOR);

    //if( total[0] > 3000 )       return;

    i = sizeof(file);
    while (i--)
    {
        reset_eval_cost();
        if (file[i][1] == -2)
        {
            file[i][0] += "/";
            write("\n");
            convert_dir(me, dir + file[i][0], total);
        }
    }
}

int convert_file(object me, string file)
{
    string msg;

    if (file_size(file) < 0)
    {
        write("没有" + file + "这个档案。\n");
        return 0;
    }
    me->set("cwf", file);
    write(".");
    file = resolve_path(me->query("cwd"), file);
    msg = read_file(file);

    if (!msg)
    {
        write(sprintf("read file %s error!\n", file));
        return 0;
    }

    msg = replace_string(msg, CRLF, LF);
    write_file(file, msg, 1);

    return 1;
}
