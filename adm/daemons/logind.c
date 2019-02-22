// logind.c

#include <ansi.h>
#include <command.h>
#include <login.h>
#include <config.h>
#include <getconfig.h>
//#include "/u/ivy/mail_center/mail.h" // 包含读取邮件信息的函数

#define MUDLIST_CMD     "/cmds/usr/mudlist"
#define REBOOT_CMD      "/cmds/arch/reboot"

inherit F_DBASE;

STATIC_VAR_TAG int wiz_lock_level = 0;

STATIC_VAR_TAG string *movie;

string *banned_name = ({
    "你", "我", "他", "她", "它",
    "爸", "爷", "妈", "奶",
    "屎", "尿", "粪", "　",
});

string *banned_id = ({
    "domain", "root", "mudlib", "quit",
    "arch", "wizard", "apprentice",
    "immortal", "player", "admin",
    "all", "none", "cancel",
});

// 内部调用的函数
private void get_id(string arg, object ob);
private void get_passwd(string pass, object ob);
private void get_ad_passwd(string pass, object ob);
private void check_ok(object ob);
private void confirm_id(string yn, object ob);
private void init_new_player(object user);

// 可以被外部调用的函数
object  make_body(object ob);
varargs void enter_world(object ob, object user, int silent);
varargs void reconnect(object ob, object user, int silent);
object find_body(string name);
int check_legal_id(string arg);
int check_legal_name(string arg, int maxlen);

void create()
{
    seteuid(ROOT_UID);
    set("channel_id", "连线精灵");
    set("name", HIW "连线精灵" HIM);
    if (intp(WIZ_LOCK_LEVEL))
        wiz_lock_level = WIZ_LOCK_LEVEL;
    else
        wiz_lock_level = 0;
}

void logon(object ob)
{
    object *usr;
    int i, wiz_cnt, ppl_cnt, login_cnt;
    int iplimit;
    //int user_num;

    if (BAN_D->is_banned(query_ip_number(ob)) == 1)
    {
        write("你的地址在本 MUD 不受欢迎。\n");
        destruct(ob);
        return;
    }

    write(ESC "[2J");
    color_cat(WELCOME);

    catch(MUDLIST_CMD->main());
    UPTIME_CMD->main();

    if (! VERSION_D->is_version_ok() && ! VERSION_D->query_temp("operator"))
        write(HIY "现在本站正在同步版本，如果你不是巫师，请稍候再登录。\n\n" NOR);
    else if (REBOOT_CMD->is_rebooting())
        write(HIY "现在本站正在准备重新启动，如果你不是巫师，请稍候再登录。\n\n" NOR);

    usr = users() + filter(children(LOGIN_OB), (: interactive :));
    wiz_cnt = 0;
    ppl_cnt = 0;
    login_cnt = 0;
    iplimit = 0;
    for(i = 0; i < sizeof(usr); i++)
    {
        if (query_ip_number(usr[i]) == query_ip_number(ob)) iplimit++;
        if (base_name(usr[i]) == LOGIN_OB) login_cnt++;
        else if (wizardp(usr[i]))
        {
            if (! usr[i]->query("env/invisible")) wiz_cnt++;
        }
        else ppl_cnt++;
    }

#if 1
    if (iplimit > 5)
    {
        write("对不起，" + LOCAL_MUD_NAME() + "限制相同ip多重登录。\n");
        destruct(ob);
        return;
    }
#endif

    if (iplimit > 1)
        printf("您所在的地址已有 " HIY "%d" NOR " 位玩家在线上。\n", iplimit-1);

    printf("目前共有 " CYN "%d" NOR " 位巫师、"
            CYN "%d" NOR " 位玩家在线上，以及 "
            CYN "%d" NOR " 位使"
            "用者尝试连线中。\n\n", wiz_cnt, ppl_cnt, login_cnt);

    write("您的英文名字(新玩家可以选择一喜欢的名字)：");
    input_to("get_id", ob);
}

