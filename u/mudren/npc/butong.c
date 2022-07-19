// 老玩家周不同的NPC角色
#include <ansi.h>
#include <localtime.h>

inherit NPC;
inherit F_NOCLONE;

nosave int money = 100000; // 黄金十两

void create()
{
    seteuid(getuid());
    set_name("周不通", ({"zhou butong", "zhou", "butong"}));
    set("title", HIY "江湖游侠" NOR);
    set("nickname", HIG "玩家导师" NOR);
    set("gender", "男性");
    set("age", 30);
    set("long", @LONG
－－－－－－－－－－－－－－－－－－－－－－－－－－－－
这是炎黄老玩家周不通，他生得腰圆背厚，面阔口方，骨格不凡。
因为坚持不懈的游戏，最终化身NPC，永久留在了游戏中。
做为热心好玩家，化身NPC的他，也拥有了智能机器人小i的特殊
能力，玩家可以在聊天时 @butong 和他对话，他上知天文地理，
下知世间百态，还能做到很多神奇的事情。比如：
    chat @butong 唐诗宋词
    chat @butong 北京天气
    chat @butong 成语接龙
    chat @butong 心理测试
    chat @butong 翻译test
    ……
缺钱的新玩家每天可以找他要『福利』，老玩家也可以捐钱给他
用来帮助其他有需要的人。
－－－－－－－－－－－－－－－－－－－－－－－－－－－－
LONG);
    set("attitude", "heroism");

    set("str", 21);
    set("con", 30);
    set("int", 27);
    set("dex", 23);

    set("max_qi", 18000);
    set("max_jing", 3600);
    set("neili", 20000);
    set("max_neili", 20000);
    set("jiali", 500);
    set("env/wimpy", 60);

    set_temp("apply/attack", 100);
    set_temp("apply/defense", 200);

    set("combat_exp", 48000000);

    set_skill("force", 300);
    set_skill("unarmed", 300);
    set_skill("sword", 300);
    set_skill("dodge", 300);
    set_skill("parry", 300);
    set_skill("taiji-quan", 300);
    set_skill("taiji-jian", 300);
    set_skill("taiji-shengong", 300);
    set_skill("tiyunzong", 300);

    map_skill("force", "taiji-shengong");
    map_skill("unarmed", "taiji-quan");
    map_skill("parry", "taiji-quan");
    map_skill("sword", "taiji-jian");
    map_skill("dodge", "tiyunzong");

    // set("chat_chance", 5);
    // set("chat_msg", ({(: random_move :)}));

    setup();
    set("startroom", "/d/city/kedian");
    check_clone();
}

// 监听玩家聊天并做处理
void receive_report(object user, string verb, string arg)
{
    if (sscanf(arg, "@butong %s", arg) == 1)
    {
        call_out("iqa", 1, user, verb, arg);
    }
}

void iqa(object ob, string verb, string arg)
{
    command(verb + " 『系统升级，服务暂停』");
    // "/adm/daemons/iqa_d"->main(this_object(), arg);
}

// 接受玩家物品
int accept_object(object who, object ob)
{
    if (ob->is_money())
    {
        // debug_message("ob = " + ob);
        add("balance", ob->query("base_value") * ob->query_amount());
        return 1;
    }
}

// 接受玩家咨询
mixed accept_ask(object who, string topic)
{
    int wday, day, month, year, *date;
    string mark;

    date = localtime(time());
    year = date[LT_YEAR];
    month = date[LT_MON] + 1;
    day = date[LT_MDAY];
    wday = date[LT_WDAY];
    mark = "mark/money/" + year + "/" + month;

    if (topic == "福利")
    {
        if (who->query(mark) == day)
        {
            return "一人一天只能领取一次福利，你真没钱的话，单独找我老板要吧。";
        }

        if (query("balance") >= money)
        {
            if (who->query("id") == "butong")
            {
                command("say " + "那个……老板您也穷啦？我把我身上的钱全转给您吧");
                who->add("balance", query("balance"));
                set("balance", 0);
            }
            else
            {
                who->add("balance", money);
                who->set(mark, day);
                add("balance", -money);
                command("rich");
                command("tell " + who->query("id") + " " + "好了，我向你的账户转了" + MONEY_D->money_str(money) + "。");
            }
            return 1;
        }
        else
        {
            return "地主家也没有余粮啊，我的存款不够转账啦！";
        }
    }

    return 0;
}

void init()
{
    object ob;

    if (interactive(ob = this_player()) && !is_fighting())
    {
        remove_call_out("greeting");
        call_out("greeting", 1, ob);
    }
}

int greeting(object ob)
{
    if (query("balance") >= money)
    {
        if (ob->query("id") == "butong")
            command("say " + "老板好，我现在发福利的存款还有" + MONEY_D->money_str(query("balance")) + "。");
        else
            command("rich " + ob->query("id"));
    }
    else
    {
        command("stingy");
    }
    if (QUEST_D->hasQuest(ob, this_object()))
    {
        command("tell " + ob->query("id") + " 我这里有适合你的任务，可以 ask butong about quest 了解详情。");
    }

}
