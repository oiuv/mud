/* Program      : /feature/me.c
 * Author       :Kenny@Eternal.Civilization (3/25/1998)
 *
 * port to chinese wizard group : /feature/vi.c by ken@chinesemud.net (99-3-15)
 */

#include <ansi.h>                       // 定义 ANSI/VT100 终端机的逸脱码

#define ECHO 0                          // 读取输入时要显示字元
#define HIDE 1                          // 读取输入时不显示字元
#define REFRESH 1                       // 读取输入後要重绘画面
#define LOGFILE "static/VI"             // 档案异动记录档

void start_edit(string filename);       // 呼叫编辑器，开始编辑
private void _append(object pl);        // 在游标後面加字
private void _append_line(object pl);   // 在游标底下加一新行
private void _backspace(object pl);     // 删除游标前的字
protected void _confirm_save(string str, object pl); // 离开编辑器前确认存档
private void _del_char(object pl, int bs);      // 删除游标上的字
private void _del_line(object pl);              // 删除整行
private int  _dispatcher(object pl);            // 分派指令到不同函式
private void _down(object pl);                  // 游标往下移一行
private void _end(object pl);                   // 将游标移到行尾
private void _esc(object pl);                   // 从输入模式回到命令模式
private void _file_end(object pl);              // 将游标移到档尾
private void _file_head(object pl);             // 将游标移到档头
private void _goto_line(object pl);             // 跳到特定行去
protected void _goto_line_done(string str, object pl, int rein); // 取得行号
private void _help(object pl);                  // 辅助画面
private void _home(object pl);                  // 将游标移到行首
protected void _input(string str, object pl, int fresh); // 读得输入字串
private void _insert(object pl);                // 在游标前面插字
private void _insert_line(object pl);           // 在游标上方加一新行
private void _insert_exclam_mark(object pl);    // 在游标前面插入一个「!」字元
private void _join(object pl);                  // 将下行文字移到此行後面
private void _keymap(object pl);                // 定义新功能键
protected void _keymap_done(string str, object pl); // 取得定义功能键
private void _left(object pl);                  // 游标往左移一字
// 在状态列显示讯息
private varargs void _message(object pl, string str, string callback, int hide,
mixed arg);
protected void _message_done(string str, object pl); // 结束讯息的显示
private void _next_match(object pl);            // 搜寻/替换下个符合字串
private void _page_down(object pl);             // 往下卷一页（22 行）
private void _page_up(object pl);               // 往上卷一页（22 行）
private void _process(object pl);               // 处理输入模式的字串输入
protected void _quit(mixed unused, mixed pl);   // 离开编辑器
private void _refresh(object pl);               // 更新画面
private void _refresh_cursor(object pl);        // 更新游标位置
// 重绘画面
private void _refresh_screen(object pl, int s_row, int e_row, int s_col);
private void _refresh_status(object pl);        // 更新状态列
private void _replace(object pl);               // 字串替换
protected void _replace_done(string str, object pl); // 取得替换字串
private void _right(object pl, int col, int extra);  // 游标往右移一字
private void _search(object pl);                     // 字串搜寻
protected void _search_done(string str, object pl);  // 取得搜寻字串
private void _tab(object pl);                        // 命令模式下 TAB 键的定位
private void _undef_key(object pl);                  // 取消某功能键定义
protected void _undef_key_done(string str, object pl); // 取得指定功能键
private void _up(object pl);                           // 游标往上移一行
private void _write(object pl);                        // 取得储存档案名称
protected void _write_done(string str, object pl, int quit); // 储存档案

private mapping EditedFiles=([ ]);              // 编辑中的档案
/*
int iS_Row, iE_Row,                             // 可见视窗的始末行号
    iS_Col, iE_Col,                             // 可见视窗的始未栏位
    iRow,   iCol,                               // 游标位置
    is_Command_Mode, is_NewFile, is_Modify,     // 档案状况旗标
    is_Substituted;                             // 代换内码旗标
string *sText,                                  // 档案内容
       sChar, sOldChar,                         // 输入字串（命令）
       sCount,                                  // 命令计数
       sFileName,                               // 编辑档名
       sSearch, sReplace;                       // 搜寻/替换字串
mapping keymap;                                 // 功能键定义对照表
*/

void start_edit(string file)                // 呼叫编辑器，开始编辑
{
        int  i;
        mapping me;


        if (objectp(EditedFiles[file]))
        {
                write(sprintf("%s 正在编辑这个档案，请稍候再编辑。\n",
                        capitalize(EditedFiles[file]->query("id"))));
                return;
        } // if
        this_player()->set_temp("me", ([ ]));
        me = this_player()->query_temp("me");
        me["sFileName"] = file;
        if (file_size(file) <= 0)
        {        // 档案长度小於 1
                me["sText"] = ({ "" });
                if (file_size(file) < 0)
                {        // 新档
                        me["is_Command_Mode"] = 0;
                        me["is_NewFile"] = 1;
                }
        }
        else
        {
                string content=read_file(file), tabs="        ";

                // 档案长度大於 0
                me["is_Command_Mode"] = 1;
                me["is_NewFile"] = 0;
                if (stringp(content))
                {
                        me["sText"] = explode(read_file(file), "\n");
                        // 将 TAB，以 8 个空白代替，以方便游标位置的计算
                        for (i=sizeof(me["sText"])-1; i>=0; i--)
                        {
                                int len=sizeof(me["sText"][i]);
                                reset_eval_cost();
                                for (int j=0; j<len; j++)
                                        if (me["sText"][i][j] == '\t')
                                                me["sText"][i] = replace_string(
							me["sText"][i], "\t", tabs[0..7-j%8]);
                        }
                }
                else me["sText"] = ({ "" });
        } // old file

        me["sCount"] = "";
        me["sSearch"] = me["sReplace"] = me["is_Modify"] = 0;
        me["iE_Row"] = 23;
        me["iS_Row"] = me["iS_Col"] = me["iRow"] = me["iCol"] = 1;
        EditedFiles += ([ file: this_player()->link() ]);

        // 取得/设定功能键定义对照表
             if (!mapp(me["keymap"] = this_player()->query("me_keymap")))
                     me["keymap"] = ([ ]);
        if (this_player()->query("me_no_help") ||
            this_player()->query_temp("no_me_help"))
        {        // 非第一次使用编辑器，直接进入编辑器
                _refresh_screen(this_player(), 1, 23, 1);

                get_char("_input", HIDE, this_player());
        }
        else
        {        // 第一次使用编辑器，先看功能说明
                this_player()->set_temp("no_me_help", 1);
                _help(this_player());
        }
} // start_edit()


