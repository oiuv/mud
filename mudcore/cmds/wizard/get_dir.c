#include <ansi.h>
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    if (!arg)
    {
        print_r(get_dir("/"));
    }
    else if (file_size(arg) == -2)
    {
        if (arg[sizeof(arg) - 1] != '/')
            arg += "/";
        print_r(get_dir(arg));
    }
    else
    {
        debug(arg + " 不是一个有效目录。");
    }

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@TEXT
指令格式: get_dir [dir]
指令说明:
    列出指定目录下的文件，如果不指定目录，默认为 /
TEXT
    );
    return 1;
}