private void get_id(string arg, object ob)
{
    object ppl;
    arg = lower_case(arg);

    if (! check_legal_id(arg))
    {
        write("您的英文名字(新玩家可以选择一喜欢的名字)：");
        input_to("get_id", ob);
        return;
    }

    // 检查最大连接人数
    if (intp(MAX_USERS) && MAX_USERS > 0)
    {
        if ((string)SECURITY_D->get_status(arg) == "(player)" &&
          sizeof(users()) >= MAX_USERS)
        {
            ppl = find_body(arg);
            // Only allow reconnect an interactive player when MAX_USERS exceeded.
            if (! ppl)
            {
                write("对不起，" + LOCAL_MUD_NAME() +
                    "的使用者已经太多了，请待会再来。\n");
                destruct(ob);
                return;
            }
        }
    }

    if (wiz_level(arg) < 1)
    {
        if (! VERSION_D->is_version_ok() && ! VERSION_D->query_temp("operator"))
        {
            write("现在本站正在同步版本中，暂时不能登录，请稍候再尝试。\n");
            destruct(ob);
            return;
        } else if (REBOOT_CMD->is_rebooting() && ! find_player(arg))
        {
            write("现在本站正准备重新启动，暂时不能登录，请稍候再尝试。\n");
            destruct(ob);
            return;
        }
    }

    if ((string)ob->set("id", arg) != arg)
    {
        write("Failed setting user name.\n");
        destruct(ob);
        return;
    }

    if (arg == "new" || arg == "guest")
    {
        // If guest, refuse them create the character.
        confirm_id("no", ob);
        return;
    } else if (file_size(ob->query_save_file() + __SAVE_EXTENSION__) >= 0)
    {
        if (ob->restore())
        {
            write("请输入密码：");
            input_to("get_passwd", 1, ob);
            return;
        }
            write("您的人物储存档出了一些问题，请利用 guest 人物通知巫师处理。\n");
            destruct(ob);
            return;
    }

    write(WHT "\n使用[" HIC + (string)ob->query("id") + NOR + WHT "]这个名字将会"
              "创造一个新的人物，您确定吗(" HIY "y/n" NOR + WHT ")？" NOR);
    input_to("confirm_id", ob);
}

private void get_passwd(string pass, object ob)
{
    string ad_pass;
    string my_pass;

    my_pass = ob->query("password");
    ad_pass = ob->query("ad_password");
    if (! stringp(my_pass) || crypt(pass, my_pass) != my_pass)
    {
        if (! stringp(ad_pass) || crypt(pass, ad_pass) != ad_pass)
        {
            write("密码错误！\n");
            destruct(ob);
            return;
        }

        write(HIR "\n你采用了管理密码进入游戏，"
                "因此请你先修改你的普通密码。\n" NOR);

        // 做标记：表示目前流程是修改密码分支。
        ob->set_temp("reset_password", 1);
        write("\n请重新设定您的普通密码：");
        input_to("new_password", 1, ob);
        return;
    }

    if (! stringp(ad_pass))
    {
        write(HIC "\n请注意：你的ID目前还没有管理密码，请设置你的管理密码。\n\n" NOR);
        write(HIW "在你普通密码丢失的情况下，你可以输入管理密码进入，并修改普通\n"
            "密码，所以请你设置一个可靠的并且与普通密码不同的管理密码，用\n"
            "来保护你的ID。平时请使用普通密码登陆，避免过于频繁的使用管理\n"
            "密码以导致潜在的泄漏风险。\n\n" NOR);
        write("请输入你的管理密码：");
        input_to("reset_ad_password", 1, ob);
        return;
    }

    check_ok(ob);
}

private void reset_ad_password(string pass, object ob)
{
    string my_pass;
    write("\n");

    if (strlen(pass) < 5)
    {
        write("管理密码的长度至少要五个字元，请重设您的管理密码：");
        input_to("reset_ad_password", 1, ob);
        return;
    }

    my_pass = ob->query("password");
    if (stringp(my_pass) && crypt(pass, my_pass) == my_pass)
    {
        write(HIR "为了安全起见，系统要求管理密码的密码和普通密码不能相同。\n\n" NOR);
        write("请重新输入你的管理密码：");
        input_to("reset_ad_password", 1, ob);
        return;
    }

    ob->set_temp("ad_password", crypt(pass, 0));
    write("请再输入一次您的管理密码，以确认您没记错：");
    input_to("confirm_reset_ad_password", 1, ob);
}

private void confirm_reset_ad_password(string pass, object ob)
{
    //mapping my;
    string old_pass;

    write("\n");
    old_pass = ob->query_temp("ad_password");
    if (crypt(pass, old_pass) != old_pass)
    {
        write("您两次输入的管理密码并不一样，请重新设定一次管理密码：");
        input_to("reset_ad_password", 1, ob);
        return;
    }

    ob->set("ad_password", old_pass);
    check_ok(ob);
}

