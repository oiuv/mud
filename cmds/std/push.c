// push.c 推人

#include <ansi.h>

mapping default_where = ([
        "n":    "north",
        "s":    "south",
        "e":    "east",
        "w":    "west",
        "nu":   "northup",
        "su":   "southup",
        "eu":   "eastup",
        "wu":   "westup",
        "nd":   "northdown",
        "sd":   "southdown",
        "ed":   "eastdown",
        "wd":   "westdown",
        "ne":   "northeast",
        "nw":   "northwest",
        "se":   "southeast",
        "sw":   "southwest",
        "u":    "up",
        "d":    "down",
]);

mapping default_dirs = ([
        "north":        "北边",
        "south":        "南边",
        "east":         "东边",
        "west":         "西边",
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
        "out":          "外面",
]);

mapping default_undirs = ([
        "south":        "北边",
        "north":        "南边",
        "west":         "东边",
        "east":         "西边",
        "southup":      "北边",
        "northup":      "南边",
        "westup":       "东边",
        "eastup":       "西边",
        "southdown":    "北边",
        "northdown":    "南边",
        "westdown":     "东边",
        "eastdown":     "西边",
        "southwest":    "东北",
        "southeast":    "西北",
        "northwest":    "东南",
        "northeast":    "西南",
        "down":         "上面",
        "up":           "下面",
        "out":          "里面",
        "enter":        "外面",
]);

int main(object me, string arg)
{
        string who, where, dir, undir, where_temp;
        object env, env_to;
        mapping exits;
        object target;
        string msg;
        int wiz_push;

        if (! arg || sscanf(arg, "%s to %s", who, where_temp) != 2) 
                return notify_fail("指令格式：push <人物> to <方向>\n");

        env = environment(me);

        if (wiz_level(me) < 3 && env->query("no_fight"))
                return notify_fail("这里不是你嚣张的地方。\n");

        if (! objectp(target = present(who, env)))
                return notify_fail("你要推开谁？\n");

        if (wiz_level(me) < wiz_level(target))
                return notify_fail("你找死啊？\n");

        if (! target->is_character())
                return notify_fail("看清楚一点，那并不是生物。\n");

        if (target->is_fighting())
                return notify_fail("人家现在正在打架呢，你想去找扁啊。\n");

        if (target->query_temp("on_baitan"))
                return notify_fail("人家正在做生意，还是别去打扰。\n");

        if (target->query("doing"))
                return notify_fail("人家现在正在冥神用功，不太好打扰别人吧。\n");

        if (! living(target))
                return notify_fail("这人现在没有知觉，你还是扶着人家走吧。\n");

        if (! playerp(target))
                return notify_fail("你看了看这个人，没敢动。\n");

        if (! undefinedp(default_where[where_temp]))
                where = default_where[where_temp];
        else
                where = where_temp;

        if (! mapp(exits = env->query("exits")) || undefinedp(exits[where]))
                return notify_fail("没有这个方向。\n");

        if (! objectp(env_to = find_object(exits[where])))
        {
                call_other(exits[where], "???");
                env_to = find_object(exits[where]);
        }

        wiz_push = wiz_level(me) >= wiz_level("(wizard)");

        if (! wiz_push)
        {
                if (me->query("qi", 1) < 150)
                        return notify_fail("你气力不佳，推不动别人。\n");
        
                if (me->query("neili", 1) < 100)
                        return notify_fail("你内力不济，推不动别人。\n");
        
                if (me->query_skill("force") < 100)
                        return notify_fail("你内功修为有限，没有到达举轻若重的地步。\n");
        }

        if (! undefinedp(default_dirs[where]))
                dir = default_dirs[where];
        else
                dir = where;

        if (! undefinedp(default_undirs[where]))
                undir = default_undirs[where];
        else
                undir = where;

        switch (random(3))
        {
        case 0:
                msg = HIC "$N" HIC "清咳一声，喝道：「让开了！」顺势就把$n"
                      HIC "往" + dir + HIC "一挤。\n" NOR;
                break;

        case 1:
                msg = HIC "$N" HIC "皱了皱眉头，恼道：「闪开！」随手便把$n"
                      HIC "往" + dir + HIC "一推。\n" NOR;
                break;

        default:
                msg = HIC "$N" HIC "双目一瞪，喝道：「还不快快给我闪开？」"
                      "说罢把$n" HIC "往" + dir + HIC "推去。\n" NOR;
                break;
        }

        if (! wiz_push)
        {
                me->receive_damage("qi", 100);
                me->add("neili", -50);
        }

        if (wiz_level(me) < wiz_level(target))
                msg += HIM "$N" HIM "用力推了推，只觉得好象撞到"
                       "了一堵墙一样。\n" NOR;
        else
        if (! wiz_push && target->query_skill("force") >= 150)
                msg += HIM "$N" HIM "默运内力，却觉得$n" HIM "内"
                       "功根基颇为扎实，全然无法推动。\n" NOR;
        else
        {
                if (! env->valid_leave(target, where))
                {
                        message_vision(msg, me, target);
                        write("过不去，你推不动人家。\n");
                        return 1;
                }

                if (! target || environment(target) != env)
                {
                        message_vision(msg, me, target);
                        write("奇怪了，人呢？\n");
                        return 1;
                }

                msg += WHT "顿时只见$N" WHT "这一下把$n"
                       WHT "「嘟噜嘟噜」的推了开去。\n" NOR;
                message_vision(msg, me, target);
                target->move(env_to);
                message("vision", WHT "只见" + target->name() + WHT "跌跌撞"
                                  "撞的从" + undir + WHT "晃了过来。\n",
                                  env_to, target);
                if (! target->is_busy())
                        target->stary_busy(5);
                return 1;
        }
        
        message_vision(msg, me, target);
        if (! me->is_busy())
                me->start_busy(1);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : push <人物> to <方向>

这个指令让你把觉得妨碍你的人推开，当然，倘若人家内功扎实，
你这一下子多半奏不了效。
HELP );
        return 1;
}
