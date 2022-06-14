/* area.c write by -Acme- */

#pragma optimize

// 比較二個对象是否處在相同的區域座標中
int area_environment(object ob1, object ob2)
{
    if (environment(ob1) != environment(ob2))
        return 0;
    else
    {
        mapping info1, info2;
        if (!(info1 = ob1->query("area_info")))
            return 0;
        if (!(info2 = ob2->query("area_info")))
            return 0;
        if (info1["x_axis"] != info2["x_axis"] || info1["y_axis"] != info2["y_axis"])
            return 0;
    }
    return 1;
}

// 將who移到與me同一格的位置
int area_move_side(object who, object me)
{
    int env_area = 0, x, y;
    object area;
    mapping who_info;

    if (!objectp(who) || !objectp(me))
        return 0;
    if (!environment(me))
        return 0;
    if (!environment(me)->is_area())
        return 0;

    if (environment(who) && environment(who)->is_area())
    {
        who_info = who->query("area_info");
        env_area = 1;
    }

    // 已經在同一個位置了
    if (environment(me) == environment(who) &&
        me->query("area_info/x_axis") == who->query("area_info/x_axis") &&
        me->query("area_info/y_axis") == who->query("area_info/y_axis"))
        return 1;

    area = environment(me);
    x = me->query("area_info/x_axis");
    y = me->query("area_info/y_axis");

    // 如果who移到area中失敗
    if (!area->move_in(x, y, who))
    {
        return 0;
    }

    who->set("area_info/x_axis", x);
    who->set("area_info/y_axis", y);

    // 成功移入area, move() 會自動從舊area裡移出
    if (who->move(area))
    {
        who->set("area_info/x_axis_old", x);
        who->set("area_info/y_axis_old", y);
        return 1;
    }
    else
    {
        // 將先前移到新的area再做移出
        area->move_out(x, y, who);
        if (env_area)
        {
            // 設回先前的 x, y
            who->set("area_info/x_axis", who_info["x_axis_old"]);
            who->set("area_info/y_axis", who_info["y_axis_old"]);
            if (!environment(who)->move_in(who_info["x_axis_old"], who_info["y_axis_old"]))
            {
                tell_object(who, "因為某種原因，你的角色在區域移動時產生了錯誤...\n");
                destruct(who);
                return 0;
            }
        }
    }
}

int area_move(object area, object who, int x, int y)
{
    mapping info;
    int env_area = 0;

    if (!objectp(who) || !objectp(area))
        return 0;

    if (environment(who) && environment(who)->is_area())
    {
        info = who->query("area_info");
        env_area = 1;
    }

    // 已經在同一個位置了
    if (area == environment(who) &&
        x == who->query("area_info/x_axis") &&
        y == who->query("area_info/y_axis"))
        return 1;

    // 如果who move_in到新的area中失敗
    if (!area->move_in(x, y, who))
        return 0;

    who->set("area_info/x_axis", x);
    who->set("area_info/y_axis", y);
    // 成功移入area, move() 會自動從area裡移出
    if (who->move(area))
    {
        who->set("area_info/x_axis_old", x);
        who->set("area_info/y_axis_old", y);
        return 1;
    }
    // 移入area失敗，如果原本是在area環境中，必須再移入一次
    else
    {
        // 將先前移到新的area再做移出
        area->move_out(x, y, who);
        if (env_area)
        {
            // 設回先前的 x, y
            who->set("area_info/x_axis", info["x_axis_old"]);
            who->set("area_info/y_axis", info["y_axis_old"]);
            if (!environment(who)->move_in(info["x_axis_old"], info["y_axis_old"]))
            {
                tell_object(who, "因為某種原因，你的角色在區域移動時產生了錯誤...\n");
                destruct(who);
                return 0;
            }
        }
    }
    return 0;
}

// 覆寫mudos present函式
object present(mixed arg, object ob)
{
    if (!ob)
    {
        if (stringp(arg))
        {
            // 返回名为arg的对象
            return efun::present(arg, previous_object()) || efun::present(arg, environment(previous_object()));
        }
        if (objectp(arg))
        {
            // 返回对象arg的环境
            return efun::present(arg, previous_object()) && previous_object() || efun::present(arg, environment(previous_object())) && environment(previous_object());
        }
        error("参数 arg 必须是 object 或 string 类型");
    }

    if (ob->is_area())
    {
        int p = 0, index;
        object *obs, t;
        mapping area_info;

        area_info = this_player()->query("area_info");

        if (sscanf(arg, "%s %d", arg, index) != 2)
            index = 1;

        obs = ob->query_inventory(area_info["x_axis"], area_info["y_axis"]);

        foreach (t in obs)
        {
            if (!objectp(t))
                continue;
            if (t->id(arg))
            {
                p += 1;
                if (p == index)
                    return t;
            }
        }
        return 0;
    }
    else
        return efun::present(arg, ob);
}

// 针对area模式的tell_room
varargs void tell_area(mixed area, int x, int y, string str, object *exclude)
{
    if (area && area->is_area())
    {
        object *obs = area->query_inventory(x, y);
        message("tell_area", str, obs, exclude);
    }
}
