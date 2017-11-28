// more.c

#include <ansi.h>
#include <dbase.h>

#define LINES_PER_PAGE          40

void more(string cmd, string *text, int line)
{
	int i;
        string show;

	show = ESC + "[256D" + ESC + "[K";
        show = ESC + "[1A" + ESC "[256D" + ESC + "[K";

	switch (cmd)
        {
	default:
                i = line + LINES_PER_PAGE;
                if (i >= sizeof(text)) i = sizeof(text) - 1;
                show += implode(text[line..i], "\n") + "\n";
		if (i == sizeof(text) - 1)
                {
                        write(show);
                        return;
                }
                line = i + 1;
		break;

        case "b":
                line -= LINES_PER_PAGE * 2;
                if (line <= 0)
                {
                        line = 0;
                        show += WHT "-------- 文件的顶部 --------\n" NOR;
                }

                i = line + LINES_PER_PAGE;
                if (i >= sizeof(text)) i = sizeof(text) - 1;
                show += implode(text[line..i], "\n") + "\n";
                line = i + 1;
                break;

	case "q":
                write(show);
		return;
	}
	show += sprintf(NOR WHT "== 未完继续 " HIY "%d%%" NOR
                        WHT " == (ENTER 继续下一页，q 离开，b 前一页)\n" NOR,
	                line * 100 / sizeof(text));
        write(show);
	input_to("more", text, line);
}

#define MAX_STRING_SIZE                 7000

void s_write(string msg)
{
        int n, nd;
        int len;

        len = strlen(msg);
        if (len > MAX_STRING_SIZE)
        {
                // the string too long ?
                n = 0;
                while (n < len)
                {
                        // show section of the string
                        nd = n + MAX_STRING_SIZE;
                        if (nd >= len) nd = len - 1;
                        write(msg[n..nd]);
                        n = nd + 1;
                }
        } else
                write(msg);
}

void start_more(string msg)
{
        int len;

        if (! stringp(msg) || (len = strlen(msg)) < 1)
                // 没有内容
                return;

        if (query("env/no_more"))
        {
                s_write(msg);
                if (msg[len - 1] != '\n') write("\n");
                return;
        }

        write("\n");
	more("", explode(msg, "\n"), 0);
}

void more_file(string cmd, string file, int line, int total)
{
	int i;
        string show;
        string content;
        string *text;
        int goto_line;
        int page;
        int not_show;

	show = ESC + "[256D" + ESC + "[K";
        show = ESC + "[1A" + ESC "[256D" + ESC + "[K";

        page = LINES_PER_PAGE;
        goto_line = line;

        if (! cmd) cmd = "";
        if (sscanf(cmd, "%d,%d", goto_line, page) == 2)
        {
                if (page < goto_line)
                {
                        i = goto_line;
                        goto_line = page;
                        page = i;
                }
                page = page - goto_line + 1;
        } else
        if (sscanf(cmd, "n%d", page))
                ;
        else
        if (sscanf(cmd, "%d", goto_line))
                ; else
        {
        	switch (cmd)
                {
		default:
                        cmd = "";
			break;

	        case "b":
	                goto_line = line - LINES_PER_PAGE * 2;
	                if (goto_line > 1)
	                        break;
                        // else continue to run selection "t"
                case "t":
                        goto_line = 1;
                        break;

		case "q":
                        write(show);
			return;
        	}
        }

        if (page > 301)
        {
                show += "连续显示的行数必须小于等于300。\n";
                not_show = 1;
        } else
        {
                not_show = 0;

                if (! goto_line) goto_line = 1;
                if (! page) page = 1;

                if (goto_line < 0)
                {
                        // The goto line < 0, mean look bottom
                        goto_line += total;
                        if (goto_line  < 1)
                                goto_line = 1;
                }

                if (page < 0)
                {
                        // The page size < 0, mean look previous page
                        goto_line += page;
                        if (goto_line < 1)
                        {
                                page -= goto_line - 1;
                                goto_line = 1;
                        }
                        page = -page;
                }
        }

        line = goto_line;

        if (! not_show)
        {
                if (line == 1)
                        show += WHT "-------- 文件的顶部 --------\n" NOR;
                else
                if (cmd != "")
                        show += sprintf(HIW "-------- 从第 %d 行开始 %d 行 --------\n" NOR,
                                        goto_line, page);
        
                content = read_file(file, line, page);
                if (! content)
                {
                        i = 0;
                } else
                {
                        text = explode(replace_string(content, "\n", " \n") + " ", "\n");
                        if (page > sizeof(text))
                                page = sizeof(text);
                        for (i = 0; i < page; i++)
                                text[i] = sprintf(NOR "%-8d%s", i + line, text[i]);
                        content = implode(text[0..i - 1], "\n") + "\n";
                
                        show += content;
                }
        }

        if (not_show || i > 1)
        {
	        show += NOR WHT "- 未完(" HIY + total +
                        NOR WHT ") - (回车继续，"
                        HIY "q" NOR WHT " 离开，"
                        HIY "b" NOR WHT " 前一页，"
                        HIC "<num>" NOR WHT " 到第 "
                        HIC "n" NOR WHT " 行，"
                        HIY "n" HIC "<num>" NOR WHT
                        "显示接下 " HIC "n" NOR WHT " 行)" NOR;
                s_write(show);
	        input_to("more_file", file, line + page, total);
        } else
        {
                show += WHT "阅读完毕。\n" NOR;
                s_write(show);
        }
}

void start_more_file(string fn)
{
        if (file_size(fn) < 0)
        {
                write("没有 " + fn + " 这个文件可供阅读。\n");
                return;
        }
        write("\n");
	more_file("t", fn, 1, file_lines(fn));
}
