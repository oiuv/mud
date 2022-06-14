/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: channel_d.c
Description: 聊天频道系统守护进程 CHANNEL_D 提供游戏聊天频道服务
Author: xuefeng
Version: v1.0
Date: 2019-03-12
*****************************************************************************/
#include <ansi.h>
#include <localtime.h>

inherit CORE_DBASE;
// 聊天监听触发NPC
#ifndef ROBOT_NPC
#define ROBOT_NPC ({"/world/npc/ivy"})
#endif
int filter_listener(object ppl, string only, object me);

nosave string msg_log;
nosave int log_from;

string query_msg_log() { return msg_log; }

nosave mapping channels = ([
    "sys" : ([
                "msg_speak": HIR "【系统】%s：%s" NOR,
                "msg_color": RED,
                "only"     : "wiz",
                "name"     : "系统",
                "omit_log" : 1,
            ]),
    "msg":  ([
                "msg_speak": HIR "【公告】%s：%s" NOR,
                "msg_color": HIG,
                "name"     : "公告",
                "omit_log" : 1,
            ]),
    "chat": ([
                "msg_speak": HIC "【闲聊】%s：%s" NOR,
                "msg_emote": HIC "【闲聊】%s" NOR,
                "msg_color": HIC,
                "name"     : "闲聊",
            ]),
    "bill": ([
                "msg_speak": HIY "【交易】%s：%s" NOR,
                "msg_color": YEL,
                "name"     : "交易",
            ]),
    "shout":([
                "msg_speak": HIM "【广播】%s：%s" NOR,
            ]),
]);

void create()
{
}

string short()
{
    return "频道精灵(CHANNEL_D)";
}

// 记录频道消息的日志
void channel_log(string msg, string verb, object user)
{
    string lfn;
    mixed lt;
    int t;

    if (!mapp(channels[verb]) || !objectp(user) || !userp(user))
        return;

    if (channels[verb]["omit_log"])
        return;

    if (!stringp(msg_log))
        msg_log = "";

    t = time();
    msg_log += sprintf("[%s]%s\n", log_time(), remove_ansi(msg));
    if (strlen(msg_log) > 40 || t - log_from > 20)
    {
        lt = localtime(t);

        lfn = sprintf("channel/%d-%d-%d", lt[LT_YEAR],
                      lt[LT_MON] + 1, lt[LT_MDAY]);
        log_file(lfn, msg_log);
        msg_log = "";
        log_from = t;
    }
}

varargs int do_channel(object me, string verb, string arg, int emote)
{
    object *obs;
    string msg;
    string vb, emote_arg;

    // Check if this is a channel emote.
    if (sizeof(verb) > 2)
    {
        if (verb[sizeof(verb) - 1] == '*')
        {
            emote = 1;
            verb = verb[0..<2];
        }
    }

    // Check if this is a channel messsage.
    if (!mapp(channels) || undefinedp(channels[verb]))
        return 0;

    if (!stringp(arg) || arg == "" || arg == " ")
        arg = "...";

    if (userp(me) && !wizardp(me))
    {
        if (verb == "msg")
        {
            return notify_fail("你不能使用这个频道。\n");
        }

        switch (channels[verb]["only"])
        {
        case "wiz":
            return notify_fail("你不能使用这个频道。\n");
        }

        if (verb == "bill" && me->query("lv") < 20)
            return notify_fail(channels[verb]["name"] + "频道需要 20 级以后才能使用。\n");

        if (time() - me->query_temp("last_use_channel") < 4)
        {
            if (me->query_temp("last_message") == arg)
                return notify_fail("不要在短期内使用频道发布重复的信息。\n");
            me->set_temp("last_message", arg);
        }
        else
        {
            me->set_temp("last_message", arg);
            me->set_temp("last_use_channel", time());
        }
    }

    if (verb == "shout")
    {
        if (!arg)
            return notify_fail("你想要广播什么？\n");
        if (!wizardp(me) && userp(me))
        {
            if (me->query("coin") < 100)
                return notify_fail("你至少需要 100 金币才能广播。\n");
            me->add("coin", -100);
        }

        msg = HIM "【广播】" + me->short() + "：" + arg + "\n" + NOR;
        shout(msg);
        write(msg);
        channel_log(msg, verb, me);
        return 1;
    }

    if (emote && me->is_character())
    {
        // return notify_fail("表情系统暂未开放...\n");
        if (undefinedp(channels[verb]["msg_emote"]))
            return notify_fail("这个频道不支持发送表情。\n");

        if (sscanf(arg, "%s %s", vb, emote_arg) != 2)
        {
            vb = arg;
            emote_arg = "";
        }

        if (!arg)
            return 0;
    }

    obs = users();
    if (stringp(channels[verb]["only"]))
        obs = filter_array(obs, (: filter_listener :), channels[verb]["only"], me);

    if (!arg || arg == "" || arg == " ")
        arg = "...";

    if (emote)
    {
        if (!stringp(arg))
            return 0;

        return EMOTE_D->do_emote(me, vb, emote_arg, obs, channels[verb]["msg_emote"]);
    }
    else
    {
        // NPC监听聊天接口
        if (userp(me) && verb == "chat")
        {
            ROBOT_NPC->receive_report(me, verb, arg);
        }
        msg = sprintf(channels[verb]["msg_speak"], me->short() || me->query("channel_id"), channels[verb]["msg_color"] + arg);
        message(verb, msg, obs);
        channel_log(msg, verb, me);
    }
    return 1;
}

int filter_listener(object ppl, string only, object me)
{
    // Don't bother those in the login limbo.
    if (!environment(ppl))
        return 0;

    switch (only)
    {
    case "wiz":
        return (wizardp(ppl));
    }

    return 1;
}
