// hp cmds (Mon  09-04-95)
// Update by xuefeng@mud.ren

#include <ansi.h>
inherit F_CLEAN_UP;

string status_color(int current, int max);

int main(object me, string arg)
{
    object ob;
    mapping my;
    string sp;
    // int craze;

    seteuid(getuid(me));

    if (arg && (arg == "-m"
        || sscanf(arg, "-m %s", arg)
        || sscanf(arg, "%s -m", arg)))
    {
        int ml, mn;
        int exp, lv, need;

        if (arg == "-m")
                ob = me;
        else
        if (wizardp(me))
        {
            ob = present(arg, environment(me));

            if (! ob || ! ob->is_character())
                ob = find_player(arg);

            if (! ob || ! ob->is_character())
                ob = find_living(arg);

            if (! ob || ! ob->is_character())
                return notify_fail("你要察看谁的状态？\n");
        } else
            return notify_fail("只有巫师能察看别人的状态。\n");

        my = ob->query_entire_dbase();

        if (userp(ob) && (! stringp(my["born"]) || ! my["born"]))
            return notify_fail("还没有出生呐，察看什么？\n");

        if (my["max_jing"] < 1 || my["max_qi"] < 1)
            return notify_fail("无法察看" + ob->name(1) + "的状态。\n");

        // 狂暴铁拳增加加力上限
        if (ob->query("special_skill/might"))
            ml = (int)ob->query_skill("force") * 3 / 4;
        else
            ml = (int)ob->query_skill("force") / 2;

        // 愤怒之心增加加怒上限
        if (ob->query("special_skill/wrath"))
            mn = ob->query_max_craze() / 70;
        else
            mn = ob->query_max_craze() / 100;

        exp = ob->query("combat_exp") * 10;

        lv = to_int(pow(to_float(exp), 1.0 / 3)) + 1;
        need = lv * lv * lv / 10 - ob->query("combat_exp");

        if (need < 1)
            need = 1;
        sp = "@#hpM@";

        sp += sprintf("精力上限:%d|内力上限:%d|",
                ob->query_jingli_limit(), ob->query_neili_limit());

        sp += sprintf("潜能上限:%d|体会上限:%d|",
                ob->query_potential_limit() - (int)ob->query("learned_points"),
                ob->query_experience_limit() - (int)ob->query("learned_experience"));

        sp += sprintf("当前等级%d|升级所需:%d|", lv, need);

        sp += sprintf("最大加怒:%d|最大加力:%d|", mn, ml);

        sp += sprintf("死亡保护:%s|",
                ! ob->query("skybook/guard/death") ? "無保護" : "保護中");

        sp += sprintf("杀戮保护:%s@\n",
                ! ob->query_condition("die_guard") ? "無保護" : "保護中");

        tell_object(me, sp);
        return 1;
    }

    if (arg && (arg == "-g"
        || sscanf(arg, "-g %s", arg)
        || sscanf(arg, "%s -g", arg)))
    {
        if (arg == "-g")
                ob = me;
        else
        if (wizardp(me))
        {
                ob = present(arg, environment(me));

                if (! ob || ! ob->is_character())
                        ob = find_player(arg);

                if (! ob || ! ob->is_character())
                        ob = find_living(arg);

                if (! ob || ! ob->is_character())
                        return notify_fail("你要察看谁的状态？\n");
        } else
                return notify_fail("只有巫师能察看别人的状态。\n");

        my = ob->query_entire_dbase();

        if (userp(ob) && (! stringp(my["born"]) || ! my["born"]))
                return notify_fail("还没有出生呐，察看什么？\n");

        if (my["max_jing"] < 1 || my["max_qi"] < 1)
                return notify_fail("无法察看" + ob->name(1) + "的状态。\n");

        sp = "@#hpG@";
        // sp += HIY "【 种 类 】 " HIC "『初始』 『先天』 『成功』 『失败』 『故事』 『转世』\n" NOR;
        sp += sprintf("膂力:%d %d %d %d %d %d|",
        ob->query("str") - ob->query("gift/str/succeed") - ob->query("gift/sun"),
        ob->query("str"),
        ob->query("gift/str/succeed"),
        ob->query("gift/str/fail"),
        ob->query("gift/sun"),
        ob->query("reborn/str")),
        //ob->query("tattoo/tattoo_str"));

        sp += sprintf("悟性:%d %d %d %d %d %d|",
        ob->query("int") - ob->query("gift/int/succeed") - ob->query("gift/water"),
        ob->query("int"),
        ob->query("gift/int/succeed"),
        ob->query("gift/int/fail"),
        ob->query("gift/water"),
        ob->query("reborn/int")),
        //ob->query("tattoo/tattoo_int"));

        sp += sprintf("根骨:%d %d %d %d %d %d|",
        ob->query("con") - ob->query("gift/con/succeed") - ob->query("gift/lighting"),
        ob->query("con"),
        ob->query("gift/con/succeed"),
        ob->query("gift/con/fail"),
        ob->query("gift/lighting"),
        ob->query("reborn/con")),
        //ob->query("tattoo/tattoo_con"));

        sp += sprintf("身法:%d %d %d %d %d %d@\n",
        ob->query("dex") - ob->query("gift/dex/succeed") - ob->query("gift/feng"),
        ob->query("dex"),
        ob->query("gift/dex/succeed"),
        ob->query("gift/dex/fail"),
        ob->query("gift/feng"),
        ob->query("reborn/dex")),
        //ob->query("tattoo/tattoo_dex"));

        tell_object(me, sp);
        return 1;
    }

    if (! arg)
            ob = me;
    else
    if (wizardp(me))
    {
            ob = present(arg, environment(me));
            if (! ob || ! ob->is_character()) ob = find_player(arg);
            if (! ob || ! ob->is_character()) ob = find_living(arg);
            if (! ob || ! ob->is_character())
                    return notify_fail("你要察看谁的状态？\n");
    } else
            return notify_fail("只有巫师能察看别人的状态。\n");

    my = ob->query_entire_dbase();

    if (userp(ob) && (! stringp(my["born"]) || ! my["born"]))
            return notify_fail("还没有出生呐，察看什么？\n");

    if (my["max_jing"] < 1 || my["max_qi"] < 1)
            return notify_fail("无法察看" + ob->name(1) + "的状态。\n");

    sp = "@#hp@";
    sp += sprintf("名称:%s|",ob->short());
    sp += sprintf("精气:%d/%d/%d|精力:%d/%d(+%d)|",
                  my["jing"], my["eff_jing"], my["max_jing"],
                  my["jingli"], my["max_jingli"], my["jiajing"]);

    sp += sprintf("气血:%d/%d/%d|内力:%d/%d(+%d)|",
                  my["qi"], my["eff_qi"], my["max_qi"],
                  my["neili"], my["max_neili"], my["jiali"]);

    sp += sprintf("食物:%d/%d|潜能:%d|",
                  my["food"], ob->max_food_capacity(),
                  (int)ob->query("potential") - (int)ob->query("learned_points"));

    sp += sprintf("饮水:%d/%d|体会:%d|",
                  my["water"], ob->max_water_capacity(),
                  my["experience"] - my["learned_experience"]);

    // if (craze = me->query_craze())
    // {
    //         if (me->is_most_craze())
    //                 sp += HIR "【 愤 " BLINK "怒" NOR HIR " 】  " +
    //                         sprintf("%-22s", me->query("character") == "光明磊落" ?
    //                                         "竖发冲冠" : "怒火中烧");
    //         else
    //                 sp += sprintf(HIR "【 愤 怒 】 %5d/ %5d (+%-3d)    ",
    //                                 craze, me->query_max_craze(),
    //                                 me->query("jianu"));
    // } else
    // {
    //         sp += HIC "【 平 和 】   ---------            ";
    // }
    sp += sprintf("经验:%d@\n", my["combat_exp"]);
    tell_object(me, sp);
    return 1;
}

string status_color(int current, int max)
{
    int percent;

    if (max > 0)
        percent = current * 100 / max;
    else
        percent = 100;

    if (percent > 100) return HIC;
    if (percent >= 90) return HIG;
    if (percent >= 60) return HIY;
    if (percent >= 30) return YEL;
    if (percent >= 10) return HIR;
    return RED;
}

int help(object me)
{
    write(@HELP
指令格式：hp [-m] [-g]
          hp [-m] [-g] <对象名称>               （巫师专用）

这个指令可以显示你或指定对象的精气内力等数值。如果添加 -m 参
数则更详细的列出各种数值的最大有效果值。如果添加 -g 参数则会
详细的列出你的天赋属性状态。其中『原始』指你在投胎或转世重生
后本身所具备的原始值。『先天』则是指该项先天属性的总值，这项
属性可以通过吃丹或是激发故事以获得提升。而『成功』和『失败』
是指你所吃增加先天属性类仙丹的效果。『故事』是指你是否曾在游
戏中通过某些故事提升过相应的先天属性。最后的『刺青』则表示你
是否通过了纹身这个途径来增加了后天属性。

相关指令：score
HELP);
    return 1;
}
