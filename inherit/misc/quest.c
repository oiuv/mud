// inherit object: quest.c
// 所有玩家任务继承此对象

#include <quest.h>

inherit F_DBASE;

mixed quest_name;

STATIC_VAR_TAG int destructing;         // 析构对象时候的标志
STATIC_VAR_TAG string status;           // 任务对象的状态

int is_quest() { return clonep(this_object()); }

// 任务的名字
varargs string name()
{
        if (stringp(quest_name))
                return quest_name;

        if (functionp(quest_name))
                return evaluate(quest_name);

        return "未名任务";
}

// 设置名字
void set_name(string name)
{
        quest_name = name;
}

// 该任务消息灵通人士(knower)对某人(who)而言的介绍
varargs string query_introduce(object knower, object who)
{
        // 缺省是没有介绍的 - 能够被散布的应该必须有介绍。
        return 0;
}

// 该任务是否能被消息灵通人士(knower)所知晓
varargs int can_know_by(object knower)
{
        // 缺省是可以知晓的
        return 1;
}

// 该任务是否能被消息灵通人士(knower)广为散布
varargs int can_rumor_by(object knower)
{
        // 缺省只要该人知道就可以散布
        // 必须引用this_object()，因为can_know_by() 一般会被
        // 具体的任务对象重载，如果不引用this_object()就调用
        // 不了重载的函数。
        return this_object()->can_know_by(knower);
}

// 任务的初始化
void setup()
{
        if (! this_object()->is_quest())
                return;

        // 这是一个任务
        status = QUEST_CREATE;
        set("start_time", time());
        QUEST_D->add_quest(this_object());
}

// 任务的析构函数。
// 如果是首先析构这个任务对象，则destructing这个标识必然为零，
// 那么我就设置标识，然后尝试调用取消任务的重载函数。 这样在
// 取消任务的函数中调用析构函数就不会再次执行。
void remove()
{
        if (! destructing && this_object()->is_quest())
        {
                destructing = 1;

                // 在析构前取消任务
                this_object()->cancel_quest();
        }
}

// 结束任务的函数
// 直接调用析构函数
void cancel_quest()
{
        // 设置结束时间
        set("finish_time", time());

        // 从QUEST_D中去掉有关这个对象的信息
        QUEST_D->remove_all_information(this_object());

        // 如果没有析构这个任务，则设置标识，然后析构这个任务
        if (! destructing)
        {
                destructing = 1;
                destruct(this_object());
        }
}

// 查询任务状态
string query_status()
{
        return status;
}

// 任务改变状态
void change_status(string new_state)
{
        if (status == new_state)
                // 状态没有变化
                return;

        status = new_state;
        if (status == QUEST_FINISH)
        {
                // 迁移到结束状态？析构对象。
                this_object()->cancel_quest();
                // destruct(this_object());
        }
}

// 在QUEST_D那里登记一条消息
void set_information(string key, mixed info)
{
        QUEST_D->set_information(this_object(), key, info);
}

// 在QUEST_D那里登记自己的消息
void register_information()
{
        // 必须登记一定的信息才可以
}
