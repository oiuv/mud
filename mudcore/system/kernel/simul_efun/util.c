/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: util.c
Description: 其它模拟函数
Author: xuefeng
Version: v1.0
Date: 2019-03-12
History:
*****************************************************************************/
#include <ansi.h>

// generate time
varargs string log_time(int timestamp)
{
    if (!timestamp) timestamp = time();

    return CORE_TIME_D->replace_ctime(timestamp);
}

// 获取复制对象的唯一ID
varargs int getcid(object ob)
{
    int id;

    sscanf(file_name(ob || previous_object()), "%*s#%d", id);
    return id;
}

void debug(mixed arg)
{
    string *color = ({HIB, HIC, HIG, HIM, HIR, HIW, HIY});

    if (objectp(arg))
    {
        arg = file_name(arg);
    }

    write(element_of(color) + arg + NOR "\n");
}

// 进度条
string process_bar(int n)
{
    string sp;
    int start;

    if (n < 0)
        n = 0;
    else if (n > 100)
        n = 100;

    sp = "                                                  " NOR;

    if (n == 100)
    {
        sp[22] = '1';
        sp[23] = '0';
        sp[24] = '0';
        sp[25] = '%';
        start = 22;
    }
    else if (n >= 10)
    {
        sp[23] = (n / 10) + '0';
        sp[24] = (n % 10) + '0';
        sp[25] = '%';
        start = 23;
    }
    else
    {
        sp[24] = n + '0';
        sp[25] = '%';
        start = 24;
    }

    n /= 2;
    if (start > n)
    {
        sp = sp[0..start-1] + HIY + sp[start..<0];
        sp = sp[0..n - 1] + BBLU + sp[n..<0];
    }
    else
    {
        sp = sp[0..n - 1] + BBLU + sp[n..<0];
        sp = sp[0..start-1] + HIY + sp[start..<0];
    }

    sp = NOR + BCYN + sp;
    return sp;
}

// sort a chinese string (must be chinese), align the
// string with then len. the prefix is used when the desc
// will be lead by another string or space with length is prefix.
varargs string sort_string(string input, int width, int prefix)
{
    int i;
    int sl;  // 字符串长度
    int len; // 字符串宽度
    int esc;
    string result;

    result = "";
    esc = 0;
    if (!width) width = 78;
    len = prefix;
    sl = strlen(input);
    for (i = 0; i < sl; i++)
    {
        if (len >= width && input[i] != '\n')
        {
            int k = i;
            // ANSI颜色字符处理
            if (input[i] == 27)
                while (k < sl && input[k++] != 'm')
                    ;

            switch ((k < sl) ? input[k..k] : 0)
            {
            // 部分中英文符号不换行
            case "’":   //8217
            case "”":   //8221
            case "、":  //12289
            case "。":  //12290
            case "！":  //65281
            case "）":  //65289
            case "，":  //65292
            case "：":  //65306
            case "；":  //65307
            case "？":  //65311
            case " ":   //32
            case "!":   //33
            case "”":   //34
            case "'":   //34
            case ")":   //41
            case ",":   //44
            case ".":   //46
            case ":":   //58
            case ";":   //59
            case "?":   //63
                if (k != i)
                {
                    result += input[i..k];
                    i = k;
                    continue;
                }
                break;
            default:
                len = 0;
                result += "\n";
                break;
            }
        }

        if (input[i] == 27)
            esc = 1;

        if (!esc)
        {
            // 非英文字符
            if (input[i] > 160)
            {
                result += input[i..i];
                len += 2;
                continue;
            }
            // 换行
            if (input[i] == '\n')
            {
                result += "\n";
                len = 0;
                continue;
            }
            len++;
        }
        if (esc && input[i] == 'm')
            esc = 0;

        result += input[i..i];
    }

    if (len)
        result += "\n";

    return result;
}

// 游戏配置内容的读取或设置
varargs mixed env(string key, mixed value)
{
    if (nullp(key))
    {
        return CORE_ENV_D->query_entire_dbase();
    }

    if (nullp(value))
    {
        return CORE_ENV_D->query(key);
    }
    else
    {
        return CORE_ENV_D->set(key, value);
    }
}
varargs mixed config(string key, mixed value)
{
    if (nullp(key))
    {
        return CORE_ENV_D->query_entire_dbase();
    }

    if (nullp(value))
    {
        return CORE_ENV_D->query(key);
    }
    else
    {
        return CORE_ENV_D->set(key, value);
    }
}