private void _refresh_cursor(object pl)        // 更新游标位置
{
        mapping me=pl->query_temp("me");
        printf(ESC "[%d;%df", me["iRow"]+1, me["iCol"]);
} // _refresh_cursor()


private void _refresh_status(object pl)        // 更新状态列
{
        mapping me=pl->query_temp("me");

        // 移动游标到 (1,1)，用反相字元显示状态列
        printf(HOME + NOR + REV + "列:%4d 行:%3d %-43s %10s [命令模式]" + NOR,
                me["iS_Row"]+me["iRow"]-1, me["iS_Col"]+me["iCol"]-1,
                sprintf("%s %s", me["sFileName"], (me["is_Modify"]? "(已修改)":
                (me["is_NewFile"]? "(新档)": "")))[0..42],
                (me["is_Command_Mode"]? "?:辅助画面": "[输入模式]"));
        _refresh_cursor(pl);
} // _refresh_status()


// 重绘画面
private void _refresh_screen(object pl, int s_row, int e_row, int s_col)
{
        int  i, temp;
        mapping me=pl->query_temp("me");


        if (e_row < s_row)                // 检查始末行号的先後次序
        {
                temp = e_row;
                e_row = s_row;
                s_row = temp;
        }

        if (s_row < 1) s_row = 1;
        if (s_col < 1) s_col = 1;
        if (e_row > sizeof(me["sText"])) // 不能超过档尾
                e_row = sizeof(me["sText"]);
        if (e_row-s_row > 22) e_row = s_row+22;

        me["iS_Row"] = s_row;        me["iE_Row"] = e_row;
        me["iS_Col"] = s_col;        me["iE_Col"] = s_col+79;

        printf(REF+NOR);                // 清除画面，移动游标到 (1,1)
        for (i=me["iS_Row"]-1; i<me["iE_Row"]; i++)
                printf("\r\n%s", me["sText"][i][me["iS_Col"]-1..me["iE_Col"]-1]);
        for (i=me["iS_Row"]+22-me["iE_Row"]; i>0; i--)
                printf("\r\n~");        // 不足行号用 ~ 表示
        _refresh_status(pl);
} // _refresh_screen()


protected void _input(string str, object pl, int fresh) // 读得输入字串
{
        int    i, size, bs=0;
        string *chars;
        mapping me=pl->query_temp("me");

        if (fresh)
        {        // 重绘画面
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]);
                get_char("_input", HIDE, pl);
                return;
        }

        me["is_Substituted"] = 1;       // 先设定代换内码旗标
        if (str == "")                  // 代换掉 Backspace/Ctrl-Backspace
        {
                str = "BACKSPACE";
                bs = 1;
        }
        if (str[0] == 27)
        {
                chars = explode(str, ESC);      // 逸脱码的字串，以 ESC 断开
                for (i=sizeof(chars)-1; i>=0; i--)
                        chars[i] = ESC + chars[i];      // 加回 ESC
                if (sizeof(chars) == 0)                 // 若只是单一字元 ESC
                        chars = ({ ESC });
        }
        else    chars = ({ str });

        size = sizeof(chars);
        for (i=0; i<size; i++)
        {        // 转换逸脱码为编辑器内码
                switch (chars[i])
                {
                case "\t":       me["sChar"] = "TAB";   break;
                case "\r":       me["sChar"] = "ENTER"; break;
                case ESC:        me["sChar"] = "ESC";   break;
                case ESC "OA":
                case ESC "[A":   me["sChar"] = "UP";    break;
                case ESC "OB":
                case ESC "[B":   me["sChar"] = "DOWN";  break;
                case ESC "OC":
                case ESC "[C":   me["sChar"] = "RIGHT"; break;
                case ESC "OD":
                case ESC "[D":   me["sChar"] = "LEFT";  break;
                case ESC "OH":
                case ESC "[H":
                case ESC "1~":
                case ESC "[1~":  me["sChar"] = "HOME";  break;
                case ESC "[2~":  me["sChar"] = "INSERT";break;
                case ESC "[3~":  me["sChar"] = "DELETE";break;
                case ESC "4~":   me["sChar"] = "END";   break;
                case ESC "[4~":  me["sChar"] = "END";   break;
                case ESC "[5~":  me["sChar"] = "PAGEUP";break;
                case ESC "[6~":  me["sChar"] = "PAGEDOWN";break;
                case ESC "OP":   me["sChar"] = "F1";    break;
                case ESC "OQ":   me["sChar"] = "F2";    break;
                case ESC "OR":   me["sChar"] = "F3";    break;
                case ESC "OS":   me["sChar"] = "F4";    break;
                case ESC "m":    me["sChar"] = "F5";    break;
                case ESC "[17~": me["sChar"] = "F6";    break;
                case ESC "[18~": me["sChar"] = "F7";    break;
                case ESC "[19~": me["sChar"] = "F8";    break;
                case ESC "[20~": me["sChar"] = "F9";    break;
                case ESC "[21~": me["sChar"] = "F10";   break;
                case ESC "[23~": me["sChar"] = "F11";   break;
                case ESC "[24~": me["sChar"] = "F12";   break;
                default:
                        if (sizeof(chars[i])==1 &&
                            0<chars[i][0] && chars[i][0]<27)
                                switch (chars[i][0])
                                { // 代换内码，使在输入模式也能使用指令
                                case  1: me["sChar"]="Ctrl-A"; break;
                                case  2: me["sChar"]="Ctrl-B"; break;
                                case  4: me["sChar"]="Ctrl-D"; break;
                                case  6: me["sChar"]="Ctrl-F"; break;
                                case  7: me["sChar"]="Ctrl-G"; break;
                                case 10: me["sChar"]="Ctrl-J"; break;
                                case 11: me["sChar"]="Ctrl-K"; break;
                                case 12: me["sChar"]="Ctrl-L"; break;
                                case 14: me["sChar"]="Ctrl-N"; break;
                                case 15: me["sChar"]="Ctrl-O"; break;
                                case 16: me["sChar"]="Ctrl-P"; break;
                                case 17: me["sChar"]="Ctrl-Q"; break;
                                case 18: me["sChar"]="Ctrl-R"; break;
                                case 19: me["sChar"]="Ctrl-S"; break;
                                case 20: me["sChar"]="Ctrl-T"; break;
                                case 21: me["sChar"]="Ctrl-U"; break;
                                case 22: me["sChar"]="Ctrl-V"; break;
                                case 23: me["sChar"]="Ctrl-W"; break;
                                case 24: me["sChar"]="Ctrl-X"; break;
                                case 25: me["sChar"]="Ctrl-Y"; break;
                                case 26: me["sChar"]="Ctrl-Z"; break;
                        } // switch
                        else
                        {
                                me["sChar"] = chars[i];            // 此为普通字串
                                if (!bs) me["is_Substituted"] = 0; // 清除代换内
                        } // else
                } // switch
                // 将转换後的字串送到分派指令函式处理，并等待读取下个输入
                if (_dispatcher(pl) && i==size-1) get_char("_input", HIDE, pl);
        } // for
} // input()


