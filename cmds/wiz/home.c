// home.c

inherit F_CLEAN_UP;

int main(object me, string arg) {
    string msg, room;

    if (!SECURITY_D->valid_grant(me, "(wizard)"))
        return 0;

    // 统一处理自定义消息
    if (stringp(msg = me->query("env/msg_home")))
        message_vision(msg + "\n", me);

    room = lpc_file(user_path(geteuid(me)) + "workroom");
    if (!room) {
        // 如果没有个人工作室，移动到巫师大厅
        me->move("/d/wizard/hall");
    } else {
        me->move(room);
    }
    return 1;
}

int help(object me) {
    write(@HELP
指令格式 : home

利用此一指令可直接回到自己的工作室。
个人工作室支持 workroom.lpc 和 workroom.c；没有工作室时回巫师大厅。
如果你有 'msg_home' 这个设定, 则在场的人都会看到那个讯息.
HELP);
    return 1;
}
