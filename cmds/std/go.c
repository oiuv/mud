// go.c
#include <ansi.h>
#include <config.h>
#include <type.h>

inherit F_CLEAN_UP;

mapping default_dirs = ([
    "north":        "北方",
    "south":        "南方",
    "east":         "东方",
    "west":         "西方",
    "northup":      "北边",
    "southup":      "南边",
    "eastup":       "东边",
    "westup":       "西边",
    "northdown":    "北边",
    "southdown":    "南边",
    "eastdown":     "东边",
    "westdown":     "西边",
    "northeast":    "东北",
    "northwest":    "西北",
    "southeast":    "东南",
    "southwest":    "西南",
    "up":           "上面",
    "down":         "下面",
    "enter":        "里面",
    "in":           "里面",
    "out":          "外面",
]);

nosave mapping empty_mapping = ([]);

int do_area_move(object me, object env, string dir);
int do_room_move(object me, object env, string dir);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    object env;

    if (!arg)
        return notify_fail("你要往哪个方向走？\n");

    if (me->over_encumbranced())
        return notify_fail("你的负荷过重，动弹不得。\n");

    if (me->is_busy() || me->query("doing"))
        return notify_fail("你的动作还没有完成，不能移动。\n");

    env = environment(me);
    if (!env)
        return notify_fail("你哪里也去不了。\n");
    if (env->is_area())
        return do_area_move(me, env, arg);
    else
        return do_room_move(me, env, arg);
}

