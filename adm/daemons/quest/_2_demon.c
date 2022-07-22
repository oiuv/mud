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
int isNewly() { return 1; }

// 此任务可否放弃，特殊任务可限制放弃
int noGiveUp() { return 1; }

// 任務名稱
string getName()
{
    return FCC(118)"幻境心魔"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "练武修身养性的过程中也会产生心魔，稍有不慎就会走火入魔。\n";
    msg += "武功达先天之境可自斩心魔，但后天之境的凡夫俗子无法做到。\n";
    msg += "子虚道人修为通天，可助后辈进入幻境历练，通过斩杀心魔磨砺自身。\n";
    msg += HIG "任务要求：斩杀心魔20次\n" NOR;
    msg += HIY "(提示：魔由心生，幻境心魔的等级参考的是玩家等级)\n" NOR;

    return msg;
}

// 任務等級
int getLevel()
{
    return 100;
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
    return player->query("combat_exp") > 100000;
}

// 接受任務的NPC  (以檔名來識別，注意加上`.c`)
string getAssigner()
{
    return "/adm/daemons/task/npc/zixu.c"; // 子虚道人
}

// 接受任務時的訊息
string *getAssignMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        "$ME对$YOU说到：" HIG "魔由心生，我辈修士需面对心魔的诱惑。\n" NOR,
        "$ME对$YOU说到：" HIG "砍杀心魔是磨砺自身的方式之一。\n" NOR,
        "$ME对$YOU说到：" HIG "如果你意思，我可助你进入心魔幻境修炼。\n" NOR,
    });
    return msg;
}

// 任務須要殺死某些怪物(以檔名來識別，注意加上`.c`)，若不需要則 return 0
mapping getKill()
{
    return ([CLASS_D("generate") + "/demon.c":20]);
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
    return 1;
}

// 完成任務的NPC (以檔名來識別，注意加上`.c`)
string getRewarder()
{
    return "/adm/daemons/task/npc/zixu.c"; // 子虚道人
}

// 完成任務時的訊息
string *getRewardMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        CYN "$ME对$YOU说到：" HIG "只要还有七情六欲，心魔就不会消失。\n" NOR,
        CYN "$ME对$YOU说到：" HIG "你可以随时重新进入幻境修行。\n" NOR,
    });
    return msg;
}

string getReward()
{
    string msg = " - 经验：500+\n"
                 " - 潜能：1000+\n"
                 " - 江湖阅历：50+\n"
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
    pot = 1000 + random(100);
    sc = 50 + random(5);

    GIFT_D->work_bonus(player, ([
        "exp":exp,
        "pot":pot,
        "score":sc,
    ]));
}
