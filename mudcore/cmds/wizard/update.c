#include <ansi.h>
inherit CORE_CLEAN_UP;

int help(object me);

int main(object me, string file)
{
    object env = environment(me), obj;

    if (!wizardp(me))
        return 0;

    if (!file)
        return help(me);

    if (file == "here")
    {
        file = base_name(env);
    }
    if (file == VOID_OB)
        return notify_fail(HIR "你不能在 VOID_OB 里重新编译 VOID_OB。\n" NOR);

    write("重新编译[" + file + "]:");

    if (obj = find_object(file))
    {
        destruct(obj);
    }
    if (objectp(load_object(file)))
    {
        debug("编译成功!");
    }
    else
    {
        debug("失败，文件不存在!");
    }

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
指令格式: update <对象文件名>
指令说明:
    这个指令用来重新载入一个对象。
HELP );
        return 1;
}
