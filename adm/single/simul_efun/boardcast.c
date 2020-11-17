/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: message.c
Description: 控制游戏信息显示的模拟函数
Author: xuefeng
Version: v1.0
Date: 2019-03-12
History:
*****************************************************************************/
// #include <ansi.h>

/**
 * 单人消息
 */

// send a message to current player
/* void write(mixed str)
{
    efun::write(str);
} */

// send a message to an object
/* void tell_object(object ob, string str)
{
    efun::tell_object(ob, str);
} */

/* void printf(string format, ...)
{
    efun::printf(format, ...);
} */

/**
 * 多人消息
 */

// send a message to all users in the same environment
/* varargs void say(string str, mixed exclude)
{
    if (undefinedp(exclude))
        efun::say(str);
    else
        efun::say(str, exclude);
} */

// Send  a message 'str' to all objects in the room 'ob'
/* varargs void tell_room(mixed ob, string str, object *exclude)
{
    if (undefinedp(exclude))
        efun::tell_room(ob, str);
    else
        efun::tell_room(ob, str, exclude);
} */

// send a message to all living objects
/* void shout(string str)
{
    efun::shout(str);
} */

/**
 * 自定义消息(目标广播)
 */
varargs void boardcast(string type, string msg, object me, object you, object *others, object *exclude)
{
    string my_msg, my_name, your_name, your_msg, other_msg;

    if (!msg || !objectp(me))
        return;
    my_name = me->name() || "无名氏";

    // 对 me 显示的消息
    my_msg = replace_string(msg, "$ME", SIMUL_EFUN_OB->pronoun(2, me));
    // 对其他人显示的消息
    other_msg = replace_string(msg, "$ME", my_name);
    // 对 you 的消息处理
    if (objectp(you) && living(you))
    {
        your_name = you->name() || "无名氏";
        // 对 me 显示的消息
        my_msg = replace_string(my_msg, "$YOU", your_name, 1);
        my_msg = replace_string(my_msg, "$YOU", SIMUL_EFUN_OB->pronoun(3, you));
        // 对 you 显示的消息
        your_msg = replace_string(msg, "$ME", my_name, 1);
        your_msg = replace_string(your_msg, "$ME", SIMUL_EFUN_OB->pronoun(3, me));
        your_msg = replace_string(your_msg, "$YOU", SIMUL_EFUN_OB->pronoun(2, you));
        // 对其他人显示的消息
        other_msg = replace_string(other_msg, "$YOU", your_name, 1);
        other_msg = replace_string(other_msg, "$YOU", SIMUL_EFUN_OB->pronoun(3, you));
        // 对 you 送出信息
        if (!arrayp(exclude) || member_array(you, exclude) == -1)
            message(type, your_msg, you);
    }

    // 对 me 送出信息
    if (!arrayp(exclude) || member_array(me, exclude) == -1)
        message(type, my_msg, me);

    if (!arrayp(others))
        others = users();
    exclude = (exclude || ({})) + ({me, you});
    // 对其他人送出信息
    message(type, other_msg, others, exclude);
}

/**
 * 自定义消息(区域消息)
 */
varargs void msg(string type, string msg, object me, object you, object *exclude)
{
    object *others = all_inventory(environment(me));
    boardcast(type, msg, me, you, others, exclude);
}
