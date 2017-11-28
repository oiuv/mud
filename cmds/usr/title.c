// mktitle.c

#include <ansi.h>

inherit F_CLEAN_UP;

private int   create_title(string arg);
private int   delete_title(string arg);
private int   grant_title(string arg);
private int   replace_title(string arg);
private int   set_title(string arg);
private int   list_title();
private mixed check_title(string arg);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	//object ob;
        string sw;

	if (! arg)
        {
                if (! me->query("title"))
                        write("你现在并没有任何称号。\n");
                else
                        write("你现在的江湖称号：" + me->query("title") + "\n");
                        if (stringp(me->query_temp("title")))
                                write("游戏赋予你的特殊称号：" + me->query_temp("title") + "\n");
                return 1;
        }

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (arg == "-l")
                return list_title();

	if (sscanf(arg, "%s %s", sw, arg) != 2)
                return notify_fail("请参见 help title 获得该命令的使用方法。\n");

        switch (sw)
        {
        case "-c": return create_title(arg);  break;
        case "-d": return delete_title(arg);  break;
        case "-g": return grant_title(arg);   break;
        case "-r": return replace_title(arg); break;
        case "-s": return set_title(arg);     break;
        case "-l": return list_title();       break;
        default:   return notify_fail("参数错误。\n");
        }
}

// 创建称号
private int create_title(string arg)
{
        int n = 1;
        mixed ts;

        sscanf(arg, "%s %d", arg, n);
        ts = UPDATE_D->query_title_base();
        if (! arrayp(ts)) ts = ({ });
        if (n + sizeof(ts) >= 100)
                return notify_fail("系统中最多只能有一百个称号，所以请你考虑先取消一些。\n");

        if (! stringp(arg = check_title(arg)))
                return 0;

        write("创建了" + chinese_number(n) + "个称号：" + arg + "\n");
        while (n--)
                ts += ({ ({ arg, 0 }) });
        UPDATE_D->set_title_base(ts);
        UPDATE_D->save();
        return 1;
}

// 删除称号
private int delete_title(string arg)
{
        mixed ts;
        mixed item;
        mixed ds;
        object ob;
        int n;

        ts = UPDATE_D->query_title_base();
        if (! arrayp(ts))
                return notify_fail("目前游戏中并没有任何特殊称号。\n");

        if (sscanf(arg, "%d", n))
        {
                if (n < 1 || n > sizeof(ts))
                        return notify_fail("称号的代号是从 1 到 " +
                                           sizeof(ts) + " ，请输入有效的代号。\n");

                n--;
                if (stringp(ts[n][1]) && wiz_level(ts[n][1]) > wiz_level(this_player()))
                        return notify_fail("你没有权限删除 " + ts[n][1] +
                                           " 拥有的称号。\n");

                if (stringp(ts[n][1]) && objectp(ob = find_player(ts[n][1])))
                {
                        ob->delete_temp("title");
                        ob->delete("granted_title");
                }

                ds = ts[0..n - 1] + ts[n + 1..<1];
                UPDATE_D->set_title_base(ds);
                UPDATE_D->save();
                write("去掉了第 " + (n + 1) + " 个称号。\n");
                return 1;
        }

        if (! stringp(arg = check_title(arg)))
                return notify_fail("目前游戏中并没有这个称号。\n");;

        arg = filter_color(arg);

        ds = allocate(sizeof(ts));
        n = 0;
        foreach (item in ts)
        {
                if (! arrayp(item) || sizeof(item) != 2)
                        continue;

                if (filter_color(item[0]) == arg &&
                    (! stringp(item[1]) || wiz_level(item[1]) < wiz_level(this_player())))
                {
                        if (stringp(item[1]) && objectp(ob = find_player(item[1])))
                        {
                                ob->delete_temp("title");
                                ob->delete("granted_title");
                        }
                        continue;
                }

                ds[n++] = item;
        }
        ds = ds[0..n - 1];
        UPDATE_D->set_title_base(ds);
        UPDATE_D->save();
        write("去掉了称号：" + arg + "。\n");

        return 1;
}