private void check_ok(object ob)
{
    object user;

    // Check if we are already playing.
    user = find_body(ob->query("id"));
    if (user)
    {
        if (user->is_net_dead())
        {
            reconnect(ob, user);
            return;
        }
        write(WHT "\n您要将另一个连线中的相同人物赶出去，取而代之吗？("
              HIY "y/n" NOR + WHT ")" NOR);
        input_to("confirm_relogin", ob, user);
        return;
    }

    user = MESSAGE_D->find_chatter(ob->query("id"));
    if (objectp(user))
    {
        write("你把正在聊天的ID踢了出去。\n");
        MESSAGE_D->user_logout(user, user->name(1) + "从" +
                   query_ip_number(ob) + "连线进入世界，"
                   "把你踢了出去。\n");
    }

    if (objectp(user = make_body(ob)))
    {
        if (user->restore())
        {
            mixed err;
            string msg;

            log_file("usage", sprintf("%s(%s) loggined from %s (%s)\n",
                    user->query("name"), user->query("id"),
                    query_ip_number(ob), ctime(time()) ) );

            if (ob->query("last_on") <= time() &&
              ob->query("last_on") > time() - 20 &&
              ! wiz_level(user))
            {
                write(WHT "\n你距上次退出只有" HIY + chinese_number(time() - ob->query("last_on")) +
                      NOR + WHT "秒钟，请稍候再登录。\n" NOR);
                destruct(user);
                destruct(ob);
                return;
            }

            user->set_temp("logon_time", time());
            user->set("last_save", time());
            if (err = catch(enter_world(ob, user)))
            {
                user->set_temp("error", err);
                msg = HIR "\n你无法进入这个世界，可能你的档"
                      "案出了一些问题，需要和巫师联系。\n\n" NOR;
                if (mapp(err))
                    msg += MASTER_OB->standard_trace(err, 1);
                user->set_temp("error_message", msg);
                tell_object(user, msg);
            }
            return;
        } else
        {
            destruct(user);
            write(HIR "\n无法读取你的数据档案，您需要和巫师联系。\n" NOR);
            if (CONFIG_D->query_int("ask_recreate"))
            {
                write(WHT "你可以选择重新创造玩家(y/n)：" NOR);
                input_to("create_new_player", ob);
            } else
            destruct(ob);
        }
    } else
    write(HIR "无法创建该玩家，你可以尝试重新登录或是和巫师联系。\n" NOR);
}

private void create_new_player(string yn, object ob)
{
    if (yn != "y" && yn != "Y")
    {
        write("\n那好吧，本次连接登录失败了。");
        destruct(ob);
        return;
    }

    write(HIW "\n现在开始重新创造 " HIY + ob->query("id") +
          HIW " 这个玩家。\n" NOR);
    confirm_id(yn, ob);
}

private void confirm_relogin(string yn, object ob, object user)
{
    object old_link;

    if (! yn || yn == "")
    {
        write(WHT "\n您要将另一个连线中的相同人物赶出去，取而代之吗？("
              HIY "y/n" NOR + WHT ")" NOR);
        input_to("confirm_relogin", ob, user);
        return;
    }

    if (yn[0]!='y' && yn[0]!='Y')
    {
        write("好吧，欢迎下次再来。\n");
        destruct(ob);
        return;
    }

    if (user)
    {
        tell_object(user, "有人从别处( " + query_ip_number(ob)
            + " )连线取代你所控制的人物。\n");
        log_file("usage", sprintf("%s(%s) replaced by %s (%s)\n",
           user->query("name"), user->query("id"),
           query_ip_number(ob), ctime(time())));

        // Kick out tho old player.
        old_link = user->query_temp("link_ob");
        if (old_link)
        {
            exec(old_link, user);
            destruct(old_link);
        }
    } else
    {
        write("在线玩家断开了连接，你需要重新登陆。\n");
        destruct(ob);
        return;
    }

    reconnect(ob, user);
}

