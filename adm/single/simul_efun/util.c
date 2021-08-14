// util.c
#include <localtime.h>
#include <ansi.h>

string process_bar(int n)
{
    string sp;
    int start;

    if (n < 0) n = 0; else
    if (n > 100) n = 100;

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
    else {
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

object get_object(string name)
{
    object ob;
    if (ob = find_object(name))
        return ob;
    return load_object(name);
}

// to a appromix time
string appromix_time(int n, int flag)
{
    string s;

    if (n <= 0)
        return flag ? "马上就" : "马上";

    if (n < 60)
        s = "秒钟";
    else if (n < 60 * 60)
    {
        s = "分钟";
        n /= 60;
    }
    else if (n < 24 * 60 * 60)
    {
        s = "小时";
        n /= 60 * 60;
    }
    else if (n < 30 * 24 * 60 * 60)
    {
        s = "天";
        n /= 24 * 60 * 60;
    }
    else if (n < 365 * 24 * 60 * 60)
    {
        s = "个月";
        n /= 30 * 24 * 60 * 60;
    }
    else
    {
        s = "年";
        n /= 365 * 24 * 60 * 60;
    }

    if (flag) s += "以后";
    return chinese_number(n) + s;
}

// string up_case(string arg)
// {
//     int i;
//     for (i = 0; i < strlen(arg); i++)
//         if (arg[i] >= 'a' && arg[i] <= 'z')
//             arg[i] = arg[i] - 32;
//     return arg;
// }

// change to english sigh to chinese
string chinese_desc(string arg)
{
    arg = replace_string(arg, ",", "，");
    arg = replace_string(arg, "!", "！");
    return arg;
}

// is the string1 be a substring of string2
int is_sub(string s_str, string m_str)
{
    if (! m_str || ! s_str) return 0;
    return strsrch("," + m_str + ",", "," + s_str + ",") != -1;
}

// add a s_str
string add_sub(string s_str, string m_str)
{
    string *slist;
    int i;

    if (! s_str || is_sub(s_str, m_str))
        return m_str;

    slist = explode(s_str, ",");
    slist -= ({ "" });
    for (i = 0; i < sizeof(slist); i++)
        if (! is_sub(slist[i], m_str))
            if (m_str == 0 || m_str == "")
                m_str = slist[i];
            else
                m_str += "," + slist[i];

    return m_str;
}

// remove a s_str
string remove_sub(string s_str, string m_str)
{
    string *slist;
    string *trilist;

    if (! m_str || m_str == s_str) return 0;
    slist = explode(m_str, ",") - ({ "" });
    trilist = explode(s_str, ",");
    slist -= trilist;
    if (! sizeof(slist)) return 0;
    m_str = implode(slist, ",");
    return m_str;
}

// check the id is legal
int is_legal_id(string id)
{
    int i;

    if (! id) return 0;

    for (i = 0; i < strlen(id); i++)
    if (id[i] < 'a' || id[i] > 'z')
        return 0;

    return 1;
}

// generate the short id for log
string log_id(object ob, int raw)
{
    string msg;
    if (raw) return sprintf("%-8s", geteuid(ob));

    msg = sprintf("%s(%s)", ob->name(1), geteuid(ob));
    msg = sprintf("%-16s", msg);
    return msg;
}

// generate time
string log_time()
{
    string msg = ctime(time());

    msg = msg[4..6] + "/" + msg[8..9] + "/" + msg[20..23] + " " + msg[11..18];
    return msg;
}

// can the two man talk with together ?
int can_talk_with(object ob1, object ob2)
{
    if (! objectp(ob1) || ! objectp(ob2))
        return 0;

    if (! living(ob1) || ! living(ob2))
        return 0;

    if (environment(ob1) != environment(ob2))
        return 0;

    if (ob1->is_fighting() || ob2->is_fighting())
        return 0;

    return 1;
}

// build file crypt key
string file_crypt(string file)
{
    return "1234567890ABCDEF";
}

// check the file valid
int file_valid(string file)
{
    return file_size(file) > 0;
}

int binary_valid(string file)
{
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
