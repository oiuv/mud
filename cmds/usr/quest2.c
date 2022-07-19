/* quest2.c wirte by -Acme-
 */

#include <ansi.h>
inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

string getKill(object me, string quest_file)
{
    string *key, msg;
    int i, *value, size;
    mapping require;
    object ob;

    require = quest_file->getKill();

    if (!mapp(require))
        return "";

    key = keys(require);
    value = values(require);
    size = sizeof(key);

    if (!size)
        return "";

    msg = "\n已殺死：\n";
    for (i = 0; i < size; i++)
    {
        if (!objectp(ob = load_object(key[i])))
            continue;
        if (me->getKilled(quest_file, key[i]) >= value[i])
            msg += sprintf("  %s(%s)： %s\n" NOR, HIK + ob->name(), HIK + ob->query("id"), HIK + me->getKilled(quest_file, key[i]) + "/" + value[i]);
        else
            msg += sprintf("  %s(%s)： %d/%d\n", ob->name(), ob->query("id"), me->getKilled(quest_file, key[i]), value[i]);

        destruct(ob);
    }

    return msg;
}

string getItem(object me, string quest_file)
{
    string *key, msg;
    int i, *value, size;
    mapping require;
    object ob;

    require = quest_file->getItem();
    if (!mapp(require))
        return "";

    key = keys(require);
    value = values(require);
    size = sizeof(key);

    if (!size)
        return "";

    msg = "\n已取得：\n";
    for (i = 0; i < size; i++)
    {
        if (!objectp(ob = load_object(key[i])))
            continue;
        if (me->getItem(quest_file, key[i]) >= value[i])
            msg += sprintf("  %s(%s)： %s\n" NOR, HIK + ob->name(), HIK + ob->query("id"), HIK + me->getItem(quest_file, key[i]) + "/" + value[i]);
        else
            msg += sprintf("  %s(%s)： %d/%d\n", ob->name(), ob->query("id"), me->getItem(quest_file, key[i]), value[i]);

        // destruct(ob);
    }

    return msg;
}

void detail(object me, int index)
{
    int size;
    string *key, msg;
    mapping toDoList;

    toDoList = me->getToDoList();

    if (!mapp(toDoList))
        return;

    key = keys(toDoList);
    size = sizeof(key);

    if (!size)
        return;
    if (index < 1 || index >= size + 1)
        return;

    msg = HIY + repeat_string("─", 60) + "\n" NOR;
    msg += sprintf("%-60s\n", key[index - 1]->getName() + (wizardp(this_player()) ? " " + key[index - 1] : ""));
    msg += HIY + repeat_string("─", 60) + "\n\n" NOR;
    msg += key[index - 1]->getDetail();
    msg += getKill(me, key[index - 1]);
    msg += getItem(me, key[index - 1]);
    msg += "\n任务奖励：\n";
    msg += key[index - 1]->getReward() + "\n";
    msg += HIY + repeat_string("─", 60) + "\n" NOR;

    write(msg);
}

void list(object me)
{
    int i, size;
    string *key, msg;
    mapping toDoList;

    toDoList = me->getToDoList();

    if (!mapp(toDoList))
        return;

    key = keys(toDoList);
    size = sizeof(key);

    msg = HIB "╭" + repeat_string("═", 60) + "╮\n" NOR;
    msg += HIB "║                                                            ║\n" NOR;
    msg += sprintf(HIB "║" NOR "%-54s %2d/40" HIB "║\n" NOR, "笑傲江湖·任务日志", size);
    msg += HIB "║                                                            ║\n" NOR;
    msg += HIB "╠" + repeat_string("═", 60) + "╣\n" NOR;
    msg += HIB "║                                                            ║\n" NOR;
    msg += HIB "║" NOR "编号  等级  任务                                            " HIB "║\n" NOR;
    msg += HIB "║" HIY + repeat_string("─", 60) + HIB "║\n" NOR;
    for (i = 0; i < size; i++)
    {
        msg += sprintf(HIB "║" NOR " %2d    %2d   %-48s" HIB "║\n" NOR, i + 1, key[i]->getLevel(), key[i]->getName());
    }
    msg += HIB "║" HIY + repeat_string("─", 60) + HIB "║\n" NOR;
    msg += sprintf(HIB "║" NOR "%60s" HIB "║\n" NOR, me->name() + " ＠  ");
    msg += HIB "╰" + repeat_string("═", 60) + "╯\n" NOR;

    write(msg);
}

void giveup(object me, int index)
{
    int size;
    string *key;
    mapping toDoList;

    toDoList = me->getToDoList();

    if (!mapp(toDoList))
        return;

    key = keys(toDoList);
    size = sizeof(key);

    if (!size)
        return;
    if (index < 1 || index >= size + 1)
        return;
    if (key[index - 1]->noGiveUp())
    {
        write("任务 " + key[index - 1]->getName() + " 不可放弃。\n");
    }
    else
    {
        write("你放弃了 " + key[index - 1]->getName() + " 任务。\n");
        me->delToDo(key[index - 1]);
    }
}

