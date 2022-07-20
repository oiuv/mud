/**
 * @file tutorial.c
 * @author 雪风@mud.ren
 * @brief 新玩家指引任务
 * @version 1.0
 * @date 2022-07-15
 *
 * @copyright Copyright (c) 2022
 *
 */

#include <ansi.h>

void create() { seteuid(getuid()); }

// 說明此檔是任務
int isQuest() { return 1; }

/** 此任務是否能重複解
    return 0  不能重複
    return 1  可重複
    建議最好設定不能重複
 */
int isNewly() { return 0; }

// 此任务可否放弃，特殊任务可限制放弃
int noGiveUp() { return 0; }

// 任務名稱
string getName()
{
    return FCC(118)"第一份工作"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "根据周不通的指引，熟悉怎么在江湖上生存。\n";
    msg += HIY "(提示：如果一个NPC名称前面有 ! 就代表有适合你的任务)\n\n" NOR;
    msg += "扬州铁匠铺招学徒打铁，虽然比较累，但没有任何要求，正适合初入江湖的你。\n";
    msg += "铁匠铺在东大街，如果你使用mudlet客户端，可自动寻路（指令：gtr 17）。\n\n";
    msg += HIG "任务要求：帮铁匠打铁20次\n" NOR;
    msg += HIY "(提示：在打铁匠向铁匠 ask tie jiang about job 开始工作)\n";
    msg += HIY "(提示：可以使用record指令查看打铁记录)\n" NOR;
    return msg;
}

// 任務等級
int getLevel()
{
    return 1;
}

/* 接受任務的前置條件，可能是
        1. 等級需求
        2. 職業需求
        3. 種族需求
        4. 已完成某些任務需求
    等等，應可以自由發揮才是。
    回傳非零值表示符合條件。
 */
int preCondition(object player)
{
    return player->query("combat_exp") < 10000;
}

// 接受任務的NPC  (以檔名來識別，注意加上`.c`)
string getAssigner()
{
    return "/u/mudren/npc/butong.c"; // 周不通
}

// 接受任務時的訊息
string *getAssignMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        "$ME对$YOU说到：" HIG "初入江湖，实力低微，身无分文，该如何生存？\n" NOR,
        "$ME对$YOU说到：" HIG "先去做最基础的工作(help work)赚钱吧。\n" NOR,
        "$ME对$YOU说到：" HIG "听说铁匠铺在招学徒帮忙，你要不要去试试？\n" NOR,
        "$ME对$YOU说到：" HIG "任务详情请在接受任务后使用quest2指令查看。\n" NOR,
    });
    return msg;
}

// 任務須要殺死某些怪物(以檔名來識別，注意加上`.c`)，若不需要則 return 0
mapping getKill()
{
    return ([]);
}

// 任務須要取得某些物品(以檔名來識別，注意加上`.c`)，若不需要則 return 0
mapping getItem()
{
    return ([]);
}

// 完成任務的條件除了系統提供的
// 1. 搜集物品
// 2. 殺了足夠數量的怪物之外
// 有需要的話，還可以自訂完成任務條件
// return 1;為滿足條件, return 0;為失敗
int postCondition(object player, object npc)
{
    return player->query("mark/job_smith") >= 20;
}

// 完成任務的NPC (以檔名來識別，注意加上`.c`)
string getRewarder()
{
    return "/u/mudren/npc/butong.c"; // 周不通
}

// 完成任務時的訊息
string *getRewardMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        CYN "$ME对$YOU说到：" HIG "不错不错，打铁很累吧？当就锻炼身体了。\n" NOR,
    });
    return msg;
}

string getReward()
{
    string msg = " - 经验：500+\n"
                 " - 潜能：100+\n"
                 " - 江湖阅历：10+\n"
                 ;
    return msg;
}

/** 任務獎勵
    獎勵應該能自由發揮，如：
        1. 獲得經驗
        2. 獲得物品
        3. 獲得短暫Buff
        4. 習得某技能
        5. 更改玩家狀態, ex: 轉職
 */
void reward(object player, object npc)
{
    int exp, pot, sc;

    exp = 500 + random(50);
    pot = 100 + random(20);
    sc = 10 + random(5);

    GIFT_D->work_bonus(player, ([
        "exp":exp,
        "pot":pot,
        "score":sc,
    ]));
}
