/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: chinese_d.c
Description: 中英文字典守护进程 CHINESE_D
Author: xuefeng
Version: v1.0
Date: 2019-03-12
*****************************************************************************/
#include <localtime.h>

#ifndef DATA_DIR
#define DATA_DIR "/data/"
#endif
#define E2C_DICTIONARY DATA_DIR + "e2c_dict"

inherit CORE_SAVE;

nosave string *c_digit = ({"零", "十", "百", "千", "万", "亿", "兆"});
nosave string *c_num = ({"零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"});

mapping dict = ([]);

void add_translate(string key, string chn);
void remove_translate(string key);

void create()
{
    restore();
}

string short()
{
    return "翻译精灵(CHINESE_D)";
}

void remove()
{
    save();
}

string chinese(string str)
{
    if (!undefinedp(dict[str]))
        return dict[str];
    else
        return str;
}

string chinese_number(int i)
{
    if (i < 0)
        return "负" + chinese_number(-i);
    if (i < 11)
        return c_num[i];
    if (i < 20)
        return c_digit[1] + c_num[i - 10];
    if (i < 100)
    {
        if (i % 10)
            return c_num[i / 10] + c_digit[1] + c_num[i % 10];
        else
            return c_num[i / 10] + c_digit[1];
    }
    if (i < 1000)
    {
        if (i % 100 == 0)
            return c_num[i / 100] + c_digit[2];
        else if (i % 100 < 10)
            return c_num[i / 100] + c_digit[2] +
                   c_num[0] + chinese_number(i % 100);
        else if (i % 100 < 10)
            return c_num[i / 100] + c_digit[2] +
                   c_num[1] + chinese_number(i % 100);
        else
            return c_num[i / 100] + c_digit[2] +
                   chinese_number(i % 100);
    }
    if (i < 10000)
    {
        if (i % 1000 == 0)
            return c_num[i / 1000] + c_digit[3];
        else if (i % 1000 < 100)
            return c_num[i / 1000] + c_digit[3] +
                   c_num[0] + chinese_number(i % 1000);
        else
            return c_num[i / 1000] + c_digit[3] +
                   chinese_number(i % 1000);
    }
    if (i < 100000000)
    {
        if (i % 10000 == 0)
            return chinese_number(i / 10000) + c_digit[4];
        else if (i % 10000 < 1000)
            return chinese_number(i / 10000) + c_digit[4] +
                   c_num[0] + chinese_number(i % 10000);
        else
            return chinese_number(i / 10000) + c_digit[4] +
                   chinese_number(i % 10000);
    }
    if (i < 1000000000000)
    {
        if (i % 100000000 == 0)
            return chinese_number(i / 100000000) + c_digit[5];
        else if (i % 100000000 < 1000000)
            return chinese_number(i / 100000000) + c_digit[5] +
                   c_num[0] + chinese_number(i % 100000000);
        else
            return chinese_number(i / 100000000) + c_digit[5] +
                   chinese_number(i % 100000000);
    }
    if (i % 1000000000000 == 0)
        return chinese_number(i / 1000000000000) + c_digit[6];
    else if (i % 1000000000000 < 100000000)
        return chinese_number(i / 1000000000000) + c_digit[6] +
               c_num[0] + chinese_number(i % 1000000000000);
    else
        return chinese_number(i / 1000000000000) + c_digit[6] +
               chinese_number(i % 1000000000000);
}

string query_save_file()
{
    return E2C_DICTIONARY;
}

void remove_translate(string key)
{
    map_delete(dict, key);
    save();
}

void add_translate(string key, string chn)
{
    dict[key] = chn;
    save();
}

void dump_translate()
{
    string *k, str;
    int i;

    str = "";
    k = keys(dict);
    k = sort_array(k, 0);
    for (i = 0; i < sizeof(k); i++)
        str += sprintf("%-30s %s\n", k[i], dict[k[i]]);
    write_file("/CHINESE_DUMP", str, 1);
}
