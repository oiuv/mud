/*****************************************************************************
Copyright: 2021, Mud.Ren
File name: clean_up.c
Description: clean_up 功能接口，driver会自动定期执行本apply函数
Author: xuefeng
Version: v1.1
Date: 2021-09-30
*****************************************************************************/
#define NEVER_AGAIN 0
#define AGAIN 1

/** periodically called in inactive objects
 *  The  clean_up()  function is called by the driver on a regular basis in
 *  all objects  that  have  been  inactive  for  the  time  specified  for
 *  clean_up()  in  the  runtime configuration file.  One flag is passed to
 *  the function, specifying whether or not the object has been  inheritted
 *  by  anything.  If clean_up() returns 0, clean_up() will never be called
 *  again on that object.  If it returns 1, it will be  called  again  when
 *  the object remains inactive for the specified clean_up() delay.
*/
int clean_up(int inherited)
{
    object *inv;

    // 被其它对象继承时不清除
    // if (inherited > 1)
    //     return AGAIN;
    // 记录因某些原因未能回到出生环境的对象
    if (this_object()->query("no_clean_up") > 1)
        write_file(LOG_DIR + "no_clean_up", sprintf("%O\tno_clean_up = %d\n", this_object(), this_object()->query("no_clean_up")));
    // no_clean_up 为 1 的非复制对象不清除
    if (!clonep() && this_object()->query("no_clean_up") == 1)
        return AGAIN;
    // 在线游戏玩家不清除
    if (interactive(this_object()))
        return AGAIN;
    // 在游戏环境中的对象不主动清除（通过清除环境来清理）
    if (environment())
        return AGAIN;
    // 如果环境中有玩家或不允许清除的对象则不清除环境
    inv = all_inventory();
    for (int i = sizeof(inv) - 1; i >= 0; i--)
        if (interactive(inv[i]) || inv[i]->query("no_clean_up") == 1)
            return AGAIN;

    destruct(this_object());
    return NEVER_AGAIN;
}
