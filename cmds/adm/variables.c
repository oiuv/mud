/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: variables.c
Description: 管理员专用，显示指定对象所有全局变量的值
Author: xuefeng
*****************************************************************************/
inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
    object ob, ob1;
    string *vars, id;

    if (!wizardp(me))
        return 0;

    if (!arg || arg == "")
        ob = me;
    else if (sscanf(arg, "%s in %s", arg, id) == 2)
    {
        ob1 = present(id, environment(me));
        if (!ob1)
            ob1 = present(id, me);
        if (!ob1)
            return notify_fail("本地无此生物: " + id + "\n");
        if (!ob = present(arg, ob1))
            return notify_fail("该生物身上无此对象: " + arg + "\n");
    }
    else if (arg == "here")
        ob = environment(me);
    else
    {
        arg = lower_case(arg);

        ob = present(arg, environment(me));
        if (!ob)
            ob = find_player(arg);
        if (!ob)
            ob = find_living(arg);
        if (!ob)
            ob = present(arg, me);
        if (!ob)
            return notify_fail("Data: 无法找到此对象: " + arg + "。\n");
    }
    if (sizeof(vars = variables(ob)))
    foreach(string var in vars)
        printf("%s = %O\n", var, fetch_variable(var, ob));

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@LONG
指令格式: variables <玩家|对象|here> <in 玩家或生物>
指令说明:
    此命令让你可以观看所指定对象的资料，相比 data 指令可以查看更多参数的值。
LONG );
    return  1;
}
