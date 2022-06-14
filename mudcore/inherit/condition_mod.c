/**
 * @file condition_mod.c
 * @author 雪风@mud.ren
 * @brief buff接口，由状态实现文件继承使用，状态文件需声明以下变量并实现具体效果
 * @version 0.1
 * @date 2021-12-04
 *
 * @copyright Copyright (c) 2021
 *
 */
#include <ansi.h>

// 返回 Key 值
string query_condition_key()
{
    return "condition/" + replace_string(base_name(this_object()), "/", "#");
}

// 返回状态英文名称
string query_condition_id()
{
    return fetch_variable("id");
}

// 返回状态中文名称
string query_condition_name()
{
    return fetch_variable("name");
}

// 返回状态类型名称
string query_condition_type()
{
    return fetch_variable("type");
}

// 返回状态预设持续时间
int query_default_condition_time()
{
    return fetch_variable("time");
}

// 返回状态预设心跳时间
int query_default_condition_heart_beat()
{
    return fetch_variable("heartbeat");
}

// 进入状态时的效果
void start_effect(object ob)
{
    msg("MAG", "$ME进入了「" + query_condition_name() + MAG "」的" + query_condition_type() + "状态。", ob);
}

// 结束状态时的效果
void stop_effect(object ob)
{
    msg("CYN", "$ME失去了「" + query_condition_name() + CYN "」的" + query_condition_type() + "状态。", ob);
}

// 状态进行中的效果
void heart_beat_effect(object ob)
{
}
