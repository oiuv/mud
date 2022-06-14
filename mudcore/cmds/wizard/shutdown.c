int main(object me, string arg)
{
    if (!wizardp(me)) return 0;

    // todo 玩家存档处理

    shutdown(0);
    return 1;
}

int help(object me)
{
    if (!wizardp(me)) return 0;

    write(@HELP
指令格式: shutdown
指令说明:
    关闭游戏服务器。
HELP);
    return 1;
}
