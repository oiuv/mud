// which.c
inherit CORE_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
    object file;
    if (!wizardp(me))
        return 0;

    if (!arg)
        return help(me);

    file = COMMAND_D->find_command(arg) || VERB_D->getVerb(arg);
    if (!file)
        write("没有找到 " + arg + " 这个命令。\n");
    else
        write(arg + ":\n\t" + file + "\n");
    return 1;
}

int help(object me)
{
    write(@TEXT
指令格式: which <命令>
指令说明:
    这个指令可以找到某个命令在什么目录。
TEXT);
    return 1;
}
