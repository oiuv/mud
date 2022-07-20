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
    return FCC(118)"师门任务"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "根据周不通的指引，熟悉怎么在江湖上生存。\n";
    msg += HIY "(提示：如果一个NPC名称前面有 ! 就代表有适合你的任务)\n\n" NOR;
    msg += "天下风云出我辈，一入江湖岁月催。\n";
    msg += "拜师学艺不只需要潜能，对武功绝招的学习还需要门派贡献。\n";
    msg += "请找你门派掌门领取师门任务并完成（帮助：help quest）。\n";
    msg += HIG "任务要求：完成师门任务5次\n" NOR;
    msg += HIY "(提示：玩家经验10万以内的任务为送信，超过10万的任务为杀人)\n" NOR;

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
    return player->isSolved(F_QUEST("_0_tutorial6"));
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
        "$ME对$YOU说到：" HIG "拜师学习不只是需要消耗潜能，如果要学习绝招还需门派贡献。\n" NOR,
        "$ME对$YOU说到：" HIG "而门派贡献的获取需要完成师门任务。\n" NOR,
        "$ME对$YOU说到：" HIG "找到你的掌门领取师门任务吧（指令：quest）\n" NOR,
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
    return player->query("quest_count") >= 5;
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
        CYN "$ME对$YOU说到：" HIG "师门任务是玩家成长的重要方式。\n" NOR,
        CYN "$ME对$YOU说到：" HIG "除了经验、潜能和门派贡献奖励，还有物品奖励。\n" NOR,
        CYN "$ME对$YOU说到：" HIG "物品奖励需要门派贡献换取，具体见帮助(help item)\n" NOR,
    });
    return msg;
}

string getReward()
{
    string msg = " - 经验：500+\n"
                 " - 潜能：100+\n"
                 " - 门派贡献：50+\n"
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
    sc = 50 + random(5);

    GIFT_D->work_bonus(player, ([
        "exp":exp,
        "pot":pot,
        "gongxian":sc,
    ]));
}
