// 老玩家周不同的NPC角色
#include <ansi.h>
#include <localtime.h>

inherit NPC;
inherit F_NOCLONE;

int accept_talk(object me, string topic);

nosave int money = 100000;  // 黄金十两

void create() {
    seteuid(getuid());
    set_name("周不通", ({ "zhou butong", "zhou", "butong" }));
    set("title", HIY "江湖游侠" NOR);
    set("nickname", HIG "玩家导师" NOR);
    set("gender", "男性");
    set("age", 30);
    set("long", @LONG
－－－－－－－－－－－－－－－－－－－－－－－－－－－－
这是炎黄老玩家周不通，他生得腰圆背厚，面阔口方，骨格不凡。
因为坚持不懈的游戏，最终化身NPC，永久留在了游戏中。
做为热心好玩家，化身NPC后，上知天文地理，下知世间百态，
还能做到很多神奇的事情。比如：
    talk butong 武当派介绍
    talk butong 六脉神剑神功详细介绍
    talk butong 你的任何话题...
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
void receive_report(object user, string verb, string arg) {
    if (sscanf(arg, "@butong %s", arg) == 1) {
        call_out("iqa", 1, user, verb, arg);
    }
}

void iqa(object ob, string verb, string arg) {
    accept_talk(ob, arg);
}

// 接受玩家物品
int accept_object(object who, object ob) {
    if (ob->is_money()) {
        // debug_message("ob = " + ob);
        add("balance", ob->query("base_value") * ob->query_amount());
        return 1;
    }

    return QUEST_D->doReward(this_object(), who);
}

// 接受玩家咨询
mixed accept_ask(object who, string topic) {
    int wday, day, month, year, *date;
    string mark;

    date = localtime(time());
    year = date[LT_YEAR];
    month = date[LT_MON] + 1;
    day = date[LT_MDAY];
    wday = date[LT_WDAY];
    mark = "mark/money/" + year + "/" + month;

    if (topic == "福利") {
        if (who->query(mark) == day) {
            return "一人一天只能领取一次福利，你真没钱的话，单独找我老板要吧。";
        }

        if (query("balance") >= money) {
            if (who->query("id") == "butong") {
                command("say " + "那个……老板您也穷啦？我把我身上的钱全转给您吧");
                who->add("balance", query("balance"));
                set("balance", 0);
            } else {
                who->add("balance", money);
                who->set(mark, day);
                add("balance", -money);
                command("rich");
                command("tell " + who->query("id") + " " + "好了，我向你的账户转了" + MONEY_D->money_str(money) + "。");
            }
            return 1;
        } else {
            return "地主家也没有余粮啊，我的存款不够转账啦！";
        }
    }

    return 0;
}

void init() {
    object ob;

    if (interactive(ob = this_player()) && !is_fighting()) {
        remove_call_out("greeting");
        call_out("greeting", 1, ob);
    }
}

int greeting(object ob) {
    if (query("balance") >= money) {
        if (ob->query("id") == "butong")
            command("say " + "老板好，我现在发福利的存款还有" + MONEY_D->money_str(query("balance")) + "。");
        else
            command("rich " + ob->query("id"));
    } else {
        command("stingy");
    }
    if (QUEST_D->hasQuest(ob, this_object())) {
        command("tell " + ob->query("id") + " 你好呀，快来看看我（l butong）快来看看我😘");
        command("tell " + ob->query("id") + " 你好呀，我这里有适合你的任务😎");
        command("tell " + ob->query("id") + " 你可以 ask butong about quest 了解详情。");
        command("tell " + ob->query("id") + " 任务管理指令为quest2（help quest2）");
    }

}

// AI对话命令
int accept_talk(object me, string topic) {
    string npc_id = query("id");
    string player_id = me->query("id");
    string player_name = me->name();
    string context;

    if (!topic || topic == "") {
        topic = "你好";
    }

    // 构造简洁的上下文信息
    context = sprintf(
        "时间：%s | 地点：%s | 天气：%s\n"
        "玩家性别：%s | 玩家年龄：%s | 玩家门派：%s | 玩家师父：%s",
        NATURE_D->game_time(),
        environment(this_object())->query("short") || "未知",
        trim(remove_ansi(NATURE_D->outdoor_room_description())),
        me->query("gender") || "未知",
        me->query("age") ? sprintf("%d岁", me->query("age")) : "未知",
        me->query("family/family_name") || "无门派",
        me->query("family/master_name") || "无师父"
    );

    // 发送AI请求到中心化守护程序
    AI_CLIENT_D->send_chat_request(
        npc_id,
        player_id,
        player_name,
        topic,
        context
    );

    return 1;
}
