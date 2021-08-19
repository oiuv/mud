// logind.c

#include <ansi.h>
#include <command.h>
#include <login.h>
// #include <config.h>
#include <getconfig.h>

inherit F_DBASE;

string *banned_name = ({
    "你",
    "我",
    "他",
    "她",
    "它",
    "爸",
    "爷",
    "妈",
    "奶",
    "屎",
    "尿",
    "粪",
    "　",
});

string *banned_id = ({
    "admin",
    "all",
    "arch",
    "cancel",
    "exit",
    "guest",
    "name",
    "new",
    "none",
    "quit",
    "reg",
    "user",
    "wizard",
});

nosave mapping born = ([
    "扬州人氏":"/d/city/kedian",
    "欧阳世家":([
        "born":"西域人氏",
        "surname":"欧阳",
        "startroom":"/d/baituo/dating",
    ]),
    "关外胡家":([
        "born":"关外人氏",
        "surname":"胡",
        "startroom":"/d/guanwai/xiaowu",
    ]),
    "中原苗家":([
        "born":"中原人氏",
        "surname":"苗",
        "startroom":"/d/zhongzhou/miaojia_houting",
    ]),
    "段氏皇族":([
        "born":"大理人氏",
        "surname":"段",
        "startroom":"/d/dali/wangfugate",
    ]),
    "慕容世家":([
        "born":"江南人氏",
        "surname":"慕容",
        "startroom":"/d/yanziwu/cuixia",
    ]),
]);

// 内部调用的函数
private void check_ok(object ob);
private void login(string arg, object ob);
private void register(object ob, string id, string pass);
private void reg_info(string info, object ob);
private void init_new_player(object user);

// 可以被外部调用的函数
object  make_body(object ob);
varargs void enter_world(object ob, object user, int silent);
varargs void reconnect(object ob, object user, int silent);
nomask int matches_password(string str, string password);
int check_legal_id(string id);
int check_legal_name(string arg);

void create()
{
    seteuid(ROOT_UID);
    set("channel_id", "连线精灵");
    set("name", HIW "连线精灵" HIM);
}

void logon(object ob)
{
    if (BAN_D->is_banned(query_ip_number(ob)) == 1)
    {
        write("@#403@你的地址在本 MUD 不受欢迎。@\n");
        destruct(ob);
        return;
    }

    // write("@#200@请输入(账号 密码)登录游戏或输入(reg 账号 密码)注册账号：@\n");
    write("{\"code\":200,\"data\":{\"msg\":\"请输入(账号 密码)登录游戏或输入(reg 账号 密码)注册账号\"}}@@\n");
    input_to("login", ob);
}

nomask int matches_password(string str, string password)
{
    if (password[0..2] == "$6$")
        return crypt(str, password) == password;
    else
        return oldcrypt(str, password) == password || crypt(str, password) == password;
}

private void login(string arg, object ob)
{
    string *info, id, pass;

    info = explode(trim(arg), " ");

    if (sizeof(info) < 2)
    {
        write("{\"code\":206,\"data\":{\"msg\":\"输入错误。\"}}@@\n");
        input_to("login", ob);
        return;
    }
    else
    {
        id = lower_case(info[0]);
        pass = info[1];
    }

    if (id == "reg" && sizeof(info) == 3 )
    {
        // 注册账号
        register(ob, info[1], info[2]);
        return;
    }

    if ((string)ob->set("id", id) != id)
    {
        write("@#404@Failed setting user name.@\n");
        destruct(ob);
        return;
    }

    if (file_size(ob->query_save_file() + __SAVE_EXTENSION__) >= 0)
    {
        if (ob->restore())
        {
            string my_pass = ob->query("password");
            if (!matches_password(pass, my_pass))
            {
                write("{\"code\":202,\"data\":{\"msg\":\"密码错误！\"}}@@\n");
                input_to("login", ob);
                return;
            }

            check_ok(ob);
            return;
        }
        write("@#406@您的人物储存档出了一些问题，请利用 guest 人物通知巫师处理。@\n");
        destruct(ob);
        return;
    }
    write("{\"code\":203,\"data\":{\"msg\":\"未注册账号，请输入(reg 账号 密码)注册。\"}}@@\n");
    input_to("login", ob);
    // destruct(ob);
}

