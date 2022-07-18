/**
 * @file shisong.c
 * @author 雪风@mud.ren
 * @brief 史松任务，和茅十八任务二选一
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
    return FCC(208)"史松的友谊"NOR;
}

// 任務描述
string getDetail()
{
    string msg;

    msg = "杀掉天地会反贼茅十八，取得通缉令。\n";
    msg += HIY "(注意：接此任务后不能接茅十八的任务。)\n" NOR;

    return msg;
}

// 任務等級
int getLevel()
{
    return 50;
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
    string quest_file = __DIR__ "_1_mao18.c";
    return player->query("combat_exp") > 10000 && !player->getToDo(quest_file) && player->isSolved(quest_file) < 0;
}

// 接受任務的NPC  (以檔名來識別，注意加上`.c`)
string getAssigner()
{
    return "/d/city/npc/shisong.c"; // 史松
}

// 接受任務時的訊息
string *getAssignMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        "$ME对$YOU說道：" HIG "在下黑龙鞭史松，奉鳌少保将令，擒拿天地会反贼。\n" NOR,
        "$ME对$YOU說道：" HIG "帮我干掉茅十八这恶贼，我一定保你前程似锦。\n" NOR,
    });
    return msg;
}

// 任務須要殺死某些怪物(以檔名來識別，注意加上`.c`)，若不需要則 return 0
mapping getKill()
{
    return ([
        "/d/city/npc/mao18.c" : 1,   // 茅十八
    ]);
}

// 任務須要取得某些物品(以檔名來識別，注意加上`.c`)，若不需要則 return 0
mapping getItem()
{
    return (["/clone/lonely/item/tongjiling.c":1]);
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
    return "/d/city/npc/shisong.c"; // 史松
}

// 完成任務時的訊息
string *getRewardMessage()
{
    // $ME為NPC, $YOU為player
    string *msg = ({
        CYN "$ME对$YOU说到：" HIG "你把那姓茅的大盗干掉了？这可真是谢谢你了。\n" NOR,
        CYN "$ME对$YOU说到：" HIG "我这有一套云龙鞭法，如果你愿意，我倒是可以传你两手。\n" NOR,
    });
    return msg;
}

string getReward()
{
    string msg = " - 经验：1000+\n"
                 " - 潜能：500+\n"
                 " - 江湖阅历：5+\n"
                 " - 技能：云龙鞭法\n"
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

    exp = 1000 + random(300);
    pot = 500 + random(250);
    sc = 5 + random(25);

    player->add("combat_exp", exp);
    player->add("potential", pot);
    player->add("score", sc);
    tell_object(player, HIW "\n你成功的帮助史松弄到了通缉令！\n" NOR +
                    HIC "通过这次的历练，你获得了" + chinese_number(exp) +
                    "点经验、" + chinese_number(pot) + "点潜能以及" +
                    chinese_number(sc) + "点江湖阅历。\n" NOR);
    player->set("skybook/luding/shi", 1);
    player->set("can_learn/yunlong-bian/shi", 1);
}
