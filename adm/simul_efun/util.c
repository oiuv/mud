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
        } else
        if (n >= 10)
        {
                sp[23] = (n / 10) + '0';
                sp[24] = (n % 10) + '0';
                sp[25] = '%';
                start = 23;
        } else
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
        } else
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
string sort_string(string input, int width, int prefix)
{
#ifdef DOING_IMPROVED
        return efun::sort_string(input, width, prefix);
#else
        int i;
        int sl;
        int len;
        int esc;
        string result;

        result = "";

        len = prefix;
        esc = 0;
        sl = strlen(input);
        for (i = 0; i < sl; i++)
        {
                if (len >= width && input[i] != '\n')
                {
                        int k;
                        k = i;
                        if (input[i] == 27)
                                while (k < sl && input[k++] != 'm');

                        switch ((k < sl - 1) ? input[k..k+1] : 0)
                        {
                        case "：":
                        case "”":
                        case "。":
                        case "，":
                        case "；":
                        case "）":
                        case " )":
                        case "！":
                        case "？":
                        case "、":
                                if (k != i)
                                {
                                        result += input[i..k + 1];
                                        i = k + 1;
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

                if (! esc)
                {
                        if (input[i] > 160)
                        {
                                result += input[i..i+1];
                                i ++;
                                len += 2;
                                continue;
                        }
                        if (input[i] == '\n')
                        {
                                result += "\n";
                                len = 0;
                                continue;
                        }
                }

                result += input[i..i];
                if (! esc) len++;

                if (esc && input[i] == 'm')
                        esc = 0;
        }

        if (i < sl)
                result += input[i..sl-1];

	if (len) result += "\n";

        return result;
#endif
}

#ifndef DOING_IMPROVED
int binary_valid(string file)
{
        return 1;
}
#endif

object get_object(string name)
{
        object ob;
        if (ob = find_object(name))
                return ob;
        return load_object(name);
}

// calculate the color char in a string
int color_len(string str)
{
        int i;
        int extra;

        extra = 0;
        for (i = 0; i < strlen(str); i++)
        {
                if (str[i] == ESC[0])
                {
                        while((extra++, str[i] != 'm') && i < strlen(str))
                                i++;
                }
        }
        return extra;
}

// to a appromix time
string appromix_time(int n, int flag)
{
        string s;

        if (n <= 0)
                return flag ? "马上就" : "马上";

        if (n < 60)
                s = "秒钟";
        else
        if (n < 60 * 60)
        {
                s = "分钟";
                n /= 60;
        } else
        if (n < 24 * 60 * 60)
        {
                s = "小时";
                n /= 60 * 60;
        } else
        if (n < 30 * 24 * 60 * 60)
        {
                s = "天";
                n /= 24 * 60 * 60;
        } else
        if (n < 365 * 24 * 60 * 60)
        {
                s = "个月";
                n /= 30 * 24 * 60 * 60;
        } else
        {
                s = "年";
                n /= 365 * 24 * 60 * 60;
        }

        if (flag) s += "以后";
        return chinese_number(n) + s;
}

// filter color
string filter_color(string arg)
{
#ifdef DOING_IMPROVED
        return efun::filter_ansi(arg);
#else
	arg = replace_string(arg, BLK, "");
	arg = replace_string(arg, RED, "");
	arg = replace_string(arg, GRN, "");
	arg = replace_string(arg, YEL, "");
	arg = replace_string(arg, BLU, "");
	arg = replace_string(arg, MAG, "");
	arg = replace_string(arg, CYN, "");
	arg = replace_string(arg, WHT, "");
	arg = replace_string(arg, HIR, "");
	arg = replace_string(arg, HIG, "");
	arg = replace_string(arg, HIY, "");
	arg = replace_string(arg, HIB, "");
	arg = replace_string(arg, HIM, "");
	arg = replace_string(arg, HIC, "");
	arg = replace_string(arg, HIW, "");
	arg = replace_string(arg, NOR, "");
        arg = replace_string(arg, BOLD, "");
        arg = replace_string(arg, BLINK, "");
        return arg;
#endif
}

string up_case(string arg)
{
        int i;
        for (i = 0; i < strlen(arg); i++)
                if (arg[i] >= 'a' && arg[i] <= 'z')
                        arg[i] = arg[i] - 32;
        return arg;
}

// trans_color
// raw = 0, only forecolor
// raw = 1, include backround color
// raw = 2, include blink & others
string trans_color(string arg, int raw)
{
        // forecolor
	arg = replace_string(arg, "$BLK$", BLK);
	arg = replace_string(arg, "$RED$", RED);
	arg = replace_string(arg, "$GRN$", GRN);
	arg = replace_string(arg, "$YEL$", YEL);
	arg = replace_string(arg, "$BLU$", BLU);
	arg = replace_string(arg, "$MAG$", MAG);
	arg = replace_string(arg, "$CYN$", CYN);
	arg = replace_string(arg, "$WHT$", WHT);
	arg = replace_string(arg, "$HIR$", HIR);
	arg = replace_string(arg, "$HIG$", HIG);
	arg = replace_string(arg, "$HIY$", HIY);
	arg = replace_string(arg, "$HIB$", HIB);
	arg = replace_string(arg, "$HIM$", HIM);
	arg = replace_string(arg, "$HIC$", HIC);
	arg = replace_string(arg, "$HIW$", HIW);
	arg = replace_string(arg, "$NOR$", NOR);

        if (raw)
        {
                // Background color
        	arg = replace_string(arg, "$BBLK$", BBLK);
        	arg = replace_string(arg, "$BRED$", BRED);
        	arg = replace_string(arg, "$BGRN$", BGRN);
        	arg = replace_string(arg, "$BYEL$", BYEL);
        	arg = replace_string(arg, "$BBLU$", BBLU);
        	arg = replace_string(arg, "$BMAG$", BMAG);
        	arg = replace_string(arg, "$BCYN$", BCYN);
        	arg = replace_string(arg, "$HBRED$", HBRED);
        	arg = replace_string(arg, "$HBGRN$", HBGRN);
        	arg = replace_string(arg, "$HBYEL$", HBYEL);
        	arg = replace_string(arg, "$HBBLU$", HBBLU);
        	arg = replace_string(arg, "$HBMAG$", HBMAG);
        	arg = replace_string(arg, "$HBCYN$", HBCYN);
        }

        if (raw == 2)
        {
                // special effect
        	arg = replace_string(arg, "$U$", U);
        	arg = replace_string(arg, "$BLINK$", BLINK);
        	arg = replace_string(arg, "$REV$", REV);
        	arg = replace_string(arg, "$HIREV$", HIREV);
        	arg = replace_string(arg, "$BOLD$", BOLD);
        }

        arg += NOR;
        return arg;
}

// append color after the $N、$n、$w for the string color won't be
// break by the NOR after the name
string append_color(string arg, string default_color)
{
        arg = replace_string(arg, "$N", "$N" + default_color);
        arg = replace_string(arg, "$n", "$n" + default_color);
        arg = replace_string(arg, "$w", "$w" + default_color);
        return arg;
}

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

        msg = msg[4..6] + "/" + msg[8..9] + "/" +
              msg[20..23] + " " + msg[11..18];
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
#ifdef DOING_IMPROVED
        return efun::file_crypt(file);
#else
        return "1234567890ABCDEF";
#endif
}

// check the file valid
int file_valid(string file)
{
#ifdef DOING_IMPROVED
        return efun::file_valid(file);
#else
        return file_size(file) > 0;
#endif
}
