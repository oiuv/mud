/**
 * @file quest_d.c
 * @author Acme- 2007.02.04 (雪风@mud.ren)
 * @brief 任务守护进程，请根据游戏需要自己实现
 *        接受任务：QUEST_D->doAssign(npc, me);
 *        完成任务：QUEST_D->doReward(npc, me);
 * @version 1.0
 * @date 2021-12-02
 *
 * @copyright Copyright (c) 2021
 *
 */
#include <ansi.h>
// 游戏任务目录，应该在 <globals.h> 中定义
#ifndef QUEST_DIR
#define QUEST_DIR   CORE_DIR "world/quest/"
#endif
inherit CORE_SAVE;

mapping assigner;
mapping rewarder;

void create()
{
    seteuid(getuid());
    if (!restore() && !mapp(assigner))
        assigner = ([]);
    if (!restore() && !mapp(rewarder))
        rewarder = ([]);
}

string query_save_file()
{
    return DATA_DIR + "quest_d";
}

mapping getAssigner() { return assigner; }
mapping getRewarder() { return rewarder; }

protected string getItemFile(object item)
{
    string file;
    if (!objectp(item))
        return "";
    file = file_name(item);
    if (sscanf(file, "%s#%*d", file) != 2)
        return "";
    return file + ".c";
}

protected void insertAssigner(string npc_file, string quest_file)
{
    if (undefinedp(assigner[npc_file]))
        assigner[npc_file] = ({});

    if (member_array(quest_file, assigner[npc_file]) != -1)
        return;

    assigner[npc_file] += ({quest_file});
}

protected void insertRewarder(string npc_file, string quest_file)
{
    if (undefinedp(rewarder[npc_file]))
        rewarder[npc_file] = ({});

    if (member_array(quest_file, rewarder[npc_file]) != -1)
        return;

    rewarder[npc_file] += ({quest_file});
}

varargs void doScanQuest(string dir)
{
    string file;
    mixed *files, *dirent;

    if (!stringp(dir))
        dir = QUEST_DIR;

    files = get_dir(dir, -1);

    if (!sizeof(files))
    {
        if (file_size(dir) == -2)
            write("QUESTD: 任務目錄是空的。 (" + dir + ")\n");
        else
            write("QUESTD: 沒有這個任務目錄。 (" + dir + ")\n");
        return;
    }

    // 清空，整個重掃
    assigner = ([]);
    rewarder = ([]);

    write("掃瞄任務中 " + dir + " ...\n\n");

    foreach (dirent in files)
    {
        file = dir + dirent[0];
        write(sprintf("%-60s", file));

        if (!file->isQuest())
        {
            write(" -> 非任務檔.\n");
            continue;
        }

        insertAssigner(file->getAssigner(), file);
        insertRewarder(file->getRewarder(), file);

        write(" -> OK.\n");
    }

    write("\n掃瞄完成。\n\n");

    save();
}

protected void confirmAssign(string input, object player, string quest_file)
{
    if (input != "")
    {
        if (input[0] == 'y' || input[0] == 'Y')
        {
        }
        else if (input[0] == 'n' || input[0] == 'N')
        {
            tell_object(player, HIB "(你放棄接受任務：" + quest_file->getName() + ")\n" NOR);
            return;
        }
        else
        {
            tell_object(player, HIW "\n你要接受這一個任務嗎？ (Y/n) " NOR);
            input_to("confirmAssign", player, quest_file);
            return;
        }
    }

    // 接受任務
    tell_object(player, HIY "(你接受了任務：" + quest_file->getName() + ")\n" NOR);
    player->setToDo(quest_file);
    player->save();
}

protected void doAssignQuest(object npc, object player, string quest_file)
{
    int i = 0, message_size;
    string *assignMessage;

    assignMessage = quest_file->getAssignMessage();
    message_size = sizeof(assignMessage);

    // 訊息顯示可以用成一句一句說，先做成一次噴出來
    // for (i = 0; i < message_size; i++)
    //     msg("vision", assignMessage[i], npc, player);
    if (message_size)
    {
        foreach (string info in assignMessage)
        {
            call_out((: msg :), i, "info", info, npc, player);
            i++;
        }
    }
    call_out((: tell_object :), i, player, HIW "\n你要接受這一個任務嗎？ (Y/n)\n" NOR);
    input_to("confirmAssign", player, quest_file);
}