private int _dispatcher(object pl)                // 分派指令到不同函式
{
        int  i, count=1;
        mapping me=pl->query_temp("me");


        if ( me["is_Command_Mode"] ||
            (me["is_Substituted"] && // 让输入模式也能使用某些指令
             // 这二个指令不在这处理
             me["sChar"]!="ENTER" && me["sChar"]!="TAB") )
        {        // 现在是命令模式
                if (sizeof(me["sChar"])!=1 && !me["is_Substituted"])
                        return 1;
                // 检查功能键定义对照表，重新定义命令
                if (!undefinedp(me["keymap"][me["sChar"]]))
                        me["sChar"] =
                        me["keymap"][me["sChar"]];
                if (!stringp(me["sChar"])) return 1; // Type checking...
                // 检查是数字的话，就是附加到命令计数里
                if ('0'<=me["sChar"][0] && me["sChar"][0]<='9')
                        me["sCount"] += me["sChar"];
                else
                {
                        sscanf(me["sCount"], "%d", count);
                        me["sCount"] = ""; // 计数器归零
                        // 重覆上个指令
                        if (me["sChar"] == ".")
                                me["sChar"] = me["sOldChar"];
                        else        // 记录这次的指令
                                me["sOldChar"] = me["sChar"];
                }

                for (i=0; i<count; i++)
                        switch (me["sChar"]) // 分派指令到不同函式
                        {
                        case "a":_append(pl);                           break;
                        case "d":
                        case "Ctrl-D": _del_line(pl);                  break;
                        case "f":
                        case "Ctrl-Z": _refresh(pl);                break;
                        case "g":
                        case "Ctrl-G": _goto_line(pl);                break;
                        case "h":
                        case "LEFT":
                        case "Ctrl-J": _left(pl);                   break;
                        case "i":      _insert(pl);                break;
                        case "j":
                        case "DOWN":
                        case "Ctrl-K": _down(pl);                break;
                        case "k":
                        case "UP":
                        case "Ctrl-O": _up(pl);                        break;
                        case "l":
                        case "RIGHT":
                        case "Ctrl-L": _right(pl, 1,
                                                (me["is_Command_Mode"]?0:1));
                                       break;
                        case "m": _keymap(pl);                        break;
                        case "n":
                        case "Ctrl-N": _next_match(pl);                break;
                        case "o": _append_line(pl);                    break;
                        case "q":        // 表示不再读取新输入，结束编辑
                        case "F4":
                        case "Ctrl-Q": _quit(0, pl);                return 0;
                        case "r":
                        case "Ctrl-R": _replace(pl);                break;
                        case "s":
                        case "Ctrl-S": _search(pl);                   break;
                        case "u": _undef_key(pl);                break;
                        case "w":
                        case "F2":
                        case "Ctrl-W": _write(pl);                      break;
                        case "x":
                        case "DELETE":
                        case "Ctrl-X":   _del_char(pl, 0);        break;
                        case "A":
                        case "HOME":
                        case "Ctrl-A":   _home(pl);        break;
                        case "B":
                        case "PAGEUP":
                        case "Ctrl-B":   _page_up(pl);        break;
                        case "E":
                        case "END":
                        case "Ctrl-E":   _end(pl);        break;
                        case "F":
                        case "PAGEDOWN":
                        case "Ctrl-F":   _page_down(pl);        break;
                        case "J":
                        case "Ctrl-P": _join(pl);         break;
                        case "O": _insert_line(pl);         break;
                        case "U":
                        case "Ctrl-U": _file_head(pl);        break;
                        case "V":
                        case "Ctrl-V": _file_end(pl);        break;
                        case "?":
                        case "F1":
                        case "Ctrl-Y": _help(pl);         break;
                        case "~":
                        case "Ctrl-T": _insert_exclam_mark(pl);        break;
                        case "BACKSPACE": _backspace(pl);          break;
                        case "ESC": _esc(pl);                         break;
                        case "TAB": _tab(pl);                        break;
                        } // switch
        } // if me["is_Command_Mode"]
        else
                _process(pl);                // 处理输入模式的字串输入

        return 1;                        // 表示继续读取新输入，继续编辑
} // dispatcher()


