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
    return FCC(118)"民以食为天"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "根据周不通的指引，熟悉怎么在江湖上生存。\n";
    msg += HIY "(提示：如果一个NPC名称前面有 ! 就代表有适合你的任务)\n\n" NOR;
    msg += "民以食为天，行走江湖也得吃喝，现在去醉仙楼买一个包子给我。\n";
    msg += "醉仙楼就在客店北面不远，如果你使用mudlet客户端，可自动寻路（指令：gtr 82）。\n\n";
    msg += HIY "(提示：在醉仙楼可以使用list指令查看可交易物品，使用buy指令交易)\n" NOR;
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
    return player->isSolved(F_QUEST("_0_tutorial2"));
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
        "$ME对$YOU说到：" HIG "有没有感觉肚子饿？\n" NOR,
        "$ME对$YOU说到：" HIG "去旁边的醉仙楼买点吃的吧，记得顺便带一个包子给我。\n" NOR,
        "$ME对$YOU说到：" HIG "可以使用eat指令吃东西，使用drink指令喝水，自己试试吧。\n" NOR,
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
    return (["/d/city/npc/obj/baozi.c":1]);
}

// 完成任務的條件除了系統提供的
// 1. 搜集物品
// 2. 殺了足夠數量的怪物之外
// 有需要的話，還可以自訂完成任務條件
// return 1;為滿足條件, return 0;為失敗
int postCondition(object player, object npc)
{
    return 1;
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
        CYN "$ME对$YOU说到：" HIG "游戏中对未成年人有保护，不用担心饿死，在客店茶房也有免费食物。\n" NOR,
        CYN "$ME对$YOU说到：" HIG "水袋中的水喝光后可以去南大街的春来茶馆免费补充（指令：fill）。\n" NOR,
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