private void confirm_id(string yn, object ob)
{
    if (yn == "")
    {
        write("\n使用这个名字将会创造一个新的人物，您确定吗(y/n)？");
        input_to("confirm_id", ob);
        return;
    }

    if (yn[0] != 'y' && yn[0] != 'Y')
    {
        write("\n好吧，那么请重新输入您的英文名字：");
        input_to("get_id", ob);
        return;
    }
    write(HIG "\n
请输入您的高姓大名，由于这个名字将代表你的人物，而且以后不会再
作任何更改，请务必慎重择名。" HIR "不雅观或带有政治色彩的姓名将被无条
件删除。" HIG "此外，请不要选择金庸小说中已有人物姓名。首先输入的是姓
氏，假如你想扮演的角色叫做「" HIW "张三" HIG "」的话，请先输入「" HIW "张" HIG "」，然后电
脑会询问你的名字，那时你再输入「" HIW "三" HIG "」。如果你想扮演的角色的名字
比较怪，比如叫「恐龙」，可以不输入姓，直接敲回车略过。但是建议
你还是输入一个比较像样子的姓名，而这些比较怪的称号可以用昵称代
替，否则某些地方的称呼可能会比较怪。如果你要加入世家，那就不必
输入姓了，因为加入世家后将自动选择家传祖姓，并不是玩家自己决定。\n\n" NOR);

    write("您的中文" HIG "姓氏" NOR "(不要超过两个汉字)：");
    input_to("get_surname", ob);
}

private void get_surname(string arg, object ob)
{
    if (arg && strlen(arg) > 0)
    {
        if (! check_legal_name(arg, 4))
        {
            write("您的中文" HIG "姓氏" NOR "(不要超过两个汉字)：");
            input_to("get_surname", ob);
            return;
        }
        ob->set("surname", arg);
    } else
    {
        ob->set("surname", 0);
    }
    write("您的中文" HIY "名字" NOR "(不要超过两个汉字)：");
    input_to("get_name", ob);
}

private void get_name(string arg, object ob)
{
    string fname;
    string result;

    if (! check_legal_name(arg, 4))
    {
        write("您的中文" HIY "名字" NOR "(不要超过两个汉字)：");
        input_to("get_name", ob);
        return;
    }
    ob->set("purename", arg);

    fname = ob->query("surname");
    if (! stringp(fname)) fname = "";
    fname += arg;

    if (strlen(fname) < 4)
    {
        write("对不起，你的中文名字（姓和名的组合）至少要有两个汉字。\n");
        write("\n请重新输入您中文" HIG "姓氏" NOR "：");
        input_to("get_surname", ob);
        return;
    }

    if (stringp(result = NAME_D->invalid_new_name(fname)) ||
      stringp(result = NAME_D->invalid_new_name(arg)))
    {
        write("对不起，" + result);
        write("\n请重新输入您中文" HIG "姓氏" NOR "：");
        input_to("get_surname", ob);
        return;
    }

    if (arg == ob->query("surname"))
    {
        write(HIW "\n
" HIG "系统发现你所输入的姓氏与名字相同，不知你是否因为不了解本游戏的
设定，并且没有仔细阅读前面给出的帮助而导致错误的输入姓名。如果
是，请你重新连接并且输入你的名字，否则请你再次输入一遍你的全名
表明你的确是想使用「" HIY + arg + arg + HIG "」这个名字。\n\n" NOR);

        write("请输入您的全名(即姓和名字的组合)：");
        input_to("input_full_name", ob, arg + arg);
        return;
    }

    write(HIW "\n
为了保证您的人物的安全，游戏要求您设置两个密码。第一个是管理密
码，这个密码可以在您遗失了普通密码时登录游戏，并且可以用来修改
您的普通密码。平时登陆游戏时请您尽量使用普通密码，此举将会避免
过于频繁的使用管理密码以导致潜在的泄漏风险。\n\n" NOR);

    write("请设定您的" HIW "管理密码" NOR "：");
    input_to("new_ad_password", 1, ob);
}

private void input_full_name(string arg, object ob, string fname)
{
    if (arg != fname)
    {
        write(WHT "\n
你输入的全名并不是你姓和名字的的组合，系统认为你开始没有理解输
入名字的要求，" HIR "请你仔细阅读所有提示的条款，不要自作聪明。" NOR WHT "包括在
今后的游戏过程中请仔细阅读各种帮助和公告，避免因为自以为是而导
致浪费时间或是遭受不必要的损失。" NOR);
        confirm_id("Yes", ob);
        return;
    }

    write(HIW "\n
为了保证您的人物的安全，游戏要求您设置两个密码。第一个是管理密
码，这个密码可以在您遗失了普通密码时登录游戏，并且可以用来修改
您的普通密码。平时登陆游戏时请您尽量使用普通密码，此举将会避免
过于频繁的使用管理密码以导致潜在的泄漏风险。\n\n" NOR);

    write("请设定您的" HIW "管理密码" NOR "：");
    input_to("new_ad_password", 1, ob);
}

private void new_ad_password(string pass, object ob)
{
    write("\n");
    if (strlen(pass) < 5)
    {
        write("管理密码的长度至少要五个字元，请重设您的管理密码：");
        input_to("new_ad_password", 1, ob);
        return;
    }
    ob->set_temp("ad_password", crypt(pass, 0));
    write("请再输入一次您的" HIW "管理密码" NOR "，以确认您没记错：");
    input_to("confirm_ad_password", 1, ob);
}

private void confirm_ad_password(string pass, object ob)
{
    //mapping my;
    string old_pass;

    write("\n");
    old_pass = ob->query_temp("ad_password");
    if (crypt(pass, old_pass) != old_pass)
    {
        write(HIR "\n您两次输入的管理密码不同，请重新设定一次"
              HIW "管理密码" HIR "：\n" NOR);
        input_to("new_ad_password", 1, ob);
        return;
    }

    ob->set("ad_password", old_pass);
    write(HIW "\n现在系统要求输入的是您的普通密码，此密码将用于您平时登录游戏时\n"
        "使用，而在游戏中可以通过 " HIY "PASSWD" HIW " 命令来修改您的普通密码。\n\n" NOR);
    write("请输入你的" HIY "普通密码" NOR "：");
    input_to("new_password", 1, ob);
}

private void new_password(string pass, object ob)
{
    string ad_pass;

    write("\n");
    if (strlen(pass) < 3)
    {
        write("普通密码的长度至少要三个字元，请重设您的普通密码：");
        input_to("new_password", 1, ob);
        return;
    }

    if (stringp(ad_pass = ob->query("ad_password")) &&
      crypt(pass, ad_pass) == ad_pass)
    {
        write(HIR "为了安全起见，您的管理密码和普通密码不能相同。\n" NOR);
        write("请重新设置您的" HIY "普通密码" NOR "：");
        input_to("new_password", 1, ob);
        return;
    }

    ob->set_temp("password", crypt(pass, 0));
    write("请再输入一次您的" HIY "普通密码" NOR "，以确认您没记错：");
    input_to("confirm_password", 1, ob);
}

private void confirm_password(string pass, object ob)
{
    // mapping my;
    string old_pass;

    write("\n");
    old_pass = ob->query_temp("password");
    if (crypt(pass, old_pass) != old_pass)
    {
        write(HIR "\n您两次输入的普通密码不同，请重新设定一次"
              HIY "普通密码" HIR "：\n" NOR);
        input_to("new_password", 1, ob);
        return;
    }

    ob->set("password", old_pass);
    if (ob->query_temp("reset_password"))
    {
        // 这是用户修改自己的密码分支流程，不是创建
        // 用户分支，因此转移到 check_ok 函数继续执
        // 行。
        ob->save();
        check_ok(ob);
        return;
    }
    ob->set_temp("type", "均衡型");
    write(WHT "您要扮演男性(" HIY "m" NOR + WHT ")的角色或女性("
        HIY "f" NOR + WHT ")的角色？" NOR);
    input_to("get_gender", ob);
}

private void get_gender(string gender, object ob)
{
    object user;

    write("\n");
    if (gender == "")
    {
        write(WHT "您要扮演男性(" HIY "m" NOR + WHT ")的角色或女性("
              HIY "f" NOR + WHT ")的角色？" NOR);
        input_to("get_gender", ob, user);
        return;
    }

    if (gender[0]=='m' || gender[0]=='M')
        ob->set_temp("gender", "男性");
    else if (gender[0]=='f' || gender[0]=='F')
        ob->set_temp("gender", "女性" );
    else
    {
        write(WHT "您只能扮演男性(" HIY "m" NOR + WHT ")的角色或女性("
              HIY "f" NOR + WHT ")的角色。" NOR);
        input_to("get_gender", ob, user);
        return;
    }

    if (find_body(ob->query("id")))
    {
        write(HIR "这个玩家现在已经登录到这个世界上了，请"
              "退出重新连接。\n" NOR);
        destruct(ob);
        return;
    }

    ob->set("body", USER_OB);
    if (! objectp(user = make_body(ob)))
    {
        write(HIR "\n你无法登录这个新的人物，请重新选择。\n" NOR);
        destruct(ob);
        return;
    }
    user->set("str", 14);
    user->set("dex", 14);
    user->set("con", 14);
    user->set("int", 14);
    user->set("per", 20);
    user->set("type", ob->query_temp("type"));
    user->set("gender", ob->query_temp("gender"));
    ob->set("registered", 0);
    user->set("registered", 0);
    // log_file("usage", sprintf("%s(%s) was created from %s (%s)\n",
    //         user->query("name"), user->query("id"),
    //         query_ip_number(ob), ctime(time())));
    init_new_player(user);
    enter_world(ob, user);
    write("\n");
}

object make_body(object ob)
{
    string err;
    object user;
    //int n;

    if (! is_root(previous_object()))
    {
        log_file("static/security",
        sprintf("%s try to create player(%s) on %s.\n",
               (string)geteuid(previous_object()),
               (string)ob->query("id"),
               ctime(time())));
        write("你没有权限创建玩家。\n");
        return 0;
    }

    seteuid(getuid());
    // write(RED "测试1：" + getuid() + "\n" NOR);
    user = new(USER_OB);
    if (! user)
    {
        write("现在可能有人正在修改使用者物件的程式，无法进行复制。\n");
        write(err+"\n");
        return 0;
    }
    seteuid(ob->query("id"));
    // write(RED "测试2：" + ob->query("id") + "\n" NOR);
    export_uid(user);
    export_uid(ob);
    seteuid(getuid());
    // write(RED "测试3：" + getuid() + "\n" NOR);
    user->set("id", ob->query("id"));
    user->set("surname", ob->query("surname"));
    user->set("purename", ob->query("purename"));
    user->set_name( 0, ({ ob->query("id")}) );
    return user;
}

private void init_new_player(object user)
{
    // 初始化必要属性
    user->set("title", "普通百姓");
    user->set("birthday", time() );
    user->set("potential", 99);
    user->set("food", (user->query("str") + 10) * 10);
    user->set("water", (user->query("str") + 10) * 10);
    user->set("channels", ({ "chat", "rumor", "party",
         "bill", "sing", "family", "rultra" }));

    // 记录名字
    NAME_D->map_name(user->query("name"), user->query("id"));

    // 设置必要的环境参数
    user->set("env/auto_regenerate", 1);
    user->set("env/auto_get", 1);
    user->set("env/wimpy", 60);
    //设定不自动转宗师频道，防止困扰玩家 by 薪有所属
    user->set("env/no_autoultra", 1);
}

varargs void enter_world(object ob, object user, int silent)
{
    object cloth, shoe/*, room*/, login_ob;
    string startroom;
    string ipname;
    // int new_mail_n;
    object sob; // 检查身上物品是否过多，查询是否有作弊嫌疑
    int i;
    string *sobs = ({
          "xisui xiandan",
          "wuji xiandan",
           "tonghui xiandan",
          "zhuyuan xiandan",
          "wuhua guo",
    });

    if (! is_root(previous_object()))
        return;

    user->set_temp("link_ob", ob);
    ob->set_temp("body_ob", user);
    ob->set("registered", user->query("registered"));
    if (interactive(ob)) exec(user, ob);

    write("\n目前权限：" + wizhood(user) + "\n");

    user->setup();
    if (user->query("age") == 14)
    {
        user->set("food", user->max_food_capacity());
        user->set("water", user->max_water_capacity());
    }

    // In case of new player, we save them here right aftre setup
    // compeleted.
    user->save();
    user->set("last_save", time());
    ob->save();

    // check the user
    UPDATE_D->check_user(user);

    if (wizhood(user) == "(player)")
    {
        if (user->query("class") == "bonze")
        {
            if (user->query("gender") == "女性")
            {
                cloth = new("/clone/cloth/ni-cloth.c");
                shoe = new("/clone/cloth/ni-xie.c");
            }
            else
            {
                cloth = new("/clone/cloth/seng-cloth.c");
                shoe = new("/clone/cloth/seng-xie.c");
            }
        } else
        {
            if (user->query("class") == "taoist")
            {
                if (user->query("gender") == "女性")
                {
                    cloth = new("/clone/cloth/daogu-cloth.c");
                    shoe = new("/clone/cloth/dao-xie.c");
                } else
                {
                    cloth = new("/clone/cloth/dao-cloth.c");
                    shoe = new("/clone/cloth/dao-xie.c");
                }
            } else
            {
                if (user->query("gender") == "女性")
                {
                    shoe = new("/clone/cloth/female-shoe.c");
                    cloth = new(sprintf("/clone/cloth/female%d-cloth.c", 1 + random(8)));
                } else
                {
                    shoe = new("/clone/cloth/male-shoe.c");
                    cloth = new(sprintf("/clone/cloth/male%d-cloth.c", 1 + random(8)));
                }
            }
        }

        cloth->move(user);
        catch(cloth->wear());
        shoe->move(user);
        catch(shoe->wear());
    } else
    {
        if (user->query("gender") == "女性")
        {
            cloth = new("/clone/cloth/yunshang");
            cloth->move(user);
            cloth->wear();
        } else
        {
            cloth = new("/clone/cloth/jinduan");
            shoe  = new("/clone/cloth/xianlv");
            cloth->move(user);
            cloth->wear();
            shoe->move(user);
            shoe->wear();
        }
    }
    user->set("registered",1);
    //user->set("born",1);
    if (cloth && (! environment(cloth) || ! cloth->query("equipped")))
        destruct(cloth);

    if (shoe && (! environment(shoe) || ! shoe->query("equipped")))
        destruct(shoe);

    if (! silent)
    {
        if (! user->query("registered"))
            color_cat(UNREG_MOTD);
        else
            color_cat(MOTD);

        write("你连线进入" + LOCAL_MUD_NAME() + "。\n\n");

        if (! user->query("registered") ||
            ! stringp(user->query("character")))
        {
          if (user->is_ghost())
            user->reincarnate();
            user->set("startroom", REGISTER_ROOM);
        } else if (! stringp(user->query("born")))
        {
            if (user->is_ghost())
                user->reincarnate();
            user->set("startroom", BORN_ROOM);
        }

        if (user->is_in_prison())
            startroom = user->query_prison();
        else if (user->is_ghost())
            startroom = DEATH_ROOM;
        else if (! stringp(startroom = user->query("startroom")) ||
            file_size(startroom + ".c") < 0)
            startroom = START_ROOM;

        if (! catch(load_object(startroom)))
            user->move(startroom);
        else
        {
            user->move(START_ROOM);
            startroom = START_ROOM;
            user->set("startroom", START_ROOM);
        }
        tell_room(startroom, user->query("name") +
            "连线进入这个世界。\n", ({user}));
    }

    login_ob = new(LOGIN_OB);
    login_ob->set("id", user->query("id"));
    login_ob->restore();
    if (login_ob->query("registered"))
    {
        if (! intp(login_ob->query("login_times")))
        {
            write(NOR "\n你是第一次光临" + LOCAL_MUD_NAME() + "。\n");
            login_ob->set("login_times", 1);
            // show rules
        } else
        {
            login_ob->add("login_times", 1);
            write("\n你上次光临" + LOCAL_MUD_NAME() + "是 " + HIG +
                    ctime(login_ob->query("last_on")) + NOR + " 从 " + HIR +
                    login_ob->query("last_from") + NOR + " 连接的。\n");
        }
    }

    destruct(login_ob);

    // 检查同盟情况
    "/cmds/usr/league"->main(this_player(), "check");

    for (i = 0; i < sizeof(sobs); i ++)
    {
        if (wizardp(this_player())) break;

        if (objectp (sob = present(sobs[i], this_player())) )
        {
            if (sob->query_amount() > 20)
                log_file("warning", this_player()->name() + "(" +
                      this_player()->query("id") + ") has more than" + " " +
                      sob->query_amount() + " "+ sobs[i] + "\n");

            if (sob->query_amount() > 30)
            {
                log_file("logind_throw", this_player()->name() + " had been throwed by 连线精灵。\n");
                this_player()->get_into_prison(this_object(), 0, 144400);
                break;
            }
        }
    }

    tell_object(this_player(), HIG "\n今后请使用" HIY " wenxuan " HIG "命令查阅游戏的文章选集。\n\n");
/*
        // 检查是否有新邮件未读
        new_mail_n = get_info(user->query("id"), "newmail", "", 0);


        if (new_mail_n)
                tell_object(user, HIG"【炎黄邮件系统】：你有 "
                            HIY + new_mail_n + HIG " 封新邮件，请到邮件中心查阅！\n" NOR);
*/
    CHANNEL_D->do_channel(this_object(), "sys",
    sprintf("%s(%s)由[%s]连线进入。",
            user->name(), user->query("id"),
            (ipname = query_ip_number(user)) ? ipname : "未知地点"));
/*
    sprintf("%s(%s)由%s(%s)连线进入。",
                user->name(), user->query("id"),
                (ipname = query_ip_number(user)) ? ipname : "未知地点",IP_D->seek_ip_address(ipname)));
*/

#if INSTALL_EXAMINE
    EXAMINE_D->examine_player(user);
#endif

    if (wizhood(user) != "(admin)" &&
      EXAMINE_D->query("log_by/" + user->query("id")))
        user->start_log();

    // notice user the user of this mud
    NEWS_D->prompt_user(user);

    if ((user->query("qi") < 0 || user->query("jing") < 0) && living(user))
        user->unconcious();
}

varargs void reconnect(object ob, object user, int silent)
{
    //int new_mail_n;
    object sob; // 检查身上物品，是否有作弊嫌疑
    int i;
    string *sobs = ({
          "xisui xiandan",
          "wuji xiandan",
          "tonghui xiandan",
          "zhuyuan xiandan",
          "wuhua guo",
    });

    user->set_temp("link_ob", ob);
    ob->set_temp("body_ob", user);
    exec(user, ob);

    user->reconnect();


    if( !silent && (! wizardp(user) || ! user->query("env/invisible"))) {
        tell_room(environment(user), user->query("name") + "重新连线回到这个世界。\n",
                 ({user}));
    }

    // 检查同盟情况
    "/cmds/usr/league"->main(this_player(), "check");

    for (i = 0; i < sizeof(sobs); i ++)
    {
        if (wizardp(this_player())) break;

        if (objectp (sob = present(sobs[i], this_player())) )
        {
            if (sob->query_amount() > 50)
                log_file("warning", this_player()->name() + "(" +
                      this_player()->query("id") + ") has more than" + " " +
                      sob->query_amount() + " " + sobs[i] + "\n");
            if (sob->query_amount() > 100)
            {
                log_file("logind_throw", this_player()->name() + " had been throwed by 连线精灵。\n");
                this_player()->get_into_prison(this_object(), 0, 144400);
                break;
            }
        }
    }

    tell_object(this_player(), HIG "\n今后请使用" HIY " wenxuan " HIG "命令查阅游戏的文章选集。\n\n");
    /*
    // 检查是否有新邮件未读
    new_mail_n = get_info(user->query("id"), "newmail", "", 0);

    if (new_mail_n)
        tell_object(this_player(), HIG"【炎黄邮件系统】：你有 "
                    HIY + new_mail_n + HIG " 封新邮件，请到邮件中心查阅！\n" NOR);
    */
    CHANNEL_D->do_channel( this_object(), "sys",
        sprintf("%s(%s)由[%s]重新连线进入。", user->query("name"),
        user->query("id"), query_ip_number(user)));
}

int check_legal_id(string id)
{
    int i;
    /*
    if (id == "all")
    {
        write(WHT "\n对不起，[" HIC "all" NOR + WHT "]这个词有着特"
              "殊的含意，不能用做英文名字。\n" NOR);
        return 0;
    }
    */
    if (member_array(id, banned_id) != -1)
    {
        write("对不起，" HIC"“" + id + "”" NOR"这个词有着特"
            "殊的含意，不能用做英文名字。\n");
        return 0;
    }

    i = strlen(id);

    if ((strlen(id) < 3) || (strlen(id) > 10))
    {
        write(WHT "\n对不起，你的英文名字必须是" HIY " 3 " NOR +
              WHT "到" HIY " 10 " NOR + WHT "个英文字母。\n" NOR);
        return 0;
    }

    while (i--)
    {
        if (id[i] < 'a' || id[i] > 'z' )
        {
            write(WHT "\n对不起，你的英文名字只能用英文字母。\n" NOR);
            return 0;
        }
    }

    return 1;
}

int check_legal_name(string name, int maxlen)
{
    int i;

    i = strlen(name);

    if (! is_chinese(name))
    {
        write(WHT "对不起，请您用「" HIY "中文" NOR + WHT
                  "」取名字。\n" NOR);
        return 0;
    }

    if ((strlen(name) < 2) || (strlen(name) > maxlen))
    {
        write(WHT "对不起，你的中文姓名不能太长。\n" NOR);
        return 0;
    }

    if (member_array(name, banned_name) % 2 == 0)
    {
        write(WHT "对不起，这种姓名会造成其他人的困扰。\n" NOR);
        return 0;
    }

    return 1;
}

object find_body(string name)
{
    return find_player(name);
}

int set_wizlock(int level)
{
    if (wiz_level(this_player(1)) <= level)
        return 0;

    if (geteuid(previous_object()) != ROOT_UID)
        return 0;

    wiz_lock_level = level;
    return 1;
}

int can_login(int level)
{
    if (level < wiz_lock_level)
        return 0;

    return 1;
}

int howmuch_money(object ob)
{
    int total;
    int total2;
    object gold, silver, coin;

    total = 0;
    total2 = 0;

    gold = present("gold_money",ob);
    silver = present("silver_money",ob);
    coin = present("coin_money",ob);

    if( gold ) total += gold->value();
    if( silver ) total += silver->value();
    if( coin ) total += coin->value();

    total2 = (int)ob->query("balance");
    if (!total2 || total2 < 0) {
        ob->set("balance", 0);
    }
    total=total+total2;
    return total;
}
