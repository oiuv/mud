/**
 * @file user_quest.c
 * @author Acme (雪风@mud.ren)
 * @brief 玩家任务管理接口，由玩家对接继承
 * @version 1.0
 * @date 2021-12-04
 *
 * @copyright Copyright (c) 2021
 *
 */

#include <ansi.h>
#include <dbase.h>

mapping toDoList = ([]);
string *solved = ({});

mapping getToDoList();
string *getSolved();
void setToDo(string quest_file);
void setSolved(string quest_file);
void addKilled(string quest_file, string killed_file, int amount);
int getKilled(string quest_file, string killed_file);
void addItem(string quest_file, string item_file, int amount);
int getItem(string quest_file, string item_file);
mapping getToDo(string quest_file);
int isSolved(string quest_file);
void delToDo(string quest_file);
void delSolved(string quest_file);

mapping getToDoList()
{
    return toDoList;
}

string *getSolved()
{
    return solved;
}

int getToDoListSize()
{
    return sizeof(toDoList);
}

void setToDo(string quest_file)
{
    int i, size;
    mapping kill;
    string *key;

    if (!quest_file || !stringp(quest_file))
        return;

    if (!quest_file->isQuest())
        return;

    if (sizeof(toDoList) >= QUEST_SIZE)
        return;

    if (!undefinedp(toDoList[quest_file]))
        return;

    toDoList[quest_file] = ([]);
    toDoList[quest_file]["killed"] = ([]);
    toDoList[quest_file]["item"] = ([]);

    kill = quest_file->getKill();
    key = keys(kill);
    size = sizeof(kill);

    for (i = 0; i < size; i++)
        addKilled(quest_file, key[i], 0);
}

void setSolved(string quest_file)
{
    if (!quest_file || !stringp(quest_file))
        return;

    if (!quest_file->isQuest())
        return;

    // 已經解決就不再加一次
    if (member_array(quest_file, solved) != -1)
        return;

    solved += ({quest_file});
}

void addKilled(string quest_file, string killed_file, int amount)
{
    mapping kill;

    if (!quest_file->isQuest())
        return;

    if (undefinedp(toDoList[quest_file]))
        return;

    kill = quest_file->getKill();

    if (undefinedp(kill[killed_file]))
        return;

    if (undefinedp(toDoList[quest_file]["killed"][killed_file]))
        toDoList[quest_file]["killed"][killed_file] = 0;

    toDoList[quest_file]["killed"][killed_file] += amount;
}

int getKilled(string quest_file, string killed_file)
{
    if (!quest_file->isQuest())
        return 0;

    if (undefinedp(toDoList[quest_file]))
        return 0;

    if (undefinedp(toDoList[quest_file]["killed"][killed_file]))
        return 0;

    return toDoList[quest_file]["killed"][killed_file];
}

void addItem(string quest_file, string item_file, int amount)
{
    mapping item;

    if (!quest_file->isQuest())
        return;

    if (undefinedp(toDoList[quest_file]))
        return;

    item = quest_file->getItem();

    if (undefinedp(item[item_file]))
        return;

    if (undefinedp(toDoList[quest_file]["item"][item_file]))
        toDoList[quest_file]["item"][item_file] = 0;

    toDoList[quest_file]["item"][item_file] += amount;
}

int getItem(string quest_file, string item_file)
{
    if (!quest_file->isQuest())
        return 0;

    if (undefinedp(toDoList[quest_file]))
        return 0;

    if (undefinedp(toDoList[quest_file]["item"][item_file]))
        return 0;

    return toDoList[quest_file]["item"][item_file];
}

mapping getToDo(string quest_file)
{
    if (!mapp(toDoList) || undefinedp(toDoList[quest_file]))
        return 0;
    return toDoList[quest_file];
}

/* 檢查是否已經解過
       -1: 未解過
   others: 解過
 */
int isSolved(string quest_file)
{
    return member_array(quest_file, solved||({}));
}

void delToDo(string quest_file)
{
    if (undefinedp(toDoList[quest_file]))
        return;
    map_delete(toDoList, quest_file);
}

void delSolved(string quest_file)
{
    if (member_array(quest_file, solved) == -1)
        return;
    solved -= ({quest_file});
}
