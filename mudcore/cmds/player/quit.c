inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    write("Bye，欢迎下次光临^_^\n");
    say(me->query("name") + "离开了游戏。\n");
    me->remove();
    return 1;
}

int help(object me)
{
    write(@HELP
指令格式 : quit

这个指令可以让你保存个人资料并退出游戏。

HELP );
    return 1;
}
