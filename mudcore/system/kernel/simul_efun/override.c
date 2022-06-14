/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: override.c
Description: 覆盖efun，增强功能或保证系统安全
Author: xuefeng
Version: v1.0
Date: 2019-03-12
History:
*****************************************************************************/
// 覆盖efun，新增记录
int notify_fail(string msg)
{
    if (this_player())
    {
        this_player()->set_temp("notify_fail", msg);
        return efun::notify_fail(msg);
    } else
        return 0;
}