private void _append(object pl)                // 在游标後面加字
{
        mapping me=pl->query_temp("me");

        if (sizeof(me["sText"]) == 0) return;
        me["is_Command_Mode"] = 0;
        _refresh_status(pl);
        _right(pl, 1, 1);
} // _append()


private void _append_line(object pl)        // 在游标底下加一新行
{
        string *text;
        mapping me=pl->query_temp("me");

        me["is_Command_Mode"] = me["is_NewFile"] = 0;
        me["is_Modify"] = 1;
        text = me["sText"][0..me["iS_Row"]+me["iRow"]-2] + ({ "" }) +
                me["sText"][me["iS_Row"]+me["iRow"]-1..<1];
        me["sText"] = text;
        _refresh_screen(pl, me["iS_Row"], sizeof(me["sText"]), 1);
        me["iCol"] = 1;
        _down(pl);
} // _append_line()


private void _backspace(object pl)        // 删除游标前的字
{
        mapping me=pl->query_temp("me");

        if (me["iS_Col"] == me["iCol"])        return;
        _left(pl);
        _del_char(pl, 1);
} // _backspace()


protected void _confirm_save(string str, object pl) // 离开编辑器前确认存档
{
        mapping me=pl->query_temp("me");

        if (str=="y" || str=="Y") return _write_done("", pl, 1);
        me["is_Modify"] = 0;                // 设定「未修改」旗标
        _quit(0, pl);
} // _confirm_save()


private void _del_char(object pl, int bs)                // 删除游标上的字
{
        int    go_left=0;                // 是否在删除後要左移游标
        string str;
        mapping me=pl->query_temp("me");


        if (sizeof(me["sText"])==0 ||
            sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])==0)
             return;
        if (me["is_NewFile"] || !me["is_Modify"])
        {
                me["is_NewFile"] = 0;
                me["is_Modify"] = 1;
                _refresh_status(pl);
        }
        if (me["iS_Col"]+me["iCol"]-2 >=
            sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2]))
                return;
        str = me["sText"][me["iS_Row"]+me["iRow"]-2][0..me["iS_Col"]+
                me["iCol"]-3];
        // 检查是否需要附加剩下的内容
        if (me["iS_Col"]+me["iCol"]-1 <
            sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2]))
                str += me["sText"][me["iS_Row"]+
                me["iRow"]-2][me["iS_Col"]+me["iCol"]-1..<1];
        else        go_left = 1;                // 因为是删除行尾的字，所以要左 
	me["sText"][me["iS_Row"]+me["iRow"]-2] = str;
        printf(ESC "[%d;1f%-80s", me["iRow"]+1,        me["sText"][me["iS_Row"]+
                me["iRow"]-2][me["iS_Col"]-1..me["iE_Col"]-1]);
        if (go_left && !bs) _left(pl);
        else        _refresh_cursor(pl);
} // _del_char()


private void _del_line(object pl)        // 删除整行
{
        string *text=({ });
        mapping me=pl->query_temp("me");
        me["is_NewFile"] = 0;
        me["is_Modify"] = 1;
        if (me["iS_Row"]+me["iRow"]-2 > 0)
                text = me["sText"][0..me["iS_Row"]+me["iRow"]-3];
        text += me["sText"][me["iS_Row"]+me["iRow"]-1..<1];
        me["sText"] = text;
        _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]);
        if (me["iS_Row"]+me["iRow"]-1 > sizeof(me["sText"]))
                _up(pl);                // 若是删除最後一行，就要上移游标
        // 若游标的新位置超过行尾，则移动游标到行尾
        else if (me["iS_Col"]+me["iCol"]-1 >
            sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2]))
            _end(pl);
} // _del_line()


private void _down(object pl)                // 游标往下移一行
{
        int  acc;
        mapping me=pl->query_temp("me");


        // 检查是否已在档尾
        if (me["iS_Row"]+me["iRow"]-1 >= sizeof(me["sText"]))
                // 若已显示档尾下一行，则不做事
                if (me["iRow"] < 23) return;
                else
                {        // 多显视档尾下一行，以突显档尾的存在
                        me["iS_Row"]++;
                        printf(ESC "[24;1f\r\n~");
                        me["iRow"] = 22;
                }
        else if (++me["iRow"] > 23)
        {        // 画面上卷，显示下一行
                me["iS_Row"]++;                me["iE_Row"]++;
                printf(ESC "[24;1f\r\n%s", me["sText"][me["iE_Row"]-1]
                        [me["iS_Col"]-1..me["iE_Col"]-1]);
                me["iRow"] = 23;
        }

        // 若游标的新位置超过行尾，则移动游标到行尾
        if (me["iS_Col"]+me["iCol"]-1 >
            sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2]))
                me["iCol"] = sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])-
                        me["iS_Col"]+(me["is_Command_Mode"]?1:2);
        // 若此行无字，则定位在第一栏
        if (me["iCol"]==0 && me["iS_Col"]==1) me["iCol"] = 1;
        if (me["iCol"] > 0)_refresh_status(pl);
        else
        {        // 游标的新位置在原画面外，需要重绘画面
                acc = me["iCol"];        me["iCol"] = 1;
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"],
                        me["iS_Col"]+acc-1);
        }
} // _down()


