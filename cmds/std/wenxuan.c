// analecta.c
// Create by jjgod. 2002/01/27.
// Modify By Linux@lxtx

#include <ansi.h>
#include <mudlib.h>
#include <localtime.h>

#ifndef ANALECTA_D
#define ANALECTA_D      "/adm/daemons/analectad"
#endif

inherit F_CLEAN_UP;

int    help(object me);
string list_analectas(mapping *analectas, int year, object me);
string read_analecta(int year, mapping analecta, int i, object me);
int    sort_analectas(mapping a1, mapping a2);
int    filter_analectas(string analecta, int time);

int main(object me, string arg)
{
        string info, name, id, *all_analecta, dir;
        int year, i;
        object board;
        mapping all_note, analecta;
        mapping *analectas;

        year = localtime(time())[LT_YEAR];
        analectas = ANALECTA_D->query_analecta_list()[sprintf("%d", year)];

        info = HIC + LOCAL_MUD_NAME() + "(" + HIW + upper_case(INTERMUD_MUD_NAME) + 
               HIC + ")文章选集：\n" NOR WHT "──────────────────"
               "────────────────────────────\n" NOR;

        // 阅读最新文选
        if (arg == "new" || arg && sscanf(arg, "new %d", year))
        {
                analectas = ANALECTA_D->query_analecta_list()[sprintf("%d", year)];
                if (! arrayp(analectas) || ! sizeof(analectas))
                        info += CYN " 现在 " WHT + year + CYN " 没有任何新的文选"
                                "供你阅读。\n";
                else
                {
                        i = me->query("analecta_last_read/" + year);
                        analectas = sort_array(analectas, (: sort_analectas :));
                        analectas = filter_array(analectas, (: filter_analectas :), i);
                        if (! sizeof(analectas))
                                info += CYN " 现在 " WHT + year + CYN " 年没有任何"
                                        "新的文选供你阅读。\n";
                        else
                                info += read_analecta(year, analectas[0], member_array(analectas[0],
                                        ANALECTA_D->query_analecta_list()[sprintf("%d", year)]) + 1, me);
                }
        }
        else
        // 添加文选
        if (arg && sscanf(arg, "add %d from %s", i, name) == 2)
        {
                if (! wizardp(me))
                        info += CYN " 你尚无权力添加文选。\n" NOR;
                else
                if (! objectp(board = present(name, environment(me))))
                        info += CYN " 这里没有 " WHT + name + 
                                CYN " 这块留言板。\n" NOR;
                else
                {
                        all_note = board->query("notes");
                        if (! arrayp(all_note) || i < 1 || i > sizeof(all_note))
                                info += CYN " 没有这张留言。\n" NOR;
                        else
                        {
                                i--;
                                sscanf(all_note[i]["author"], "%s-%s", name, id);
                                analecta = ([ ]);
                                analecta["subject"] = all_note[i]["title"];
                                analecta["author_name"] = name;
                                analecta["author_id"] = id;
                                analecta["time"] = all_note[i]["time"];
                                analecta["content"] = all_note[i]["msg"];
                                analecta["board"] = board->name();

                                ANALECTA_D->add_analecta(year, analecta);
                                info += CYN " 已经成功的添加了" + board->name() +
                                        "的 " WHT + (i + 1) + CYN " 号留言进入"
                                        "本年度文选。\n" NOR;
                        }
                }
        }
        // 删除文选
        else
        if (arg && sscanf(arg, "del %d %d", year, i) == 2)
        {
                if (! wizardp(me))
                        info += CYN " 你尚无权力删除文选。\n" NOR;
                else
                if (! ANALECTA_D->delete_analecta(year, i))
                        info += CYN " 没有 " WHT + year + CYN " 这个年度的文选"
                                "或该年度没有 " WHT + i + CYN " 这个序号的文选"
                                "。\n" NOR;
                else
                        info += CYN " 年度 " WHT + year + CYN " 编号 " WHT + i +
                                CYN " 的文选已经被成功删除。\n" NOR;
        }
        else
        // 转换旧版本文选
        if (arg && sscanf(arg, "convert %s", dir))
        {
                if (file_size(dir) != -2)
                        info += CYN " 没有 " WHT + dir + CYN " 这个目录可供转换"
                                "。\n";
                else
                {
                        string subject, board_name;
                        int time;
                        int j = 0;

                        all_analecta = get_dir(dir);
                        for (i = 0; i < sizeof(all_analecta); i++)
                        {
                                if (sscanf(all_analecta[i], "%s-%s-%s-%d-%s",
                                    subject, name, id, time, board_name) != 5)
                                {
                                        write(all_analecta[i] + " parse wrong.\n");
                                        continue;
                                }

                                analecta = ([ ]);
                                analecta["subject"] = subject;
                                analecta["author_name"] = name;
                                analecta["author_id"] = id;
                                analecta["time"] = time;
                                analecta["board"] = board_name;
                                analecta["content"] = read_file(dir + all_analecta[i]);

                                year = localtime(time)[LT_YEAR];
                                ANALECTA_D->add_analecta(year, analecta);
                                rm(dir + all_analecta[i]);
                                j++;
                        }
                        info += CYN " 目录 " WHT + dir + CYN " 下的旧版本文选数"
                                "据已被成功转换了 " WHT + j + CYN " 个。\n" NOR;
                }
        }
        else
		// 列表
		if (! arg&& sizeof(analectas))
		{
				info += CYN "年度 " WHT + year + CYN " 的文选有：\n\n" NOR;
				info += list_analectas(analectas, year, me);
		}
		// 阅读指定年份的文章
		else
		if (arg && sscanf(arg, "%d %d", year, i) == 2)
		{
				analectas = ANALECTA_D->query_analecta_list()[sprintf("%d", year)];
				if (! arrayp(analectas) || ! sizeof(analectas))
						info += CYN " 没有 " WHT + year + CYN " 这个年"
								"度的文选。\n" NOR;
				else
				if (sizeof(analectas) < i)
						info += CYN " 年度 " WHT + year + CYN " 没有 "
								WHT + i + CYN " 这个序号的文选。\n" NOR;

				else
						info += read_analecta(year, analectas[i - 1], i, me);
		}
		// 阅读本年度文章或者列出其他年度文章
		else
		if (arg && sscanf(arg, "%d", i))
		{
				year = localtime(time())[LT_YEAR];
				analectas = ANALECTA_D->query_analecta_list()[sprintf("%d", i)];
				if (arrayp(analectas) && sizeof(analectas))
				{
						info += CYN "年度 " WHT + i + CYN " 的文选有："
								"\n\n" NOR;
						info += list_analectas(analectas, i, me);
				}
				else
				if (arrayp(ANALECTA_D->query_analecta_list()[sprintf("%d", year)]) &&
					sizeof(analectas) && sizeof(analectas) >= i)
						info += read_analecta(year, analectas[i - 1], i, me);

				else info += CYN " 没有 " WHT + i + CYN " 这个年度或者"
							 "本年这个序号的文选。\n" NOR;
		}
        // 列出有文选的年份
        else
        if (! arrayp(analectas) || ! sizeof(analectas))
        {
                all_analecta = keys(ANALECTA_D->query_analecta_list());
                all_analecta -= ({ sprintf("%d", year) });

                if (! sizeof(all_analecta))
                        info += CYN " 现在还没有任何文章被收集。\n" NOR;
                else
                {
                        info += sort_string(CYN " 现在有 " WHT +
                                            implode(all_analecta, CYN "、" WHT) +
                                            CYN " 这 " WHT + sizeof(all_analecta) +
                                            CYN " 年的文选供阅读。\n" NOR, 86);
                }
        }
		else return help(me);
        

        info += WHT "───────────────────────────────"
                "───────────────" NOR;
        me->start_more(info);
        return 1;
}

