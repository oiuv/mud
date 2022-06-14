/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: callouts.c
Description: 管理员专用，显示系统延时函数信息
Author: xuefeng
Version: v1.0
*****************************************************************************/
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    mixed *info;
    int i;
    string output;

    if (!wizardp(me))
        return 0;

    output = sprintf("%-40s %-20s %-10s\n", "对象", "函数", "延迟时间");
    output += "---------------------------------------------------------------------------\n";
    if (arg && arg != "")
        info = filter_array(call_out_info(), ( : $1[1] == $2:), arg);
    else
        info = call_out_info();

    for (i = 0; i < sizeof(info); i++)
        output += sprintf("%-40O %-20s %-10d\n", info[i][0], info[i][1], info[i][2]);

    write(output);
    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@LONG
指令格式: callouts [<函数名称>]
指令说明:
    列出系统中所有的定时函数。
LONG );
    return 1;
}