private void _end(object pl)                // 将游标移到行尾
{
        mapping me=pl->query_temp("me");

        if (sizeof(me["sText"]) == 0) return;
        // 计算行尾的位置
        me["iCol"] = sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])-
                me["iS_Col"]+(me["is_Command_Mode"]?1:2);
        if (me["iCol"] == 0) me["iCol"] = 1; // 若此行无字，则定位在第一栏
        if (sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2]) < me["iE_Col"])
                    _refresh_status(pl);
        else
        {        // 游标的新位置在原画面外，需要重绘画面
                me["iCol"] = 79;
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]+
                        (sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])-
                        me["iE_Col"]+1));
        }
} // _end()


private void _esc(object pl)                // 从输入模式回到命令模式
{
        mapping me=pl->query_temp("me");
        me["is_Command_Mode"] = 1;
        _left(pl);
} // _esc()


private void _file_end(object pl)        // 将游标移到档尾
{
        mapping me=pl->query_temp("me");
        if (sizeof(me["sText"]) == 0) return;
        _goto_line_done(sprintf("%d", sizeof(me["sText"])), pl, 0);
} // _file_end()


private void _file_head(object pl)        // 将游标移到档头
{
        mapping me=pl->query_temp("me");
        if (sizeof(me["sText"]) == 0) return;
        _goto_line_done("1", pl, 0);
} // _file_head()


private void _goto_line(object pl)        // 跳到特定行去
{
        mapping me=pl->query_temp("me");
        _message(pl, sprintf("请输入行号（直接按 ENTER 取消，1~%d)：",
                sizeof(me["sText"])), "_goto_line_done", ECHO, 1);
} // _goto_line()


protected void _goto_line_done(string str, object pl, int rein) // 取得行号
{
        int        no;
        mapping me=pl->query_temp("me");

        if (str == "") return _message_done("", pl);
        if (sscanf(str, "%d", no)!=1 || no<1 || no>sizeof(me["sText"]))
                return _message(pl, "错误的行号！", "_message_done", HIDE);

        me["iCol"] = 1;
        if (me["iS_Row"]<=no && no<=me["iE_Row"])
        {        // 指定行号在原可视范围中
                me["iRow"] = no-me["iS_Row"]+1;
                _refresh_status(pl);
        }
        else
        {        // 指定行号不在原可视范围中，需要重绘画面
                me["iS_Row"] = no-11;
                if (me["iS_Row"] < 1)        me["iS_Row"] = 1;
                if (me["iE_Row"] < no+11)        me["iE_Row"] = no+11;
                me["iRow"] = no-me["iS_Row"]+1;
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"], 1);
        }
        if (rein) get_char("_input", HIDE, pl); // 检查是否需要读取下次输入
} // _goto_line_done()


private void _help(object pl)                // 辅助画面
{
        printf(REF +
"【 LPMud 全萤幕编辑器 】1.3 版 3/25/1998  by 谢崇祥(Kenny Hsieh), 版权所有.\r
\r
a            在游标後面加字               d  Ctrl-D    删除整行\r
f  Ctrl-Z    更新画面                     g  Ctrl-G    跳到特定行去\r
h  Ctrl-J    游标往左移一字               i            在游标前面插字\r
j  Ctrl-K    游标往下移一行               k  Ctrl-O    游标往上移一行\r
l  Ctrl-L    游标往右移一字               m            定义新功能键\r
n  Ctrl-N    搜寻/替换下个符合字串        o            在游标底下加一新行\r
q  Ctrl-Q    离开编辑器                   r  Ctrl-R    字串替换\r
s  Ctrl-S    字串搜寻                     u            取消某功能键定义\r
w  Ctrl-W    储存档案                     x  Ctrl-X    删除游标上的字\r
A  Ctrl-A    将游标移到行首               B  Ctrl-B    往上卷一页（22 行）\r
E  Ctrl-E    将游标移到行尾               F  Ctrl-F    往下卷一页（22 行）\r
J  Ctrl-P    将下行文字接到此行後面       O            在游标上方加一新行\r
U  Ctrl-U    将游标移到档头               V  Ctrl-V    将游标移到档尾\r\n");
        printf(
".            重覆上个指令                 ?  Ctrl-Y    辅助画面（此画面）\r
~  Ctrl-T    在游标前面插入一个「!」字元\r\n
合法的定义键是可印字母和 ESC、F1～F12、BACKSPACE、TAB、ENTER、INSERT、DELETE、\r
HOME、END、PAGEUP、PAGEDOWN、UP、DOWN、LEFT、RIGHT、Ctrl-A～Ctrl-Z。\r
\r
欢迎传播此编辑器，但请保留版权宣告，有任何问题和建议请联络我：\r
kenny@cindy.cis.nctu.edu.tw。\r
                                                           [按任意键回到编辑器]"
);
        get_char("_input", HIDE, pl, REFRESH); // 读取按键以重绘画面
} // _help()


private void _home(object pl)                // 将游标移到行首
{
        mapping me=pl->query_temp("me");

        me["iCol"] = 1;
        if (me["iS_Col"] == 1)_refresh_status(pl);
        else        _refresh_screen(pl, me["iS_Row"], me["iE_Row"], 1);
} // _home()


private void _insert(object pl)                // 在游标前面插字
{
        mapping me=pl->query_temp("me");

        if (sizeof(me["sText"]) == 0) return;
        me["is_Command_Mode"] = 0;
        _refresh_status(pl);
} // _insert()


private void _insert_line(object pl)        // 在游标上方加一新行
{
        string *text=({ });
        mapping me=pl->query_temp("me");

        me["is_Command_Mode"] = me["is_NewFile"] = 0;
        me["is_Modify"] = 1;
        // 检查是否游标上方是否有内容
        if (me["iS_Row"]+me["iRow"]-3 >= 0)
                text = me["sText"][0..me["iS_Row"]+me["iRow"]-3];
        text += ({ "" });
        text += me["sText"][me["iS_Row"]+me["iRow"]-2..<1];
        me["sText"] = text;
        me["iCol"] = 1;
        _refresh_screen(pl, me["iS_Row"], sizeof(me["sText"]), 1);
} // _insert_line()


private void _insert_exclam_mark(object pl) // 在游标前面插入一个「!」字元
{
        mapping me=pl->query_temp("me");

        // 因为无法正常输入「!」，所以特地加此函式以输入「!」。
        if (sizeof(me["sText"]) == 0) return;
        me["sChar"] = "!";
        _process(pl);
} // _insert_!()


private void _join(object pl)                // 将下行文字移到此行後面
{
        string *text=({ });
        mapping me=pl->query_temp("me");


        if (me["iS_Row"]+me["iRow"]-1 >= sizeof(me["sText"])) return;

        me["is_NewFile"] = 0;
        me["is_Modify"] = 1;
        _end(pl);                        // 先将游标移到行尾
        text = me["sText"][0..me["iS_Row"]+me["iRow"]-2];
        if (sizeof(me["sText"][me["iS_Row"]+me["iRow"]-1]))
        {        // 若下行有内容附加上来
                text[me["iS_Row"]+me["iRow"]-2] += (" "+
                        me["sText"][me["iS_Row"]+me["iRow"]-1]);
                _right(pl, 1, 1);
        }
        text += me["sText"][me["iS_Row"]+me["iRow"]..<1];
        me["sText"] = text;
        _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]);
} // _join()