private void check_ok(object ob)
{
    object user;

    // Check if we are already playing.
    user = find_player(ob->query("id"));
    if (user)
    {
        if (!user->is_net_dead())
        {
            object old_link;
            old_link = user->query_temp("link_ob");
            tell_object(user, "{\"code\":206,\"data\":{\"msg\":\"有人从别处( " + query_ip_number(ob) + " )连线取代你所控制的人物。\"}}@@\n");
            if (old_link)
            {
                exec(old_link, user);
                destruct(old_link);
            }
        }
        reconnect(ob, user);
        return;
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

            user->set_temp("logon_time", time());
            if (err = catch(enter_world(ob, user)))
            {
                user->set_temp("error", err);
                msg = HIR "\n进入这个世界时出了一些问题，需要和巫师联系处理。\n\n" NOR;
                if (mapp(err))
                    msg += MASTER_OB->standard_trace(err, 1);
                user->set_temp("error_message", msg);
                tell_object(user, "@#500@" + msg + "@\n");
            }
            return;
        }
        else
        {
            destruct(user);
            write("{\"code\":202,\"data\":{\"msg\":\"创建你的角色。\"}}@@\n");
            input_to("reg_info", ob);
        }
    }
    else
        write("@#503@无法创建角色，你可以尝试重新登录或和巫师联系。@\n" NOR);
}

object make_body(object ob)
{
    object user;

    if (! is_root(previous_object()))
    {
        log_file("static/security",
        sprintf("%s try to create player(%s) on %s.\n",
               (string)geteuid(previous_object()),
               (string)ob->query("id"),
               ctime(time())));
        write("@#403@你没有权限创建玩家。@\n");
        return 0;
    }

    user = new(USER_OB);
    if (! user)
    {
        write("@#400@现在可能有人正在修改使用者物件的程式，无法进行复制。@\n");
        return 0;
    }
    // 设置玩家对象ID
    seteuid(ob->query("id"));
    export_uid(user);
    export_uid(ob);
    seteuid(getuid());

    user->set("id", ob->query("id"));
    user->set("surname", ob->query("surname"));
    user->set("purename", ob->query("purename"));
    user->set_name( 0, ({ ob->query("id")}) );
    return user;
}

varargs void enter_world(object ob, object user, int silent)
{
    object cloth, shoe;
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

    if (interactive(ob)) exec(user, ob);

    // write("目前权限：" + wizhood(user) + "\n");
    write("{\"code\":2000,\"data\":{\"msg\":\"你连线进入" + LOCAL_MUD_NAME() + "。\"}}@@\n");
    user->setup();
    if (user->query("age") == 14)
    {
        user->set("food", user->max_food_capacity());
        user->set("water", user->max_water_capacity());
    }

    // In case of new player, we save them here right aftre setup
    // compeleted.
    user->set("last_save", time());
    user->save();
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
    }
    else
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

    if (cloth && (! environment(cloth) || ! cloth->query("equipped")))
        destruct(cloth);

    if (shoe && (! environment(shoe) || ! shoe->query("equipped")))
        destruct(shoe);

    if (! silent)
    {
        // color_cat(MOTD);

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

    if (ob->query("registered"))
    {
        if (!(ob->query("login_times")))
        {
            write(NOR "欢迎回到" + LOCAL_MUD_NAME() + "。\n");
            // show rules
            color_cat(UNREG_MOTD);
            ob->set("login_times", 1);
            // MYSQL_D->register(ob);
        }
        else
        {
            ob->add("login_times", 1);
            write(NOR "你是第 " + ob->query("login_times") + " 次光临" + LOCAL_MUD_NAME() + "。\n");
            write("你上次是 " + HIG + ctime(ob->query("last_on")) + NOR + " 从 " + HIR +
                    ob->query("last_from") + NOR + " 连接的。\n");
        }
    }

    // 检查同盟情况
    // "/cmds/usr/league"->main(this_player(), "check");
    // 向客户端发送玩家状态
    // HP_CMD->main(this_player());

    for (i = 0; i < sizeof(sobs); i ++)
    {
        if (wizardp(this_player())) break;

        if (objectp (sob = present(sobs[i], this_player())) )
        {
            if (sob->query_amount() > 99)
                log_file("warning", this_player()->name() + "(" +
                      this_player()->query("id") + ") has more than" + " " +
                      sob->query_amount() + " "+ sobs[i] + "\n");

            if (sob->query_amount() > 999)
            {
                log_file("logind_throw", this_player()->name() + " had been throwed by 连线精灵。\n");
                this_player()->get_into_prison(this_object(), 0, 144400);
                break;
            }
        }
    }

    CHANNEL_D->do_channel(this_object(), "sys",
    sprintf("%s(%s)由[%s]连线进入。",
            user->name(), user->query("id"),
            (ipname = query_ip_number(user)) ? ipname : "未知地点"));

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
    // HP_CMD->main(this_player());

    if( !silent && (! wizardp(user) || ! user->query("env/invisible"))) {
        tell_room(environment(user), user->query("name") + "重新连线回到这个世界。\n",
                 ({user}));
    }

    // 检查同盟情况
    // "/cmds/usr/league"->main(this_player(), "check");

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

    CHANNEL_D->do_channel( this_object(), "sys",
        sprintf("%s(%s)由[%s]重新连线进入。", user->query("name"),
        user->query("id"), query_ip_number(user)));
}

