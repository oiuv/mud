// CRLF.c
#include <ansi.h>
inherit CORE_CLEAN_UP;

#define CRLF sprintf("%c%c", 13, 10)
#define LF sprintf("%c", 10)
#define CR sprintf("%c", 13)

int convert_file(object me, string file);

int main(object me, string arg)
{
    seteuid(geteuid(me));

    if (!arg)
    {
        return notify_fail("指令格式：CRLF <路径>\n");
    }

    if (convert_file(me, arg))
        write(HIC "档案被成功转换！\n" NOR);
    else
        write(HIR "没有转换任何档案。\n" NOR);
    return 1;
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

    file = resolve_path(me->query("cwd"), file);
    msg = read_file(file);

    if (!msg)
    {
        write(sprintf("read file %s error!\n", file));
        return 0;
    }

    msg = replace_string(msg, CRLF, LF);
    // msg = replace_string(msg, LF, CR);
    // msg = replace_string(msg, CR, LF, 1);
    return write_file(file, msg, 1);
}