// 更换称号
private int replace_title(string arg)
{
        string new_title;
        mixed ts;
        mixed item;
        object ob;
        int n;

        if (sscanf(arg, "%s %s", arg, new_title) != 2)
                return notify_fail("你打算把这些称号修改成什么？\n");

        if (! stringp(new_title = check_title(new_title)))
                return 0;

        ts = UPDATE_D->query_title_base();
        if (! arrayp(ts))
                return notify_fail("目前游戏中并没有任何特殊称号。\n");

        if (sscanf(arg, "%d", n))
        {
                if (n < 1 || n > sizeof(ts))
                        return notify_fail("称号的代号是从 1 到 " +
                                           sizeof(ts) + " ，请输入有效的代号。\n");

                n--;
                if (! stringp(ts[n][1]) || wiz_level(ts[n][1]) <= wiz_level(this_player()))
                {
                        // 可以修改这个称号
                        ts[n][0] = new_title;
                        if (stringp(ts[n][1]) &&
                            objectp(ob = find_player(ts[n][1])))
                                ob->set_temp("title", new_title);
                } else
                        return notify_fail("你没有权限修改 " + ts[n][1] + " 所拥有的称号。\n");

                UPDATE_D->set_title_base(ts);
                UPDATE_D->save();
                write("修改了第 " + (n + 1) + " 个称号。\n");
                return 1;
        }

        if (! stringp(arg = check_title(arg)))
                return notify_fail("目前游戏中并没有这个称号。\n");;

        n = 0;
        arg = filter_color(arg);
        foreach (item in ts)
        {
                if (! arrayp(item) || sizeof(item) != 2)
                        continue;

                if (filter_color(item[0]) == arg)
                {
                        if (! stringp(item[1]) || wiz_level(item[1]) <= wiz_level(this_player()))
                        {
                                // 可以修改这个称号
                                n++;
                                item[0] = new_title;
                                if (stringp(item[1]) && objectp(ob = find_player(item[1])))
                                        ob->set_temp("title", new_title);
                        }
                        continue;
                }
        }

        if (! n)
                return notify_fail("目前游戏中并没有可以让你修改的称号。\n");

        UPDATE_D->set_title_base(ts);
        UPDATE_D->save();
        write("修改称号“" + arg + "”为”" + new_title + "”。\n");

        return 1;
}

// 设置称号
private int set_title(string arg)
{
        string user;
        object ob;

        if (sscanf(arg, "%s %s", user, arg) != 2)
                return notify_fail("你要为谁设置什么称号？\n");

        if (! objectp(ob = find_player(user)))
                return notify_fail("这个玩家不在游戏中，不能设定称号。\n");

        if (! stringp(arg = check_title(arg)))
                return 0;

        if (wiz_level(this_player()) < wiz_level(ob))
                return notify_fail("你不能为" + ob->name(1) + "设定称号。\n");

        ob->set("title", arg);
        write("为" + ob->name(1) + "设定了称号。\n");
        return 1;
}