int do_room_move(object me, object env, string arg)
{
    string mout, min, dir, thing_msg, msg1, msg2;
    mixed dest;
    object obj, thing;
    int result;
    mapping exit;
    object *f_obs, *ob;
    mixed flee;
    mapping my, my_temp;
    mapping my_env, my_armor;

    if (me->is_fighting())
    {
        me->clean_up_enemy();
        f_obs = me->query_enemy();
    }
    else
        f_obs = ({});

    if (arrayp(ob = env->query_temp("guarded/" + arg)))
        f_obs += ob;

    my = me->query_entire_dbase();
    my_temp = me->query_entire_temp_dbase();
    if (!my_temp)
        my_temp = empty_mapping;

    my_armor = my_temp["armor"];
    if (!my_armor)
        my_armor = empty_mapping;

    my_env = my["env"];
    if (!my_env)
        my_env = empty_mapping;

    if (sizeof(f_obs))
    {
        int fp, gp;
        int force_power;
        int target_power;
        object g_ob;

        fp = (int)me->query_skill("dodge");
        fp += my["dex"] * 15;
        force_power = me->query_skill("force") + my["str"] * 2;
        if (flee = my_temp["success_flee"])
        {
            if (stringp(flee))
                write(flee);
            f_obs = ({});
        }
        foreach (g_ob in f_obs)
        {
            if (!g_ob)
                continue;
            if (!living(g_ob) || g_ob == me)
                continue;

            // calculate flee power & guard power
            gp = g_ob->query_skill("dodge");
            gp += g_ob->query("dex", 1) * 15;

            if ((fp / 2 + random(fp)) < (gp * 3 / 4))
            {
                me->start_busy(1);
                if (me->is_fighting(g_ob))
                {
                    message_vision(HIW "$N" HIW "见势不妙，转身想要逃"
                                       "走。却见$n" HIW "飞身一闪，已将$N" HIW "的退路封死。\n" NOR,
                                   me, g_ob);
                }
                else
                {
                    message_vision(HIW "$N" HIW "刚想离开，被$n" HIW "一把"
                                       "拦住，喝道：慢着！想打我这儿过，没门！"
                                       "\n" NOR,
                                   me, g_ob);
                }

                if (userp(g_ob))
                {
                    target_power = g_ob->query_skill("force") + g_ob->query("str") * 2;
                    if (force_power > target_power * 4)
                    {
                        message_vision("$N纵声长笑：“鼠辈！安敢欺吾？”说罢"
                                       "往前一冲，将$n带出数步，跌倒在地。\n",
                                       me, g_ob);
                        g_ob->unconcious();
                    }
                    else if (force_power > target_power * 3)
                    {
                        message_vision("$N理都没有理$n，只是旁若无人往前走去"
                                       "，将$n撞得鼻青脸肿。",
                                       me, g_ob);
                        g_ob->receive_wound("qi", 100 + random(100));
                    }
                    else if (force_power > target_power * 2)
                    {
                        message_vision("$N一声冷笑，大踏步的向前冲"
                                       "去，乓的一下将$n撞到了一边。",
                                       me, g_ob);
                        g_ob->receive_wound("qi", 50 + random(50));
                    }
                    else
                        return 1;
                }
                else
                    return 1;
                // 没有阻挡成功，继续前进
            }
        }
    }
    map_delete(my_temp, "success_flee");

    if (!mapp(exit = env->query("exits")) || undefinedp(exit[arg]))
    {
        if (query_verb() == "go")
            notify_fail("这个方向没有出路。\n");
        return 0;
    }

    notify_fail("你过不去。\n");
    result = env->valid_leave(me, arg);
    if (!result)
        return 0;
    if (result < 0 || !objectp(me) || environment(me) != env)
        // I needn't let the character do anymore,
        // because everything has been dong in the
        // function::valid_leave()
        return 1;

    dest = exit[arg];

    switch (typeof(dest))
    {
    case T_OBJECT:
        obj = dest;
        break;
    case T_STRING:
        if (!objectp(obj = load_object(dest)))
        {
            return notify_fail(sprintf("目标环境异常，无法向 %s 移动。\n", dest));
        }
        break;
    case T_MAPPING:
        if (undefinedp(dest["filename"]) || undefinedp(dest["x_axis"]) || undefinedp(dest["y_axis"]))
        {
            return notify_fail(sprintf("目标方向异常，无法向 %s 移动。\n", arg));
        }
        if (!objectp(obj = load_object(dest["filename"])))
        {
            return notify_fail(sprintf("目标环境异常，无法向 %s 移动。\n", dest["filename"]));
        }
        break;
    // case T_INT:
    // case T_FLOAT:
    // case T_ARRAY:
    default:
        write("這一個方向的出口有問題，請通知巫師處理。\n");
        return 1;
    }
    /* 限制骑马可通行的地方
    if (my_temp["is_riding"] &&
        arg != "north"     && arg != "south"     &&
        arg != "east"      && arg != "west"      &&
        arg != "northeast" && arg != "southeast" &&
        arg != "northwest" && arg != "southwest" &&
        arg != "northup"   && arg != "southup"   &&
        arg != "northdown" && arg != "southdown" &&
        arg != "eastup"    && arg != "westup"    &&
        arg != "eastdown"  && arg != "westdown"  &&
        arg != "up"        && arg != "down"      &&
        arg != "enter"     && arg != "out")
        return notify_fail("这个方向没法骑在座骑上过去。\n");
    */

    if (!undefinedp(default_dirs[arg]))
        dir = default_dirs[arg];
    else
    {
        // 针对玩家自建房间
        if (stringp(env->query_room_id(arg)))
            dir = env->query_room_id(arg);
        else
            dir = arg;
    }

    if (me->is_fighting())
    {
        mout = me->name() + "往" + dir + "落荒而逃了。\n";
        min = me->name() + "跌跌撞撞地跑了过来，模样有些狼狈。\n";
    }
    else
    {
        // 为什么不提供兵器防具的名称？因为对方武器的名称不可能瞬间便
        // 得知，另一原因就是玩家自铸兵器的名称千奇百怪，实有伤大雅。

        if (!userp(me) || objectp(thing = my_armor["cloth"]))
            thing_msg = "";
        else
            thing_msg = "赤着身子";

        if (objectp(thing = my_temp["weapon"]))
        {
            if ((string)thing->valid_as_xiao())
            {
                msg1 = "持着一";
                msg2 = "洞箫";
            }
            else if ((string)thing->query("skill_type") == "sword")
            {
                msg1 = "提着一";
                msg2 = "长剑";
            }
            else if ((string)thing->query("skill_type") == "blade")
            {
                msg1 = "扛着一";
                msg2 = "大刀";
            }
            else if ((string)thing->query("skill_type") == "staff")
            {
                msg1 = "持着一";
                msg2 = "手杖";
            }
            else if ((string)thing->query("skill_type") == "club")
            {
                msg1 = "提着一";
                msg2 = "棍子";
            }
            else if ((string)thing->query("skill_type") == "whip")
            {
                msg1 = "提着一";
                msg2 = "长鞭";
            }
            else if ((string)thing->query("skill_type") == "dagger")
            {
                msg1 = "手持一";
                msg2 = "匕首模样的兵器";
            }
            else
            {
                msg1 = "持着一";
                msg2 = "奇模怪样的武器";
            }
            thing_msg += msg1 + thing->query("unit") + msg2;
        }

        if (my["race"] == "野兽")
        {
            mout = me->name() + "呼地往" + dir + "一窜就消失了。\n";
            min = me->name() + "呼地窜了出来，警惕地四周张望着。\n";
        }
        else
        {
            object riding;
            if (objectp(riding = my_temp["is_riding"]))
            {
                mout = me->name() + "骑着" + riding->name() +
                       "向" + dir + "疾驰而去。\n";
                min = me->name() + thing_msg + "骑着" +
                      riding->name() + "一路疾驰而来。\n";
            }
            else
            {
                mout = me->name() + "往" + dir + "离开。\n";
                min = me->name() + thing_msg + "走了过来。\n";
            }
        }
    }

    if (!wizardp(me) || !my_env["invisible"])
        message("vision", mout, environment(me), ({me}));

#if INSTALL_EXAMINE
    EXAMINE_D->examine_player(me);
#endif

    // move I to dest
    if (obj->is_area())
    {
        if (area_move(obj, me, dest["x_axis"], dest["y_axis"]))
        {
            object *obs;
            obs = obj->query_inventory(dest["x_axis"], dest["y_axis"]);
            if (!my_env["invisible"])
                tell_area(obj, dest["x_axis"], dest["y_axis"], min, ({me}));
            // 對進入的座標做init()動作
            if (sizeof(obs))
                obs->init();
        }
        else
            return notify_fail("移动失败！！\n");
    }
    else if (!me->move(obj))
        return notify_fail("移动失败！\n");
    else if (!my_env["invisible"])
        message("vision", min, obj, ({me}));

    map_delete(my_temp, "pending");
    // 因为移动到目标环境后可能被destruct，需判断me还在不在
    if (!objectp(me))
        return 1;

    me->remove_all_enemy(1);
    if (living(me))
    {
        me->add("state/go", 1);
    }

    if (environment(me) != env)
    {
        object competitor;
        if (competitor = me->query_competitor())
        {
            me->lost();
            competitor->win();
        }
        all_inventory(env)->follow_me(me, arg);
    }
    return 1;
}

