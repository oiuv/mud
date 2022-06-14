/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: combat_record.c
Description: 战斗记录继承接口,可以由玩家对象继承
Author: xuefeng
Version: v1.0
*****************************************************************************/
mapping combat_record;

mapping query_combat_records() { return combat_record; }

// 设置战斗记录
void set_combat_record(string key, int value)
{
    if (!mapp(combat_record))
        combat_record = ([key:value]);
    else
        combat_record[key] = value;
}

// 增加战斗记录
void add_combat_record(string key, int value)
{
    if (!mapp(combat_record))
        combat_record = ([key:value]);
    else
        combat_record[key] += value;
}

// 删除战斗记录
int delete_combat_record(string key)
{
    if (mapp(combat_record))
    {
        map_delete(combat_record, key);
        return undefinedp(combat_record[key]);
    }
    return 0;
}

// 查询战斗记录
mixed query_combat_record(string key)
{
    if (mapp(combat_record) && !undefinedp(combat_record[key]))
        return combat_record[key];
    return 0;
}

// 增加杀怪记录
void add_mob_record(string key, int value)
{
    if (!mapp(combat_record))
        combat_record = ([]);
    if (undefinedp(combat_record["mob"]))
        combat_record["mob"] = ([key:value]);
    else
        combat_record["mob"][key] += value;
}
