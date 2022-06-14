#include <ansi.h>
#include <socket.h>
#include <socket_err.h>

inherit NPC;

nosave mapping status = ([]);
nosave object receiver;

void create()
{
    seteuid(getuid());
    set_name("神算子", ({"shen suan", "shen", "suan", "shensuan"}));
    set("title", HIY "天机道人" NOR);
    set("gender", "男性");
    set("age", 50);
    set("long", "一位邋邋遢遢的道士，自称可占卜(zhanbu)号码吉凶，每天仅算十卦。\n");
    set("attitude", "heroism");
    set("class", "taoist");

    set("str", 21);
    set("con", 30);
    set("int", 27);
    set("dex", 23);

    set("max_qi", 600);
    set("max_jing", 300);
    set("neili", 600);
    set("max_neili", 600);
    set("jiali", 30);
    set("env/wimpy", 60);

    set_temp("apply/attack", 10);
    set_temp("apply/defense", 20);

    set("combat_exp", 25000);

    set_skill("force", 43);
    set_skill("unarmed", 51);
    set_skill("sword", 37);
    set_skill("dodge", 59);
    set_skill("parry", 40);
    set_skill("taiji-quan", 42);
    set_skill("taiji-jian", 41);
    set_skill("taiji-shengong", 40);
    set_skill("tiyunzong", 53);

    map_skill("force", "taiji-shengong");
    map_skill("unarmed", "taiji-quan");
    map_skill("parry", "taiji-quan");
    map_skill("sword", "taiji-jian");
    map_skill("dodge", "tiyunzong");

    create_family("武当派", 3, "弟子");

    // set("chat_chance", 5);
    // set("chat_msg", ({(: random_move :)}));

    setup();
}

void init()
{
    object ob;

    add_action("do_zhanbu", "zhanbu");

    if (interactive(ob = this_player()) && !is_fighting())
    {
        remove_call_out("greeting");
        call_out("greeting", 1, ob);
    }
}

void greeting(object ob)
{
    if (!ob || environment(ob) != environment())
        return;

    say(CYN "神算子笑咪咪地说道：这位" + RANK_D->query_respect(ob) +
        CYN "要算卦吗？贫道只测(zhanbu)号码吉凶，每日十卦。\n" NOR);
}

int do_zhanbu(string arg)
{
    int fd;
    int ret;
    int number;
    string host = "api.avatardata.cn";
    string addr = "121.42.196.237 80";
    string key = "3d0d2c19aa164b75b544dc94e3deb0d2";
    string path;

    receiver = this_player();

    if (number = atoi(arg))
    {
        path = "/JiXiong/LookUp?key=" + key + "&keyword=" + number;
        msg("info", "$ME拿出纸条写了一串数字给神算子。\n", receiver);
        msg("info", "神算子接过纸条看了看，摆出龟甲为$ME占卜号码吉凶。\n", receiver);
    }
    else
    {
        msg("info", "神算子对$ME说到：贫道只占卜号码吉凶，请报数字给我，最好是和你生活息息相关的号码。\n", receiver);
    }

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["host"] = host;
    status[fd]["path"] = path;
    status[fd]["keyword"] = number;

    ret = socket_connect(fd, addr, "receive_data", "write_data");
    if (ret != EESUCCESS)
    {
        tell_object(receiver, "天机不清，神算子什么也没占卜出来。\n");
        socket_close(fd);
    }

    return 1;
}

void write_data(int fd)
{
    socket_write(fd, "GET " + status[fd]["path"] + " HTTP/1.0\nHost: " + status[fd]["host"] + "\n\r\n\r");
}

void receive_data(int fd, mixed result)
{
    result = result[strsrch(result, "{")..];
    // debug_message(sprintf("%d || %O", strlen(result), result));
    result = json_decode(result);
    if (result["error_code"])
    {
        tell_object(receiver, "也不知道是不是今日占卜过多，神算子默默的看着你不言不语。\n");
    }
    else
    {
        string str;
        result = result["result"];
        str = "号码 " + status[fd]["keyword"] + " 的占卜结果：\n";
        str += "----------------------------------------\n";
        str += HIC "运势：" + result["yunshi"] + NOR + "\n";
        str += HIM "数理：" + result["shuli"] + NOR + "\n";
        str += HIY "含义：" + result["hanyi"] + NOR + "\n";
        str += HIW "简述：" + result["jianshu"] + NOR + "\n";
        str += HIW "详解：" + result["xiangjie"] + NOR + "\n";
        str += HIW "事业：" + result["jiye"] + NOR + "\n";
        str += HIW "家庭：" + result["jiating"] + NOR + "\n";
        str += HIW "健康：" + result["jiankang"] + NOR + "\n";
        str += "----------------------------------------\n";
        tell_object(receiver, str);
    }
}

void receive_callback(int fd, mixed result, string addr)
{
    // if (stringp(result))
    // {
    //     debug_message(sprintf("receive_callback(%d, %O, %s)\n", fd, result, addr));
    // }
}

void socket_shutdown(int fd)
{
    socket_close(fd);
}