int do_area_move(object me, object env, string dir)
{
    int x, y;
    string *area_exits, dir_name, min, mout;
    object new_env, *obs;
    mapping info;

    if (!(info = me->query("area_info")))
        return 0;

    x = info["x_axis"];
    y = info["y_axis"];

    area_exits = env->query_exits(x, y);

    if (dir == "escape")
    {
        if (!sizeof(area_exits))
        {
            write("你已經無路可逃了！\n");
            return 1;
        }
        else
            dir = element_of(area_exits);
    }

    if (member_array(dir, area_exits) == -1)
    {
        write("這個方向沒有出路。\n");
        return 1;
    }

    if (undefinedp(dir_name = default_dirs[dir]))
        dir_name = dir;

    if (me->is_fighting())
    {
        int chance;
        object *enemy, obj;
        enemy = me->query_enemy() - ({0});

        foreach (obj in enemy)
        {
            if (userp(obj) || !living(obj))
                continue;
            if (!area_environment(obj, me))
                continue;
            if (!me->visible(obj))
                continue;
            chance = 50 - ((obj->query_level() - me->query_level()) * 2);
            if (chance < 10)
                chance = 10;
            else if (chance > 90)
                chance = 90;
            if (chance < random(100))
            {
                tell_object(me, "你被" + obj->name() + "擋住了！\n");
                me->start_busy(1);
                return 1;
            }
        }
    }

    // 移动对象到区域指定方向
    if (!env->moveObject(me, dir))
        return 1;

    new_env = environment(me);

    if (undefinedp(dir_name = default_dirs[dir]))
        dir_name = dir;

    if (me->is_fighting())
    {
        mout = "往" + dir_name + "落荒而逃了。\n";
        min = "跌跌撞撞地跑了過來﹐模樣有些狼狽。\n";
    }
    else
    {
        mout = "往" + dir_name + "離開。\n";
        min = "走了過來。\n";
    }

    // 顯示離開訊息
    tell_area(env, x, y, me->name() + mout, ({me}));

    if (new_env->is_area())
    {
        // 顯示進入訊息
        tell_area(new_env, info["x_axis"], info["y_axis"], me->name() + min, ({me}));

        // 對進入的座標做init()動作
        obs = new_env->query_inventory(info["x_axis"], info["y_axis"]);
        // 本质上还在一个环境中，需要主动调用init()
        if (sizeof(obs) > 1)
            obs->init();
    }
    else
        tell_room(new_env, me->name() + min, me);

    // 讓移動性的設定歸零(如sneak)
    me->set_temp("pending", 0);

    // 是否有人物跟隨
    obs = env->query_inventory(x, y);
    obs->follow_me(me, dir);

    return 1;
}

void do_flee(object me)
{
    mapping exits;
    string *directions;

    if (!environment(me) || !living(me))
        return;
    exits = environment(me)->query("exits");
    if (!mapp(exits) || !sizeof(exits))
        return;
    directions = keys(exits);
    tell_object(me, HIM "看来该找机会逃跑了……\n" NOR);
    main(me, directions[random(sizeof(directions))]);
}

nosave mapping r_dirs = ([
    "north":        "south",
    "south":        "north",
    "east":         "west",
    "west":         "east",
    "northup":      "southdown",
    "southup":      "northdown",
    "eastup":       "westdown",
    "westup":       "eastdown",
    "northdown":    "southup",
    "southdown":    "northup",
    "eastdown":     "westup",
    "westdown":     "eastup",
    "northeast":    "southwest",
    "northwest":    "southeast",
    "southeast":    "northwest",
    "southwest":    "northeast",
    "up":           "down",
    "down":         "up",
    "enter":        "out",
    "in":           "out",
    "out":          "in",
]);

string query_reverse(string dir)
{
    if (undefinedp(r_dirs[dir]))
        return 0;

    return r_dirs[dir];
}

string query_chinese_dir(string dir)
{
    return default_dirs[dir];
}

int help(object me)
{
    write(@HELP
指令格式 : go <方向>

让你往指定的方向移动。

HELP );
    return 1;
}
