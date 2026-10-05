// flyto.c

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int main(object me, string arg) {
    object obj;
    mixed err;

    if (!SECURITY_D->valid_grant(me, "(immortal)"))
        return 0;

    if (!arg)
        return notify_fail("你要飞到哪儿去？\n");

    obj = MESSAGE_D->find_user(arg);
    if (!obj)
        obj = find_living(arg);
    if (!obj || !me->visible(obj)) {
        arg = resolve_path(me->query("cwd"), arg);
        if (lpc_object_path(arg) != arg && !lpc_file(arg))
            return notify_fail("指定的源码文件不存在。\n");
        if (!(obj = find_object(arg))) {
            err = catch(obj = load_object(arg));
            if (err || !objectp(obj))
                return notify_fail("没有这个玩家、生物、或地方，或该处暂时无法到达。\n");
        }
    }

    while (obj && obj->is_character())
        obj = environment(obj);

    if (obj == environment(me))
        return notify_fail("不就在你面前么？乱飞个啥？\n");

    if (!obj)
        return notify_fail("这个对象没有环境可以 flyto。\n");
    tell_object(me, "咦，怎么还不起飞呢？……\n");
    tell_object(me, "呵呵呵呵，飞了飞了！小小巫师飞呀飞……！\n");
    if (!me->query("env/invisible"))
        message("vision", me->name() + "轻飘飘的飞了起来。\n",
            environment(me), ({ me }));
    tell_object(me, "到了？到了！降落喽！！！\n");
    if (!me->query("env/invisible"))
        message("vision", me->name() + "从天上慢慢的落了下来。\n", obj);
    me->move(obj);
    return 1;
}

int help(object me) {
    write(@HELP
指令格式 : flyto <目标>
目标可为生物名、.c/.lpc 源码路径或无扩展名的实体/虚拟房间路径。
HELP);
    return 1;
}