// 列出文选标题
string list_analectas(mapping *analectas, int year, object me)
{
        int i, last;
        mapping analecta;
        string info, is_new;

        info = "";
        last = me->query("analecta_last_read/" + year);
        analectas = sort_array(analectas, (: sort_analectas :));
        for (i = 0; i < sizeof(analectas); i++)
        {
                analecta = analectas[i];
                is_new = analecta["add_time"] > last ? HIY : "";
                info += sprintf(CYN " %s[" NOR WHT "%3d" CYN "%s]" NOR
                                CYN " %-30s " WHT "%20s [ " CYN "%s "
                                //WHT "| " CYN "%s" WHT " ]\n",
                                WHT "]\n",
                                is_new, i + 1, is_new, analecta["subject"],
                                analecta["author_name"] + "-" + analecta["author_id"],
                                //ctime(analecta["time"])[0..9], analecta["board"]);
                                ctime(analecta["time"])[0..9]);
        }
        return info;
}

// 阅读文选
string read_analecta(int year, mapping analecta, int i, object me)
{
        string info;
        string content;

        info = sprintf(CYN " [" WHT "%3d" CYN "] %-36s "
                       WHT "%15s [ " CYN "%s " WHT "|" CYN
                       " %s" WHT " ]\n\n" NOR,
                       i, analecta["subject"],
                       analecta["author_name"] + "-" + analecta["author_id"],
                       ctime(analecta["time"])[0..9], analecta["board"]);
        // 文件内容通过 read_file 获得
        content = read_file(analecta["file"], 8 + 1,
                            analecta["lines"] - 8);

        if (! stringp(content) ||
            content == "")
                info += CYN "此文无任何内容。\n" NOR;
        else
                info += content;

        if (analecta["add_time"] > me->query("analecta_last_read/" + year))
                me->set("analecta_last_read/" + year, analecta["add_time"]);

        return info;
}

// 文选排序
int sort_analectas(mapping a1, mapping a2) { return (a1["add_time"] - a2["add_time"]); }

// 筛选文选
int filter_analectas(mapping analecta, int time) { return (analecta["add_time"] > time); }

int help(object me)
{
	write(@HELP
指令格式 : wenxuan [ [ 年度 ] <序号> ]
                    [ add <留言序号> [ from <留言板> ] ]
                    [ del <年度> <序号> ]
                    [ new [ 年度 ] ]
                    [ convert <目录> ]

本指令提供文选的阅读、增加和删除。阅读时，除本年文选不需要
指定年度外，其他的都要指定年度。 比如阅读 2000 年第 3 号文
选，即输入 wenxuan 2000 3。 使用 new 参数可以阅读你尚未阅
读的新文选。
巫师可以使用 new 参数来添加文选，del 参数来删除文选。 删除
文选需要指定年度和序号，添加文选则必须指定所在房间的留言板
ID，如：
    客栈留言板(board) [ 4 张留言 ]
使用 wenxuan add 1 from board，就可以把客栈留言板的第一号
留言添加到本年度文选中。

可以使用 convert参数将指定目录下所有的旧版本文选数据转换成
新版本的数据。
HELP);
    return 1;
}