// 取得可解的任務index值
protected int *getQuestIndex(object player, string npc_file)
{
    int i;
    string quest_file;
    int *index = ({});

    quest_file = assigner[npc_file];
    for (i = 0; i < sizeof(quest_file); i++)
    {
        // 已經接了
        if (player->getToDo(quest_file[i]))
            continue;

        // 已經完成了而且不是可重複解的任務
        if (player->isSolved(quest_file[i]) != -1 && !quest_file[i]->isNewly())
            continue;

        // 前置條件達到才有機會接受任務
        if (!quest_file[i]->preCondition(player))
            continue;

        index += ({i});
    }

    return index;
}

protected void getSelect(string input, object player, object npc, int *index)
{
    int select;
    string quest_file, npc_file;

    if (!input || input == "")
    {
        tell_object(player, "請選擇？");
        input_to("getSelect", player, npc, index);
        return;
    }

    if (sscanf(input, "%d", select) != 1)
    {
        tell_object(player, "請輸入數字，請選擇？");
        input_to("getSelect", player, npc, index);
        return;
    }

    if (select == 0)
        return;

    if (select < 0 || select > sizeof(index))
    {
        tell_object(player, "請輸入正確的數字，請選擇？");
        input_to("getSelect", player, npc, index);
        return;
    }

    npc_file = getItemFile(npc);
    select--;
    quest_file = assigner[npc_file][index[select]];

    doAssignQuest(npc, player, quest_file);
}

int doAssign(object npc, object player)
{
    int i, *index;
    string npc_file, *quest_file, msg;

    if (!objectp(npc) || !objectp(player))
        return 0;
    if (!userp(player))
        return 0;

    npc_file = getItemFile(npc);

    if (undefinedp(assigner[npc_file]))
    {
        tell_object(player, HIW + npc->name() + "似乎不太想理你。\n" NOR);
        return 0;
    }

    if (player->getToDoListSize() >= QUEST_SIZE)
    {
        tell_object(player, HIW "你的任務日誌滿了。\n" NOR);
        return 0;
    }

    quest_file = assigner[npc_file];
    index = getQuestIndex(player, npc_file);

    if (!sizeof(index))
    {
        tell_object(player, HIW + npc->name() + "對著你微笑示意。\n" NOR);
        return 0;
    }

    // 只有一個任務可以解的話，就不列出選項
    if (sizeof(index) == 1)
    {
        doAssignQuest(npc, player, quest_file[index[0]]);
        return 1;
    }

    msg = "你目前可以向" + npc->name() + "取得的任務有：\n";
    msg += "   0. 取消，不接受任何任務。\n";
    for (i = 0; i < sizeof(index); i++)
        msg += sprintf("  %2d. %s\n", i + 1, quest_file[index[i]]->getName());
    msg += "\n請選擇？";

    tell_object(player, msg);
    input_to("getSelect", player, npc, index);

    return 1;
}

void doKilled(object npc, object player)
{
    mapping toDoList;
    string npc_file;
    string *key;
    int i, size;

    if (!objectp(npc) || !objectp(player))
        return;
    if (userp(npc) || !userp(player))
        return;

    npc_file = getItemFile(npc);
    toDoList = player->getToDoList();

    if (!mapp(toDoList))
        return;

    key = keys(toDoList);
    size = sizeof(key);

    for (i = 0; i < size; i++)
    {
        if (undefinedp(toDoList[key[i]]["killed"][npc_file]))
            continue;
        player->addKilled(key[i], npc_file, 1);
    }
}

protected int checkKill(object npc, object player, string quest_file)
{
    int i, size, *value;
    string *key;
    mapping kill;

    kill = quest_file->getKill();

    if (!mapp(kill))
        return 1;

    // 檢查kill
    key = keys(kill);
    value = values(kill);
    size = sizeof(key);

    for (i = 0; i < size; i++)
        if (player->getKilled(quest_file, key[i]) < value[i])
            return 0;

    return 1;
}

