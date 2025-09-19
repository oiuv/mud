/**
 * @file smith.c
 * @author 雪风@mud.ren
 * @brief 铁匠任务
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
    return FCC(118)"打铁还需自身硬"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "在铁匠铺打铁10000次，挑战自己的极限。\n";
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
    return "/d/city/npc/smith.c";
}

// 接受任務時的訊息
string *getAssignMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        "$ME对$YOU说到：" HIG "只打铁20次对我的打铁铺来说远远不够。\n" NOR,
        "$ME对$YOU说到：" HIG "要不要多打一些工呢？比如来个10000次。\n" NOR,
        "$ME对$YOU说到：" HIG "打铁比较累，注意自身的状态(指令：hp)哦。\n" NOR,
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
    return player->query("mark/job_smith") >= 10000;
}

// 完成任務的NPC (以檔名來識別，注意加上`.c`)
string getRewarder()
{
    return "/d/city/npc/smith.c";
}

// 完成任務時的訊息
string *getRewardMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        CYN "$ME对$YOU说到：" HIG "不错不错，你竟然能做到这个地步。\n" NOR,
    });
    return msg;
}

string getReward()
{
    string msg = " - 经验：10000+\n"
                 " - 潜能：5000+\n"
                 " - 江湖阅历：100+\n"
                 " - 称号：铁匠(暂未开放)\n"
                 " - 物品：乾坤石(打造背包的材料)\n"
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
    object reward_item;

    exp = 10000 + random(1000);
    pot = 5000 + random(500);
    sc = 100 + random(10);

    GIFT_D->work_bonus(player, ([
        "exp":exp,
        "pot":pot,
        "score":sc,
    ]));

    // 初始化并发放物品奖励
    reward_item = new("/clone/fam/item/qiankun_stone");
    reward_item->move(player);

    // todo 称号（计划放在成就系统中）
}
