/*****************************************************************************
Copyright: 2020, Mud.Ren
File name: charset.c
Author: xuefeng
Version: v1.0
Date: 2012-03-01
Description: 字符集相关模拟函数
*****************************************************************************/

int atoi(mixed str)
{
    return to_int(str);
}

float atof(mixed str)
{
    return to_float(str);
}

string unicode(int c)
{
    return sprintf("%c", c);
}

int is_chinese(string str)
{
    if (!str)
        return 0;

    // str = remove_ansi(str);

    return pcre_match(str, "^\\p{Han}+$");
}

int is_english(string str)
{
    int i;
    if (!str || !str[0])
        return 0;

    i = strlen(str);
    while (i--)
        if ((str[i] < 'a' || str[i] > 'z') && (str[i] < 'A' || str[i] > 'Z'))
            return 0;

    return 1;
}

int is_numeric(string str)
{
    int i;

    if (nullp(str) || !str[0])
        return 0;

    i = strlen(str);
    while (i--)
        if (str[i] < '0' || str[i] > '9')
            return 0;

    return 1;
}

int check_control(string name)
{
    int i;
    if (!name)
        return 0;

    i = strlen(name);
    while (i--)
    {
        if (name[i] == ' ' || name[i] == '\n')
            continue;

        if (name[i] < ' ')
            return 1;
    }
    return 0;
}

int check_space(string name)
{
    int i;
    if (!name)
        return 0;

    i = strlen(name);
    while (i--)
    {
        if (name[i] == ' ')
            return 1;
    }
    return 0;
}

int check_return(string name)
{
    int i;
    if (!name)
        return 0;

    i = strlen(name);
    while (i--)
    {
        if (name[i] == '\n')
            return 1;
    }
    return 0;
}

// 中文数字
string chinese_number(int i)
{
    return CORE_CHINESE_D->chinese_number(i);
}
// 英文转中文
string chinese(string str)
{
    return CORE_CHINESE_D->chinese(str);
}