private void _keymap(object pl)                // 定义新功能键
{
        _message(pl, "请输入新定义键和原功能键（直接按 ENTER 取消，以空白隔开）",
                "_keymap_done", ECHO);
} // _keymap()


protected void _keymap_done(string str, object pl) // 取得定义功能键
{
        string old, _new;
        mapping me=pl->query_temp("me");

        _refresh_status(pl);
        if (str != "")
        {        // 若有资料输入
                if (sscanf(str, "%s %s", _new, old) != 2)
                        return _message(pl, "输入格式错误。", "_message_done",
                                HIDE);
                me["keymap"][_new] = old;
                _message(pl, sprintf("好了，从此以後新定义键「%s」就有原功能键?
?s」的功能了！",
                        _new, old), "_message_done", HIDE);
        }
        else        get_char("_input", HIDE, pl); // 取消输入，继续读取下个输入
} // _keymap_done()


private void _left(object pl)                // 游标往左移一字
{
        mapping me=pl->query_temp("me");

        if (me["iS_Col"]==1 && me["iCol"]==1) return _refresh_status(pl);
        if (--me["iCol"] < 1)
        {        // 游标的新位置在原画面外，需要重绘画面
                // 若左移 8 栏太多的话，就只左移一栏
                if (me["iS_Col"]-8 < 1)
                        me["iCol"] = me["iS_Col"]-1;
                else        me["iCol"] = 8; // 不然就设定游标在第 8 栏位置
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"],
                        me["iS_Col"]-me["iCol"]);
                return;
        }
        _refresh_status(pl);
} // _left()


// 在状态列显示讯息
private varargs void _message(object pl, string str, string callback, int hide,
mixed arg)
{
        printf(HOME + NOR + REV);        // 移动游标到 (1,1)，设定反相字元显示
        // 清除原状态列的讯息
        printf("
                ");
        printf(HOME + str);                // 移动游标到 (1,1)，再显示讯息
        input_to(callback, hide, pl, arg); // 读取输入资料
} // _message()


protected void _message_done(string str, object pl) // 结束讯息的显示
{
        _refresh_status(pl);
        get_char("_input", HIDE, pl);        // 继续读取输入字串
} // _message_done()


private void _next_match(object pl)                // 搜寻/替换下个符合字串
{
        mapping me=pl->query_temp("me");
        string str="";
        // 设定起始搜寻位置为游标现在位置
        int    j=me["iS_Col"]+me["iCol"]-1,
               i, ofs;


        if (!stringp(me["sSearch"])) return; // 若没先设定搜寻字串，不做事

        for (i=me["iS_Row"]+me["iRow"]-2; i<sizeof(me["sText"]); i++)
        {
                if ((ofs = strsrch(me["sText"][i][j-1..<1], me["sSearch"]))== -1)
                        j = 1; // 这行没找到的话，设定下行从第一栏开始找
                else
                {        // 找到指定字串了, 移动游标到目的行
                        _goto_line_done(sprintf("%d", i+1), pl, 0);
                        me["iCol"] = j+ofs; // 计算指定字串的绝对位置
                        // 若指定字串落在原画面外，则重绘画面
                        if (me["iCol"]<me["iS_Col"] ||
                            me["iCol"]+strlen(me["sSearch"])>me["iS_Col"]+79)
                                _refresh_screen(pl, me["iS_Row"], me["iE_Row"],
                                        me["iCol"]);
                        if (stringp(me["sReplace"]))
                        {        // 需要替换字串
                                me["is_NewFile"] = 0;
                                me["is_Modify"] = 1;
                                // 附加游标前内容
                                str = me["sText"][i][0..me["iCol"]-2];
                                str += me["sReplace"];
                                str += (me["sText"][i][me["iCol"]+
                                        strlen(me["sSearch"])-1..<1]);
                                me["sText"][i] = str;
                                // 若替换字串落在原画面外，则重绘画面
                                if (me["iCol"]<me["iS_Col"] ||
                                    me["iCol"]+strlen(me["sReplace"])
                                    > me["iS_Col"]+79)
                                        _refresh_screen(pl, me["iS_Row"],
                                                me["iE_Row"], me["iCol"]);
                                // 将游漂移到替换字串後面
                                me["iCol"] = me["iCol"]+strlen(me["sReplace"])-
                                        me["iS_Col"]+1;
                                printf(ESC "[%d;1f%-80s", me["iRow"]+1,
                                        me["sText"][me["iS_Row"]+
                                        me["iRow"]-2][me["iS_Col"]-1
                                        ..me["iE_Col"]-1]);
                        }
                        // 将游漂移到搜寻字串後面
                        else        
				me["iCol"] = me["iCol"]+strlen(me["sSearch"])-me["iS_Col"]+1;
                        _refresh_status(pl);
                        break;
                } // if found
        } // for each row
        if (i >= sizeof(me["sText"]))
                _message(pl, "找不到指定字串！", "_message_done", HIDE);
        else        get_char("_input", HIDE, pl); // 读取下个输入字串
} // _next_match()


private void _page_down(object pl)        // 往下卷一页（22 行）
{
        mapping me=pl->query_temp("me");

        if (me["iS_Row"]+22 > sizeof(me["sText"])) return; // 检查是否不能再卷了
        me["iS_Row"] += 22;        me["iE_Row"] += 22;
        // 检查游标的新位置是否超过档尾
        if (me["iS_Row"]+me["iRow"]-1 > sizeof(me["sText"]))
                me["iRow"] = sizeof(me["sText"])-me["iS_Row"]+1;
        _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]);
        // 若游标的新位置超过行尾，则移动游标到行尾
        if (me["iS_Col"]+me["iCol"]-1 > sizeof(me["sText"][me["iS_Row"]+
                me["iRow"]-2]))
                _end(pl);
} // _page_down()