// 授予称号
private int grant_title(string arg)
{
        string user;
        mixed ts;
        mixed item;
        object nob;
        object ob;
        int i;

        if (sscanf(arg, "%s none", user) == 1)
        {
                // 清除他原先的 title
                write(UPDATE_D->clear_user_data(user, "title"));
                return 1;
        }

        if (sscanf(arg, "%s %d", user, i) != 2)
                return notify_fail("授予称号你必须指定玩家和称号的代号。\n");

        ts = UPDATE_D->query_title_base();
        if (i < 1 || i > sizeof(ts))
                return notify_fail("称号的代号是从 1 到 " +
                                   sizeof(ts) + " ，请输入有效的代号。\n");
        i--;
        item = ts[i];

        if (! objectp(nob = UPDATE_D->global_find_player(user)))
                return notify_fail("你只能授予称号给已经注册的玩家。\n");

        if (item[1] == user)
        {
                notify_fail(nob->name(1) + "的称号目前正是这个。\n");
                UPDATE_D->global_destruct_player(nob);
                return 0;
        }

        if (wiz_level(this_player()) < wiz_level(nob))
        {
                notify_fail("你不能为" + nob->name(1) + "设定称号。\n");
                UPDATE_D->global_destruct_player(nob);
                return 0;
        }

        // 清除他原先的 title
        UPDATE_D->remove_title(nob);

        if (stringp(item[1]) && objectp(ob = find_player(item[1])))
        {
                // 恢复这个玩家的原先称号
                ob->delete_temp("title");
                ob->delete("granted_title");
        }

        // 重新设置系统的 title 记录
        item[1] = user;
        ts[i] = item;

        // 重新设置玩家得 title
        nob->set_temp("title", item[0]);
        nob->set("granted_title", 1);
        nob->save();

        UPDATE_D->set_title_base(ts);
        UPDATE_D->save();
        write("为" + nob->name(1) + "授予了“" + item[0] + "”的称号。\n");
        UPDATE_D->global_destruct_player(nob);

        return 1;
}

private int list_title()
{
        mixed ts;
        string str;
        mixed item;
        int i;

        ts = UPDATE_D->query_title_base();
        if (! arrayp(ts) || sizeof(ts) < 1)
                return notify_fail("目前游戏中没有任何特殊称号。\n");

        i = 1;
        str = "目前系统中的特殊称号有 " CYN + sizeof(ts) + NOR " 个：\n";
        foreach (item in ts)
        {
                //str += sprintf("%3d. %-" + (30 + color_len(item[0])) + "s%s\n",
                str += sprintf("%3d. %-" + (30) + "s%s\n",
                               i, item[0], item[1] ? item[1] : "");
                i++;
        }
        this_player()->start_more(str);

        return 1;
}

private mixed check_title(string arg)
{
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

	if (strlen(filter_color(arg)) > 30 || strlen(arg) > 100)
		return notify_fail("这个外号太长了，为了节约资源，请你重新设定。\n");

        return arg + NOR;
}

int help(object me)
{
        write(@HELP
指令格式 : title -c <称号> [<数量>]
           title -d <称号代码> | <称号>
           title -g <sb> <称号代码> | <none>
           title -r <称号代码> | <称号> <新称号>
           title -s <玩家> <新称号>
           title -l
 
这个指令可以让你为某人取一个响亮的头衔，但是只有巫
师才可以使用，你如果希望在外号中使用 ANSI 的控制字
元改变颜色，可以用以下的控制字串：

$BLK$ - 黑色		$NOR$ - 恢复正常颜色
$RED$ - 红色		$HIR$ - 亮红色
$GRN$ - 绿色		$HIG$ - 亮绿色
$YEL$ - 土黄色		$HIY$ - 黄色
$BLU$ - 深蓝色		$HIB$ - 蓝色
$MAG$ - 浅紫色		$HIM$ - 粉红色
$CYN$ - 蓝绿色		$HIC$ - 天青色
$WHT$ - 浅灰色		$HIW$ - 白色
 
其中系统自动会在字串尾端加一个 $NOR$。

授予称号可以使用 -g 参数。授予前首先需要创建称号：使用 -c 参
数可以在游戏中创建一个或多个称号。使用 -d 可以去掉这些称号。
而 -l 参数则能够列出所有这些称号和目前的授予情况。使用 -r 参
数可以将目前的某些称号更换描述，而 -s 参数则可以设置玩家的原
始称号：注意，这个称号在拜师或者是某些场合下可能会被修改。

比如想授予某个玩家“东邪”这个称号可以：
title -c $HIY$东邪
title -l 查看到“东邪”这个称号的代号是2。
title -g player 2
倘若对“东邪”这个称号不满意，可以：
title -r 东邪 西毒
将这个称号的名字更换。
如果需要剥夺这个称号可以：
title -g player none

只有需要永久保留的 title 才使用 title -c 创建然后授予玩家，
一般修改 title 应该使用 title -s <玩家> <称号> 以节约资源。

HELP );
        return 1;
}
