/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: user.c
Description: 用户示例对象 USER_OB，仅供参考，不要继承使用
Author: xuefeng
Version: v1.0
Date: 2020-04-20
*****************************************************************************/
#include <ansi.h>
inherit CORE_USER;

void create()
{
    seteuid(0); // export_uid
}

// 判断是否是有生命的，包括 disable_living 的角色
int is_character() { return 1; }

// 角色激活
void setup()
{
    seteuid(getuid(this_object()));
    set_heart_beat(1);
    enable_living();
    CHAR_D->setup(this_object());
}

// 从游戏中移除这个角色
void remove()
{
    ::remove();
    // todo 玩家存档处理
    destruct(this_object());
}

// 判断是否是 user 对象文件，和 efun userp() 稍有区别
int is_user() { return clonep(); }

// 玩家断线处理
void net_dead()
{
    set_temp("net_dead", 1);
    set_heart_beat(0);
    call_out("user_dest", 60);
    say(query("name") + "断线了。\n");
}

// 玩家心跳事件
void heart_beat()
{
    mapping condition;

    if (mapp(condition = query("condition")))
    {
        foreach (string key, mapping value in condition)
        {
            if (value["time"] <= 0)
            {
                catch(replace_string(key, "#", "/")->stop_effect(this_object()));
                delete("condition/" + key);
                continue;
            }

            if (value["heart_beat"] > 0 && !(value["time"] % value["heart_beat"]))
                catch(replace_string(key, "#", "/")->heart_beat_effect(this_object()));

            add("condition/" + key + "/time", -1);
        }
    }
}

/**
 * 以下为玩家相关自定义方法
 */
string get_id()
{
    string id;

    id = geteuid();
    if (!id) id = getuid();
    if (!id) query("id");

    return id;
}

string query_save_file()
{
    return sprintf(DATA_DIR "user/%s", get_id());
}

// called by the LOGIN_D when a net_dead player reconnects.
void reconnect()
{
    set_heart_beat(1);
    delete_temp("net_dead");
    remove_call_out("user_dest");
    tell_object(this_object(), "重新连线完毕。\n");
}

void user_dest()
{
    if (environment())
    {
        tell_room(environment(), query("name") + "断线超过 1 分钟，自动退出这个世界。\n");
    }
    remove();
}