private void _page_up(object pl)        // 往上卷一页（22 行）
{
        mapping me=pl->query_temp("me");

        if (me["iS_Row"] <= 1) return; // 检查是否不能再卷了
        me["iS_Row"] -= 22;
        if (me["iS_Row"] < 1) me["iS_Row"] = 1; // 最多只能翻到第一列
        _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]);
        // 若游标的新位置超过行尾，则移动游标到行尾
        if (me["iS_Col"]+me["iCol"]-1 >
            sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2]))
            _end(pl);
} // _page_up()


private void _process(object pl)        // 处理输入模式的字串输入
{
        int    i, size;
        string str, rest, *input;
        mapping me=pl->query_temp("me");


        if (me["is_Modify"]==0 || me["is_NewFile"]==1)
        {
                me["is_NewFile"] = 0;
                me["is_Modify"] = 1;
                _refresh_status(pl);
        }
        if (!me["is_Substituted"] && (strsrch(me["sChar"], "\r")!=-1 ||
            strsrch(me["sChar"], "\n")!=-1))
                me["is_Substituted"] = 1; // 设定内码代换旗标
        me["sChar"] = replace_string(me["sChar"], "\t", "        ");
        me["sChar"] = replace_string(me["sChar"], "\r", "\rENTER\r");
        me["sChar"] = replace_string(me["sChar"], "\n", "\rENTER\r");
        input = explode(me["sChar"], "\r");

        size = sizeof(input);
        for (i=0; i<size; i++)                // 一次处理一行输入
        {
                if (me["is_Substituted"] && input[i] == "ENTER")
                {        // 当键入 ENTER 时，要将游标之後的内容移到下面的新行
                        rest = me["sText"][me["iS_Row"]+
                                me["iRow"]-2][me["iS_Col"]+me["iCol"]-2..<1];
                        me["sText"][me["iS_Row"]+me["iRow"]-2] =
                                me["sText"][me["iS_Row"]+
                                me["iRow"]-2][0..me["iS_Col"]+me["iCol"]-3];
                        _append_line(pl); // 在游标底下加一新行
                        // 新行的内容是原游标位置以後的内容
                        me["sText"][me["iS_Row"]+me["iRow"]-2] = rest;
                        continue;
                }

                // 输入字串不是 ENTER 时, 处理 TAB 的定位
                if (me["is_Substituted"] && input[i] == "TAB")
                        input[i] = "        "[0..7-(me["iCol"]-1)%8];
                str = me["sText"][me["iS_Row"]+me["iRow"]-2][0..me["iS_Col"]+
                        me["iCol"]-3] + input[i] + me["sText"][me["iS_Row"] +
                        me["iRow"]-2][me["iS_Col"]+ me["iCol"]-2..<1];
                me["sText"][me["iS_Row"]+me["iRow"]-2] = str;
                _right(pl, sizeof(input[i]), 1);
        } // for

        printf(ESC "[%d;1f%s", me["iRow"]+1, me["sText"][me["iS_Row"]+
                me["iRow"]-2][me["iS_Col"]-1..me["iE_Col"]-1]);
        _refresh_cursor(pl);
} // _process()


protected void _quit(mixed unused, mixed pl) // 离开编辑器
{
        mapping me;

        seteuid(geteuid(pl));
        me = pl->query_temp("me");
        if (me["is_Modify"])
                return _message(pl, "此档案已更改，请问需要存档吗（y/n)？[n]",
                        "_confirm_save", ECHO);
        me["iRow"] = 23;
        _refresh_cursor(pl);                // 移动游标到最後一行
        printf(NOR "\r\n");
        // 若功能键定义对照表是空的，就清除玩家身上的记录，不然就记录在玩家身上
        if (sizeof(me["keymap"]) == 0) pl->delete("me_keymap");
        else pl->set("me_keymap", me["keymap"]);
        map_delete(EditedFiles, pl->query_temp("me/sFileName"));
        pl->delete_temp("me"); // 清除编辑器用到的暂时变数
} // _quit()


