/*****************************************************************************
Copyright: 2021, Mud.Ren
File name: clean_up.c
Description: clean_up 功能接口，driver会自动定期执行本apply函数
Version: v1.0
*****************************************************************************/

#define NEVER_AGAIN 0
#define AGAIN 1

/* The clean_up() function is called by the driver on a regular basis in
all objects that have been inactive for the time specified for clean_up()
in the runtime configuration file.  One flag is passed tothe function,
specifying whether or not the object has been inheritted by anything.
If clean_up() returns 0, clean_up() will never be called again on that
object. If it returns 1, it will be called again when the object remains
inactive for the specified clean_up() delay. */
int clean_up(int inherited)
{
    object *inv;

    // log_file("clean_up", sprintf("[%s] %3d --- %s", ctime(time()), inherited, file_name(this_object()) + "\n"));
    // 如果被其它对象继承不清除
    // if (inherited > 1)
    //     return AGAIN;

    // no_clean_up 为 1 的非复制对象不清除
    if (!clonep() && this_object()->query("no_clean_up") == 1)
        return AGAIN;
    if (this_object()->query("no_clean_up") > 1)
        log_file("no_clean_up", sprintf("%O\tno_clean_up = %d\n", this_object(), this_object()->query("no_clean_up")));

    // 在线游戏玩家不清除
    if (interactive(this_object()))
        return AGAIN;

    // 正在为QUEST服务
    if (this_object()->query_temp("quest_ob"))
        return AGAIN;

    // If we are contained in something, let environment do the clean
    // up instead of making recursive call. This will prevent clean-up
    // time lag.
    if (environment())
        return AGAIN;
    // 如果环境中有玩家或不允许清除的对象则不清除环境
    inv = all_inventory();
    for (int i = sizeof(inv) - 1; i >= 0; i--)
        if (interactive(inv[i]) ||
            inv[i]->query_temp("quest_ob") ||
            inv[i]->is_stay_in_room())
            return AGAIN;

    destruct(this_object());
    if (objectp(this_object())) // 清除失败记录日志
        log_file("no_destructed", base_name(this_object()) + " flag = " +
                                  this_object()->query("no_clean_up") + "\n");

    return NEVER_AGAIN;
}
