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
    return FCC(118)"郭府打工（9527？）"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "根据周不通的指引，熟悉怎么在江湖上生存。\n";
    msg += HIY "(提示：如果一个NPC名称前面有 ! 就代表有适合你的任务)\n\n" NOR;
    msg += "去襄阳加入郭府，然后在郭府打工并学习基础的武功。\n";
    msg += "加入郭府后必须经验超过四万后才能离开，工作越勤奋离开时奖励越多。\n";
    msg += "步行去襄阳有点远，使用mudlet客户端可自动寻路（指令：gtr 1013）。\n";
    msg += "推荐方式为骑马去襄阳到郭府（路径：rideto xiangyang;w;n）。\n\n";
    msg += HIY "(提示：在醉仙楼后院马厩可以找马骑(指令：ride|unride|rideto))\n" NOR;
    msg += HIY "(提示：马厩是游戏中最基础的交通枢纽，玩家可以乘马车到其它城市)\n" NOR;
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
    return player->isSolved(F_QUEST("_0_tutorial3"));
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
        "$ME对$YOU说到：" HIG "除了打铁，游戏中还有大量适合新手的工作。\n" NOR,
        "$ME对$YOU说到：" HIG "比如心灵手巧的女玩家可以去杂货铺二楼找曾柔做裁缝。\n" NOR,
        "$ME对$YOU说到：" HIG "还有磨药、抄书、种药等等，更多工作可以help work了解。\n" NOR,
        "$ME对$YOU说到：" HIG "但是对新玩家最好的工作之一还是去襄阳郭府找郭大侠收留。\n" NOR,
        "$ME对$YOU说到：" HIG "去郭府打工，获取郭大侠的赏识，学会郭氏心法吧。\n" NOR,
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
    return player->query("mark/guofu_out");
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
        CYN "$ME对$YOU说到：" HIG "看来你在郭府收获不小，是时候闯荡江湖了。\n" NOR,
    });
    return msg;
}

string getReward()
{
    string msg = " - 经验：5000+\n"
                 " - 潜能：1000+\n"
                 " - 江湖阅历：100+\n"
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

    exp = 5000 + random(50);
    pot = 1000 + random(20);
    sc = 100 + random(5);

    GIFT_D->work_bonus(player, ([
        "exp":exp,
        "pot":pot,
        "score":sc,
    ]));
}