private void _refresh(object pl)        // 更新画面
{
        mapping me=pl->query_temp("me");
        _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]);
} // _refresh()


private void _replace(object pl)        // 字串替换
{
        _message(pl, "搜寻/替换字串(直接按ENTER取消,以空白隔开):",
                "_replace_done", ECHO);
} // _replace()

protected void _replace_done(string str, object pl) // 取得替换字串
{
        mapping me=pl->query_temp("me");

        _refresh_status(pl);
        if (str != "")
        {        // 有输入资料时
                if (sscanf(str, "%s %s", me["sSearch"],        me["sReplace"]) != 2)
                {        // 只有一个字串，就指定为搜寻字串，意即拿掉指定字串
                        me["sSearch"] = str;
                        me["sReplace"] = "";
                }
                _next_match(pl);
        }
        else        get_char("_input", HIDE, pl); // 继续读取下个输入字串
} // _replace_done()


private void _right(object pl, int col, int extra)        // 游标往右移一字
{
        int    acc;
        mapping me=pl->query_temp("me");


        if (sizeof(me["sText"])==0 || me["iS_Col"]+me["iCol"]-1>
            sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])-1+extra)
            return;
        me["iCol"] += col;
        if (me["iS_Col"]+me["iCol"]-1 > sizeof(me["sText"][me["iS_Row"]+
            me["iRow"]-2])+extra)
                me["iCol"] = sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])-
                        me["iS_Col"]+1+extra;
        if (me["iCol"] > 80)
        {        // 游标的新位置不在可见视窗内，需要往右移动视窗
                // 若右移 8 栏太多的话，就只右移到行尾
                if (me["iE_Col"]+8 > sizeof(me["sText"][me["iS_Row"]+
                    me["iRow"]-2])+1)
                        acc = sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])-
                                me["iE_Col"]+1;
                else        acc = 8;
                me["iCol"] = 80-acc+1;         // 计算游标的新位置
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]+acc);
                return;
        }
        _refresh_status(pl);
} // _right()


private void _search(object pl)                // 字串搜寻
{
        _message(pl, "请输入搜寻字串（直接按 ENTER 取消)：", "_search_done",
                ECHO);
} // _search()


protected void _search_done(string str, object pl) // 取得搜寻字串
{
        mapping me=pl->query_temp("me");

        _refresh_status(pl);
        if (str != "")
        {        // 有输入资料时
                me["sSearch"] = str;        me["sReplace"] = 0;
                _next_match(pl);
        }
        else        get_char("_input", HIDE, pl); // 继续读取下个输入字串
} // _search_done()


private void _tab(object pl)                 // 命令模式下 TAB 键的定位
{
        mapping me=pl->query_temp("me");
        _right(pl, 8-(me["iCol"]-1)%8, 0);
} // _tab()


private void _undef_key(object pl)        // 取消某功能键定义
{
        _message(pl, "请输入欲取消定义之功能键（直接按 ENTER 取消)：",
                "_undef_key_done", ECHO);
} // undef_key()


protected void _undef_key_done(string str, object pl) // 取得指定功能键
{
        mapping me=pl->query_temp("me");
        if (str != "")        map_delete(me["keymap"], str);
        _message_done("", pl);
} // undef_key_done()


private void _up(object pl)                // 游标往上移一行
{
        int  acc;
        mapping me=pl->query_temp("me");


        if (me["iRow"]==1 && me["iS_Row"]==1)        return;
        if (--me["iRow"] < 1)
        {        // 游标新位置不在可见视窗内，就上移视窗
                me["iS_Row"]--;
                me["iE_Row"]=me["iS_Row"]+22;
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"], me["iS_Col"]);
                me["iRow"] = 1;
        }
        // 若游标新位置超过行尾，则移到行尾
        if (me["iS_Col"]+me["iCol"]-1 > sizeof(me["sText"][me["iS_Row"]+
            me["iRow"]-2]))
                me["iCol"] = sizeof(me["sText"][me["iS_Row"]+me["iRow"]-2])-
                        me["iS_Col"]+(me["is_Command_Mode"]?1:2);
        // 若此行无字，则定位在第一栏
        if (me["iCol"]==0 && me["iS_Col"]==1) me["iCol"] = 1;
        if (me["iCol"] > 0) _refresh_status(pl);
        else
        {        // 游标新位置不在可见视窗内，重绘画面
                acc = me["iCol"];        me["iCol"] = 1;
                _refresh_screen(pl, me["iS_Row"], me["iE_Row"],
                        me["iS_Col"]+acc-1);
        }
} // _up()


private void _write(object pl)                // 取得储存档案名称
{
        _message(pl, "请输入新档名（直接按 ENTER 以使用旧档名)：",
                "_write_done", ECHO, 0);
} // _write()


protected void _write_done(string str, object pl, int quit) // 储存档案
{
        string callback;
        mapping me=pl->query_temp("me");

        if (str == "") str = me["sFileName"];
        else        // 取得档名
                str = resolve_path(pl->query("cwd"), str);
        if (quit) callback = "_quit";
        else callback = "_message_done";
        if (write_file(str, implode(me["sText"], "\n")+"\n", 1))
        {
                if (me["is_Modify"])
                        log_file(LOGFILE, sprintf("[%s] %s %s %s\n",
                                ctime(time()), getuid(pl),
                                me["is_NewFile"]? "+": "*", str));
                me["is_Modify"] = me["is_NewFile"] = 0;
                me["sFileName"] = str;
                _message(pl, "存档成功。", callback, HIDE);
        }
        else
                _message(pl, "存档失败。", callback, HIDE);
} // write_done()
