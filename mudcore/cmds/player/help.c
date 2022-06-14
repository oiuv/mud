#include <ansi.h>
inherit CORE_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
    object file;

    if(arg)
    {
        if( objectp(file = COMMAND_D->find_command(arg)) ) {
            // notify_fail("有这个指令存在，但是并没有详细的说明文件。\n");
            return file->help(me);
        }
    }

    return help(me);
}

int help(object me)
{
    write(@HELP
指令格式 : help [topic]

这个指令可以查看指定主题的帮助说明。

HELP );
    return 1;
}
