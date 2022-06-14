/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: variables.c
Description: 管理员专用，显示指定对象所有全局变量的值
Author: xuefeng
*****************************************************************************/
inherit CORE_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
    object ob, env;
    string *vars, id;

    if (!wizardp(me))
        return 0;

    if (!arg || arg == "me" || arg == "")
        ob = me;
    else if (arg == "here")
        ob = environment(me);
    else if (sscanf(arg, "%s in %s", arg, id) == 2)
    {
        env = present(id, environment(me));
        if (!env)
            env = present(id, me);
        if (!env)
            return notify_fail("当前环境中无法找到对象 " + id + "。\n");
        if (!ob = present(arg, env))
            return notify_fail("环境对象 " + id + " 中没有找到对象 " + arg + "。\n");
    }
    else
    {
        // arg = lower_case(arg);

        ob = present(arg, environment(me));
        if (!ob)
            ob = find_player(arg);
        if (!ob)
            ob = find_living(arg);
        if (!ob)
            ob = present(arg, me);
        if (!ob)
            ob = load_object(arg);
        if (!ob)
            return notify_fail("无法找到对象 " + arg + "。\n");
    }
    if (sizeof(vars = variables(ob, 1)))
        foreach (string *var in vars)
            if (strsrch(var[1], "private") == -1)
                printf("%s = %O\n", var[0], fetch_variable(var[0], ob));
            else
                printf("%s 是 %s 类型变量\n", var[0], var[1]);

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@LONG
指令格式: variables <玩家|here|me|对象文件> [in 玩家或生物]
指令说明:
    此命令让你可以查看指定对象的详细全局变量资料。
LONG );
    return  1;
}