protected int checkItem(object npc, object player, string quest_file)
{
    int ok, amount, need_amount;
    int i, j, inv_size, size;
    int *value;
    string *key, item_file;
    mapping item;
    object *inv;

    item = quest_file->getItem();

    if (!mapp(item))
        return 1;

    // 檢查item
    key = keys(item);
    value = values(item);
    size = sizeof(key);

    inv = all_inventory(player);
    inv_size = sizeof(inv);

    // 任務需要的物品
    for (i = 0; i < size; i++)
    {
        // 該物品已經搜集好了
        if (player->getItem(quest_file, key[i]) >= value[i])
        {
            ok++;
            continue;
        }

        // 角色身上的物品
        for (j = 0; j < inv_size; j++)
        {
            item_file = getItemFile(inv[j]);

            // write("    身上物品：" + inv[j]->short() + " (" + item_file + ")\n");
            // 同一個檔名
            if (item_file == key[i])
            {

                msg("vision", "$ME對著$YOU說道：看來你已經帶來了" + inv[j]->name() + "。", npc, player);

                // 非複合物品
                if (!function_exists("query_amount", inv[j]))
                {
                    destruct(inv[j]);
                    player->addItem(quest_file, key[i], 1);

                    // 複合物品
                }
                else
                {

                    // 任務需要的數量 - 已經給予的數量 = 還需要多少的物品
                    need_amount = value[i] - player->getItem(quest_file, key[i]);
                    amount = inv[j]->query_amount();

                    // 數量足夠
                    if (amount >= need_amount)
                    {
                        inv[j]->add_amount(-need_amount);
                        player->addItem(quest_file, key[i], need_amount);
                        // 數量不足夠
                    }
                    else
                    {
                        destruct(inv[j]);
                        player->addItem(quest_file, key[i], amount);
                    }
                }

                // 經過一連串的檢查後，可能已經搜集好了
                if (player->getItem(quest_file, key[i]) >= value[i])
                {
                    ok++;
                    break;
                }
            }
        }
    }

    if (ok == size)
        return 1;
    return 0;
}

protected int isReward(object npc, object player, string quest_file)
{
    int i, message_size;
    string *rewardMessage;

    // write("【任務系統】檢查物品....\n");
    if (!checkItem(npc, player, quest_file))
        return 0;
    // write("【任務系統】檢查殺怪物....\n");
    if (!checkKill(npc, player, quest_file))
        return 0;
    // write("【任務系統】檢查自訂條件....\n");
    if (!quest_file->postCondition(player, npc))
        return 0;

    // 從任務表移除
    player->delToDo(quest_file);

    // 已解
    player->setSolved(quest_file);
    player->save();

    // 顯示解完的訊息
    rewardMessage = quest_file->getRewardMessage();
    message_size = sizeof(rewardMessage);

    // 訊息顯示可以用成一句一句說，先做成一次噴出來
    for (i = 0; i < message_size; i++)
        msg("info", rewardMessage[i], npc, player);
    // if (message_size)
    // {
    //     i = 0;
    //     foreach (string info in rewardMessage)
    //     {
    //         call_out((: msg :), i, "info", info, npc, player);
    //         i++;
    //     }
    // }
    return 1;
}

int doReward(object npc, object player)
{
    int i, quest_size, ok = 0;
    string npc_file, *quest_file;

    if (!objectp(npc) || !objectp(player))
        return 0;
    if (!userp(player))
        return 0;

    npc_file = getItemFile(npc);

    if (undefinedp(rewarder[npc_file]))
        return 0;

    quest_file = rewarder[npc_file];
    quest_size = sizeof(quest_file);

    for (i = 0; i < quest_size; i++)
    {
        // 沒有接這個任務
        if (!player->getToDo(quest_file[i]))
            continue;

        // 任務條件達到才能完成
        if (!isReward(npc, player, quest_file[i]))
            continue;

        // 領取獎勵
        quest_file[i]->reward(player, npc);

        ok = 1;
    }

    return ok;
}

int hasQuest(object player, object npc)
{
    if (!sizeof(getQuestIndex(player, getItemFile(npc))))
        return 0;
    else
        return 1;
}
