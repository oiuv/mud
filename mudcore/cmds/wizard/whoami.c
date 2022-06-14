inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    if (!wizardp(me))
        return 0;

    write("你的 User ID = " + getuid(me) + "\n");
    write("你的 Effective User ID = " + geteuid(me) + "\n");
    write("你所在位置：" + environment(me) + "\n");
    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式: whoami
指令说明:
    这个指令可以查看自己的 ID 信息。
HELP );
    return 1;
}
