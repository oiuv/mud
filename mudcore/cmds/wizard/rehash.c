// dump.c 导出游戏对象
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    if (!wizardp(me))
        return 0;

    COMMAND_D->rehash();
    debug("指令已更新!\n");

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式: rehash
指令说明:
    当新增指令时使用此指令更新指令列表，让新指令生效。
HELP
    );
    return 1;
}
