/**
 * @file condition.c
 * @author 雪风@mud.ren
 * @brief 对象buff控制接口，需要通过heart_beat触发效果
 * @version 0.1
 * @date 2021-12-04
 *
 * @copyright Copyright (c) 2021
 *
 */
#include <dbase.h>

// 询问状态
nomask int in_condition(string condition_file)
{
    return mapp(query("condition/" + replace_string(condition_file, "/", "#")));
}

// 启动状态，1 秒为单位
varargs nomask void start_condition(string condition_file, int time, int heart_beat)
{
    mapping condition_setup = allocate_mapping(0);

    // 如果已经在相同的状态内先停止先前的状态
    if (in_condition(condition_file))
        condition_file->stop_effect(this_object());

    // 设定状态持续时间或使用预设时间
    if (!undefinedp(time) && time > 0)
        condition_setup["time"] = time;
    else
        condition_setup["time"] = condition_file->query_default_condition_time();

    // 设定状态心跳时间或使用预设心跳时间
    if (!undefinedp(heart_beat) && heart_beat > 0)
        condition_setup["heart_beat"] = heart_beat;
    else
        condition_setup["heart_beat"] = condition_file->query_default_condition_heart_beat();

    set("condition/" + replace_string(condition_file, "/", "#"), condition_setup);

    // 执行状态启动时的效果
    condition_file->start_effect(this_object());
}

// 移除状态
nomask void stop_condition(string condition_file)
{
    delete("condition/" + replace_string(condition_file, "/", "#"));

    // 执行状态结束时的效果
    condition_file->stop_effect(this_object());
}

// 改变状态时间
nomask void change_condition_time(string condition_file, int time)
{
    if (!in_condition(condition_file))
        return;

    set("condition/" + replace_string(condition_file, "/", "#") + "/time", time);
}

// 返回状态资料
varargs nomask mapping query_condition(string condition_file)
{
    if (undefinedp(condition_file))
        return query("condition");

    return query("condition/" + replace_string(condition_file, "/", "#"));
}

// 清除所有状态
nomask void clean_condition()
{
    mapping condition;
    if (mapp(condition = query("condition")))
    {
        foreach (string key, mapping value in condition)
        {
            set("condition/" + key + "/time", 0);
        }
    }
}