void listSolved(object me)
{
    int i, size;
    string *solved, msg;

    solved = me->getSolved();
    size = sizeof(solved);

    msg = HIB "╭" + repeat_string("═", 60) + "╮\n" NOR;
    msg += HIB "║                                                            ║\n" NOR;
    msg += sprintf(HIB "║" NOR "%-60s" HIB "║\n" NOR, "已完成的任务列表");
    msg += HIB "║                                                            ║\n" NOR;
    msg += HIB "╠" + repeat_string("═", 60) + "╣\n" NOR;
    msg += HIB "║                                                            ║\n" NOR;
    msg += HIB "║" NOR "编号  等级  任务                                            " HIB "║\n" NOR;
    msg += HIB "║" HIY + repeat_string("─", 60) + HIB "║\n" NOR;
    for (i = 0; i < size; i++)
    {
        msg += sprintf(HIB "║" NOR "%s%3d   %2d   %-48s" HIB "║\n" NOR, solved[i]->isNewly() ? "*" : " ", i + 1, solved[i]->getLevel(), solved[i]->getName());
    }
    msg += HIB "║" HIY + repeat_string("─", 60) + HIB "║\n" NOR;
    msg += sprintf(HIB "║" NOR "%60s" HIB "║\n" NOR, me->name() + " ＠  ");
    msg += HIB "╰" + repeat_string("═", 60) + "╯\n" NOR;

    write(msg);
}

void solvedDetail(object me, int index)
{
    int size;
    string *solved, msg;

    solved = me->getSolved();
    size = sizeof(solved);

    if (!size)
        return;
    if (index < 1 || index >= size + 1)
        return;

    msg = HIY + repeat_string("─", 60) + "\n" NOR;
    msg += sprintf("%-60s\n", solved[index - 1]->getName());
    msg += HIY + repeat_string("─", 60) + "\n\n" NOR;
    msg += solved[index - 1]->getDetail();
    // msg += getKill(me, solved[index - 1]);
    // msg += getItem(me, solved[index - 1]);
    msg += "\n任务奖励：\n";
    msg += solved[index - 1]->getReward() + "\n";
    msg += HIY + repeat_string("─", 60) + "\n" NOR;

    write(msg);
}

int main(object me, string arg)
{
    int index;
    string id, control;
    object player;

    if (!arg)
        list(me);
    else
    {
        if (sscanf(arg, "%s %d -%s", id, index, control) == 3)
        {
            player = find_player(id);
            if (!objectp(player))
                return notify_fail("沒有這個玩家。\n");
            if (control != "s")
                return notify_fail("沒有這個控制項哦。\n");
            solvedDetail(player, index);
        }
        else if (sscanf(arg, "%d -%s", index, control) == 2)
        {
            if (control == "d")
                giveup(me, index);
            else if (control == "s")
                solvedDetail(me, index);
            else
                return notify_fail("沒有這個控制項哦。\n");
        }
        else if (sscanf(arg, "%s -%s", id, control) == 2 && wizardp(me))
        {
            player = find_player(id);
            if (!objectp(player))
                return notify_fail("沒有這個玩家。\n");
            if (control != "s")
                return notify_fail("沒有這個控制項哦。\n");
            listSolved(player);
        }
        else if (sscanf(arg, "%s %d", id, index) == 2 && wizardp(me))
        {
            player = find_player(id);
            if (objectp(player))
                detail(player, index);
            else
                return notify_fail("沒有這個玩家。\n");
        }
        else if (sscanf(arg, "%d", index) == 1)
        {
            detail(me, index);
        }
        else if (sscanf(arg, "-%s", control) == 1)
        {
            if (control != "s")
                return notify_fail("沒有這個控制項哦。\n");
            listSolved(me);
        }
        else if (sscanf(arg, "%s", id) == 1 && wizardp(me))
        {
            player = find_player(id);
            if (objectp(player))
                list(player);
            else
                return notify_fail("沒有這個玩家。\n");
        }
        else
            return notify_fail("你要查哪一個编号的任务？\n");
    }

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式：
    1. quest2              列出接受的任务列表
    2. quest2 <编号>       顯示任务說明
    3. quest2 <编号> -d    放弃某個编号的任务
    4. quest2 -s           列出已解決的任务 (若任务有註記*表示可重複解)
    5. quest2 <编号> -s    檢示已解決的任务說明
HELP);

if( wizardp(me) ) {
    write(@HELP

巫師指令：
    1. quest2 <id>             列出某玩家接受的任务列表
    2. quest2 <id> <编号>      列出某玩家任务說明
    3. quest2 <id> -s          列出某玩家已解決的任务 (若任务有註記*表示可重複解)
    4. quest2 <id> <编号> -s   檢示某玩家已解決的任务說明
HELP);
}

    return 1;
}
