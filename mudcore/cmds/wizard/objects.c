// 打印所有载入游戏的对象
inherit CORE_CLEAN_UP;

int main(object me, string arg)
{
    if (arg == "-c")
        print_r(objects( (:clonep:) ));
    else if (arg == "-o")
        print_r(objects( (: !clonep($1) :) ));
    else if (arg == "-v")
    {
        print_r(objects( (:virtualp:) ));
    }
    else
        print_r(objects());

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式: objects <参数>
指令说明:
    这个指令用来打印游戏中载入的对象列表，参数 -c 为复制对象，参数 -o 为蓝图对象，参数 -v 为虚拟对象。
HELP);
    return 1;
}
