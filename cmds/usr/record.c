// record.c

#include <ansi.h>

inherit F_CLEAN_UP;

/** 玩家数据标记（因多WIZ开发不统一规范，记录过于混乱）
 * birthgift 玩家生日礼物记录
 * festival 玩家节日礼物记录
 * gift 吃丹记录
 * job 采矿运货任务记录（完成后删除）
 * map 地图数据记录
 * mark 郭府打工等数据记录(推荐支线任务job数据和解迷状态标记记录在此)
 * mirror_* 宝镜任务记录
 * over_quest 北京练丹|转世任务等相关记录(推荐主要任务quest数据记录在此)
 * quest* 门派任务记录
 * rumor 传闻事件记录
 * skybook 死亡保护等三丹记录
 * state 玩家状态数据记录(推荐各种无状态统计数据记录在此)
 * static 黯然销魂掌记录
 * story 故事记录
 * tattoo 刺青记录
 */

int main(object me, string arg)
{
    object ob;
    mapping my;
    string line;

    if (!arg)
        ob = me;
    else if (wizardp(me) && SECURITY_D->valid_grant(me, "(wizard)"))
    {
        ob = present(arg, environment(me));
        if (!ob || !ob->is_character())
            ob = find_player(arg);
        if (!ob || !ob->is_character())
            ob = find_living(arg);
        if (!ob || !ob->is_character())
            return notify_fail("你要察看谁的状态？\n");
    }
    else
        return notify_fail("只有天神能察看别人的状态。\n");

    my = ob->query_entire_dbase();

    if (playerp(ob) && (!stringp(my["born"])))
        return notify_fail("还没有出生呐，察看什么？\n");

    if (!mapp(my["mark"]))
    {
        my["mark"] = ([]);
    }
    if (!mapp(my["state"]))
    {
        my["state"] = ([]);
    }
    if (!mapp(my["over_quest"]))
    {
        my["over_quest"] = ([]);
    }
    if (!my["state"]["quest"])
    {
        my["state"]["quest"] = my["quest_count"];
    }
    if (!my["state"]["mirror"])
    {
        my["state"]["mirror"] = my["mirror_count"];
    }

    line = (ob == me ? "你" : ob->name()) + "的游戏记录如下：\n";
    line += HIC "≡" HIY "----------------------------------------------------------------" HIC "≡\n" NOR;
    line += sprintf(HIW " 生日礼物领取次数：%d 次\n", sizeof(my["birthgift"]));
    line += sprintf(HIW " 扬州武庙祈福次数：%d 次\n", my["state"]["pray"]);
    line += "\n";
    line += sprintf(HIW " %-30s%-20s\n", "打铁次数：" + my["mark"]["job_smith"] + " 次", "抄书次数：" + my["mark"]["job_copy"] + " 次");
    if (my["gender"] == "女性")
    {
        line += sprintf(HIW " %-30s%-20s\n", "裁缝次数：" + my["mark"]["job_sew"] + " 次", "炒菜次数：" + my["mark"]["job_cook"] + " 次");
    }
    line += sprintf(HIW " %-30s%-20s\n", "磨药次数：" + my["mark"]["job_peiyao"] + " 次", "种花次数：" + my["mark"]["job_zhonghua"] + " 次");
    line += sprintf(HIW " 郭府打工次数：%d 次\n", my["mark"]["guofu_job"]);
    line += sprintf(HIW " %-30s%-20s\n", "采石次数：" + my["mark"]["job_mine1"] + " 次", "采石送货次数：" + my["mark"]["job_transit1"] + " 次");
    line += sprintf(HIW " %-30s%-20s\n", "采矿次数：" + my["mark"]["job_mine2"] + " 次", "采矿送货次数：" + my["mark"]["job_transit2"] + " 次");
    line += "\n";
    line += sprintf(HIW " 师门任务完成次数：%d 次\n", my["state"]["quest"]);
    line += sprintf(HIW " 宝镜任务完成次数：%d 次\n", my["state"]["mirror"]);
    line += sprintf(HIW " 江湖挑战接受次数：%d 次，获胜：%d 次\n", my["state"]["challenge"], my["state"]["challenge_win"]);
    line += sprintf(HIW " 屠人大赛参加次数：%d 次，获胜：%d 次\n", my["state"]["pk"], my["state"]["pk_win"]);
    line += sprintf(HIW " 支线解迷数量：%d 次\n", my["state"]["puzzle"]);
    line += "\n";
    line += sprintf(HIW " 钓鱼次数：%d 次\n", my["state"]["fish"]);
    line += sprintf(HIW " 打猎次数：%d 次\n", my["state"]["hunt"]);
    line += sprintf(HIW " 行医次数：%d 次\n", my["state"]["zhenjiu"]);
    line += sprintf(HIW " 炼丹次数：%d 次\n", my["over_quest"]["liandan_quest"]);
    line += "\n";
    line += sprintf(HIW " 偷窃次数：%d 次\n", my["thief"]);
    line += sprintf(HIW " 睡觉次数：%d 次\n", my["state"]["sleep"]);
    line += sprintf(HIW " 移动距离：%d 米\n", my["state"]["go"] * 5);
    line += "\n";
    if(me->query("family/family_name") == "丐帮")
    {
        line += sprintf(HIW " 乞讨成功次数：%d 次\n", my["state"]["beg"]);
    }
    line += HIC "≡" HIY "----------------------------------------------------------------" HIC "≡\n" NOR;
    write(line);
    debug("……更多游戏记录完善中……");

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式: time

这个指令记录了你的游戏数据，看看自己的成就吧。

HELP
    );
    return 1;
}
