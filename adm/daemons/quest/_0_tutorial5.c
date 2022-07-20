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
    return FCC(118)"拜师学艺"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "根据周不通的指引，熟悉怎么在江湖上生存。\n";
    msg += HIY "(提示：如果一个NPC名称前面有 ! 就代表有适合你的任务)\n\n" NOR;
    msg += "天下风云出我辈，一入江湖岁月催。\n";
    msg += "现在的你已经积累了一定的经验和潜能，也掌握了一些基础的武学。\n";
    msg += "但要笑傲江湖，这点实力是远远不够的，你需要加入门派拜师学艺。\n";
    msg += HIG "任务要求：选择一个门派加入（帮助：help menpai）。\n" NOR;
    msg += HIY "(提示：骑马可以快速到达各大门派(指令：rideto))\n" NOR;
    msg += HIY "(提示：到达门派后可以拜师(指令：bai｜帮助：help bai))\n" NOR;

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
    return player->isSolved(F_QUEST("_0_tutorial4"));
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
        "$ME对$YOU说到：" HIG "看来你在郭府收获不少呀。\n" NOR,
        "$ME对$YOU说到：" HIG "现在的你已经积累了一定的经验和潜能，也掌握了一些基础的武学。\n" NOR,
        "$ME对$YOU说到：" HIG "但这点实力是远远不够的，你需要加入门派拜师学艺。\n" NOR,
        "$ME对$YOU说到：" HIG "选择一个你心仪的门派加入吧（帮助：help menpai）。\n" NOR,
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
    return mapp(player->query("family"));
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
        CYN "$ME对$YOU说到：" HIG "拜师后就可以学习武功(指令：xue)。\n" NOR,
        CYN "$ME对$YOU说到：" HIG "学习基础武功可增加基础属性，而读书识字会增加悟性。\n" NOR,
        CYN "$ME对$YOU说到：" HIG "但学习需要消耗潜能，所以你需要打工或做任务增加潜能。\n" NOR,
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
