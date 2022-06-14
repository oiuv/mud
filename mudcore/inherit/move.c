/**
 * 角色移动控制接口
 */
#include <ansi.h>

int move(mixed);

// void create(){}

// ask an object to move to the specified destination
int move_or_destruct(object dest)
{

    // write(YEL "move_or_destruct():" + dest + "\n" NOR);

    if (userp(this_object()))
    {
        tell_object(this_object(), HIW "\n突然一阵时空扭曲，你被传送到虚空。\n" NOR);
        move(VOID_OB);
    }
    else if (this_object()->is_db_saved())
    {
        this_object()->save();
    }

    return 1;
}

varargs int move(mixed dest, int raw)
{
    object me = this_object();
    object env = environment(me);

    // 如果由area移出, 在這做move_out動作
    if (env && env->is_area())
    {
        mapping info;
        info = me->query("area_info");
        env->move_out(info["x_axis_old"], info["y_axis_old"], me);
    }
    // Move & run INIT function
    move_object(dest);
    // 在移动进目标环境后可能被destruct，所以需要判断me
    if (!me)
        return -1;

    // 如果移入的不是區域或虚空，則刪除area_info
    if (!dest->is_area() && me->query("area_info") && !dest->query("void"))
        me->delete("area_info");
    // 对没有用area_move到area的移动到随机坐标
    if (dest->is_area() && !me->query("area_info"))
    {
        debug_message(sprintf("[!]%O -> %O", me, dest));
        me->set("area_info/x_axis", random(dest->query("x_axis_size")));
        me->set("area_info/y_axis", random(dest->query("y_axis_size")));
    }
    // GMCP
    if (interactive(me))
    {
        me->gmcp("Room.Info.Get");
    }
    // 玩家对象自动look
    if (interactive(me) && living(me) && !raw)
    {
        command("look");
    }

    return 1;
}

// 建议自己重写此方法，可在destruct时调用
varargs void remove(string euid)
{
    object env;
    object me = this_object();

    if (me->is_db_saved())
        me->save();

     // Leave environment
    if (objectp(env = environment()))
    {
        // 區域使用
        if (env->is_area())
        {
            env->move_out(me->query("area_info/x_axis"), me->query("area_info/y_axis"), me);
        }
    }
}
