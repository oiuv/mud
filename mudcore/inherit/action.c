/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: action.c
Description: 行动限制功能接口 ACTION
Author: xuefeng
Version: v1.0
Date: 2019-03-12
*****************************************************************************/
nosave mixed busy, interrupt;

varargs void start_busy(mixed new_busy, mixed new_interrupt)
{
    object me;

    if (!new_busy)
        return;
    if (!intp(new_busy) && !functionp(new_busy))
        debug_message("action: Invalid busy action type.\n");

    if (!objectp(me = this_object()))
        return;

    busy = new_busy;

    if (!intp(new_interrupt) && !functionp(new_interrupt))
        debug_message("action: Invalid busy action interrupt handler type.\n");

    interrupt = new_interrupt;

    // set_heart_beat(1);
}

nomask mixed query_busy() { return busy; }
nomask int is_busy() { return busy != 0; }

// 如果在 busy 状态，调用本方法
void continue_action()
{
    if (intp(busy) && (busy > 0))
    {
        busy--;
        // debug_message("[BUSY]:" + busy);
        return;
    }
    else if (functionp(busy))
    {
        if (!evaluate(busy, this_object()))
        {
            busy = 0;
            interrupt = 0;
        }
    }
    else
    {
        busy = 0;
        interrupt = 0;
    }
}

varargs void interrupt_me(object who, string how)
{
    mixed bak;

    bak = busy;
    busy = 0;

    if (!bak)
        return;

    if (intp(bak) && intp(interrupt))
    {
        if (bak < interrupt || who != this_object())
            return;
    }
    else if (functionp(interrupt))
    {
        if (evaluate(interrupt, this_object(), who, how))
        {
            bak = 0;
            interrupt = 0;
        }
    }
    else
    {
        bak = 0;
        interrupt = 0;
    }

    busy = bak;
}