private void register(object ob, string id, string pass)
{
    if (!check_legal_id(id))
    {
        input_to("login", ob);
        return;
    }
    if ((string)ob->set("id", id) != id)
    {
        write("@#201@Failed setting user name.@\n");
        destruct(ob);
        return;
    }
    if (sizeof(pass) < 5)
    {
        write("{\"code\":201,\"data\":{\"msg\":\"密码长度不得少于5个字符。\"}}@@\n");
        input_to("login", ob);
        return;
    }
    if (file_size(ob->query_save_file() + __SAVE_EXTENSION__) >= 0)
    {
        write("{\"code\":201,\"data\":{\"msg\":\"此账号已被注册。\"}}@@\n");
        input_to("login", ob);
        return;
    }

    ob->set("password", crypt(pass, 0));
    ob->save();
    write("{\"code\":200,\"data\":{\"msg\":\"账号注册成功!请输入(账号 密码)登录游戏。\"}}@@\n");
    input_to("login", ob);
}

private void reg_info(string info, object ob)
{
    object user;
    string name, surname, purename, gender, character, result, gift, tmpborn;
    int tmpstr, tmpint, tmpcon, tmpdex;
    int size;
    mixed dest;
    string *data = explode(info, "|");

    if (sizeof(data) != 5)
    {
        write("@#202@角色资料格式错误，正确格式为：姓名|性别|性格|属性|出生地@\n");
        input_to("reg_info", ob);
        return;
    }

    name = data[0];
    gender = data[1];
    character = data[2];
    gift = data[3];
    tmpborn = data[4];

    if (!check_legal_name(name))
    {
        input_to("reg_info", ob);
        return;
    }
    if (stringp(result = NAME_D->invalid_new_name(name)))
    {
        write("@#201@对不起，" + result + "@\n");
        input_to("reg_info", ob);
        return;
    }
    if (member_array(gender, ({"男性", "女性"})) < 0)
    {
        write("@#201@对不起，性别只能为男性或女性@\n");
        input_to("reg_info", ob);
        return;
    }
    if (member_array(character, ({"光明磊落", "狡黠多变", "心狠手辣", "阴险奸诈"})) < 0)
    {
        write("@#201@对不起，性格只能为光明磊落、狡黠多变、心狠手辣或阴险奸诈。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (!gift || sscanf(gift, "%d %d %d %d", tmpstr, tmpint, tmpcon, tmpdex) != 4)
    {
        write("@#201@对不起，属性格式为 <膂力> <悟性> <根骨> <身法>@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpstr > 30)
    {
        write("@#201@你所选择的膂力参数不能大于30。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpstr < 10)
    {
        write("@#201@你所选择的膂力参数不能小于10。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpint > 30)
    {
        write("@#201@你所选择的悟性参数不能大于30。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpint < 10)
    {
        write("@#201@你所选择的悟性参数不能小于10。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpcon > 30)
    {
        write("@#201@你所选择的根骨参数不能大于30。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpcon < 10)
    {
        write("@#201@你所选择的根骨参数不能小于10。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpdex > 30)
    {
        write("@#201@你所选择的身法参数不能大于30。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (tmpdex < 10)
    {
        write("@#201@你所选择的身法参数不能小于10。@\n");
        input_to("reg_info", ob);
        return;
    }
    if ((tmpstr + tmpint + tmpcon + tmpdex) != 80)
    {
        write("@#201@你所选择的属性总和必须为80。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (!tmpborn || (!stringp(dest = born[tmpborn]) && !mapp(dest)))
    {
        write("@#201@出生地只能为扬州人氏、中原苗家、关外胡家、欧阳世家、慕容世家或段氏皇族。@\n");
        input_to("reg_info", ob);
        return;
    }
    if (mapp(dest) && stringp(dest["notice"]))
    {
        write("@#201@" + dest["notice"] + "@\n");
        input_to("reg_info", ob);
        return;
    }

    // 设置姓名
    size = sizeof(name);
    switch (size)
    {
    case 2:
        surname = name[0..0];
        purename = name[1..1];
        break;
    case 3:
        surname = name[0..0];
        purename = name[1..2];
        break;
    default:
        surname = name[0..1];
        purename = name[2..3];
        break;
    }
    // 最原始的姓名
    ob->set("surname", surname);
    ob->set("purename", purename);
    ob->set("body", USER_OB);
    if (!objectp(user = make_body(ob)))
    {
        write("@#500@你无法登录这个新的人物，请重新选择。@\n" NOR);
        destruct(ob);
        return;
    }
    // 玩家出生地
    if (stringp(dest))
    {
        user->set("startroom", dest);
        user->set("born", tmpborn);
        user->set("born_family", "没有");
    }
    else
    {
        user->set("startroom", dest["startroom"]);
        user->set("born", dest["born"]);
        user->set("born_family", tmpborn);

        if (user->query("surname") != dest["surname"])
        {
            // 名字需要变化
            name = dest["surname"] + user->query("purename");
            if (stringp(result = NAME_D->invalid_new_name(name)))
            {
                write("@#201@对不起，" + result + "@\n");
                input_to("reg_info", ob);
                return;
            }
            user->set("surname", dest["surname"]);
            user->set_name();
        }
    }
    // 玩家属性
    user->set("str", tmpstr);
    user->set("dex", tmpdex);
    user->set("con", tmpcon);
    user->set("int", tmpint);
    user->set("kar", 5 + random(26));
    user->set("per", 5 + random(26));
    user->set("character", character);
    user->set("gender", gender);

    init_new_player(user);
    enter_world(ob, user);
}

private void init_new_player(object user)
{
    // 初始化必要属性
    user->set("title", "普通百姓");
    user->set("birthday", time());
    user->set("mud_age", 0);
    user->set("age", 14);
    user->set("potential", 99);
    user->set("food", (user->query("str") + 10) * 10);
    user->set("water", (user->query("str") + 10) * 10);
    user->set("channels", ({"chat", "rumor", "party",
                            "bill", "sing", "family", "rultra"}));
    // 记录名字
    NAME_D->map_name(user->query("name"), user->query("id"));
    // 设置必要的环境参数
    user->set("env/auto_regenerate", 1);
    user->set("env/auto_get", 1);
    user->set("env/wimpy", 60);
    user->set("env/no_autoultra", 1);
    // 选择特殊技能
    UPDATE_D->born_player(user);
}

int check_legal_id(string id)
{
    int i;
    if (member_array(id, banned_id) != -1)
    {
        write("@#201@对不起，这个词有着特殊的含意，不能用做英文名字。@\n");
        return 0;
    }

    i = strlen(id);

    if ((i < 3) || (i > 10))
    {
        write("@#201@对不起，你的英文名字必须是 3 到 10 个英文字母。@\n");
        return 0;
    }

    if (!is_legal_id(id))
    {
        write("@#201@对不起，你的英文名字只能用英文字母。@\n" );
        return 0;
    }

    return 1;
}

int check_legal_name(string name)
{
    int i;

    i = strlen(name);

    if (!is_chinese(name))
    {
        write("@#201@对不起，请您用「中文」取名字。@\n");
        return 0;
    }

    if ((i < 2) || (i > 4))
    {
        write("@#201@对不起，中文名字只能为2~4个汉字。@\n");
        return 0;
    }

    if (member_array(name, banned_name) % 2 == 0)
    {
        write("@#201#对不起，这种姓名会造成其他人的困扰。@\n");
        return 0;
    }

    return 1;
}
