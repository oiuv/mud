/**
 * @file LiSouci.c
 * @author 雪风 (雪风@mud.ren)
 * @brief 这是使用curl外部指令的功能测试案例：猜字迷(https://www.jisuapi.com/api/miyu/)
 * @version 0.1
 * @date 2022-08-24
 *
 * @copyright Copyright (c) 2022
 *
 */
#include <ansi.h>

inherit CORE_CMD;
inherit NPC;

string Content, Answer;

void create()
{
    set_name("李瘦辞", ({"li souci", "li", "souci"}));
    set("long", "这是一位喜爱诗词和灯迷的姑娘，因才貌双绝惊艳于世，\n她清丽绝俗，风姿动人，有沉鱼落雁之容，避月羞花之貌！\n");
    set("title", HIM "如梦令" NOR);
    set("gender", "女性");

    set("age", 21);
    set("per", 30);
    setup();
    carry_object("/d/city/npc/obj/qunzi")->wear();
}

void init()
{
    object ob;

    ob = this_player();

    ::init();
    if (interactive(ob) && !is_fighting())
    {
        remove_call_out("greeting");
        call_out("greeting", 1, ob);
    }
    add_action("do_puzzle", "puzzle");
}

void greeting(object ob)
{
    if (!ob || environment(ob) != environment())
        return;
    switch (random(2))
    {
    case 0:
        say("李瘦辞巧笑倩兮的说道：这位" + RANK_D->query_respect(ob) + "，来挑战一下猜迷(指令：puzzle)吧，猜对有奖。\n");
        break;
    case 1:
        say("李瘦辞甜甜的说道：这位" + RANK_D->query_respect(ob) + "，要来猜灯迷(指令：puzzle)吗？猜对有奖哦。\n");
        break;
    }
}

int do_puzzle(string arg)
{
    int curl = env("CMD_CURL");
    string appKey = env("AppKey");
    string url = "https://api.jisuapi.com/miyu/search?appkey=" + appKey + "&classid=1";
    object me = this_object(), you = this_player();
    if (!curl || !appKey)
    {
        return notify_fail("迷题还在整理中，请耐心等待开启哦。\n");
    }

    if (!arg)
    {
        if (!Content)
        {
            external_cmd(curl, ({"-s", url}));
        }
        else
        {
            tell_room(environment(), HIC "题目：" + Content + "，请用指令 puzzle <答案> 回答。\n" NOR);
        }
    }
    else if (!Answer)
    {
        msg("warning", "$ME对$YOU说到：现在还没有出题呢。\n", me, you);
    }
    else
    {
        msg("info", "$ME回答到：" + arg + "\n", you);
        if (arg == Answer)
        {
            msg("success", "$ME对$YOU说到：恭喜你，答对啦。\n", me, you);
            Content = 0; Answer = 0; // 重新初始化
            GIFT_D->delay_bonus(you, ([
                "exp":1000 + random(100),
                "pot":300 + random(30),
                "score":100 + random(10),
                "prompt":"通过猜字迷游戏",
            ]));
        }
        else
        {
            msg("error", "$ME对$YOU说到：答错啦，请再想想吧。\n", me, you);
        }
    }

    return 1;
}

protected void response(string result)
{
    mapping data = json_decode(result);
    if (data["status"])
    {
        command("say 每天只出一百题字迷，请明天再来吧");
        // debug(data["msg"]);
        return;
    }
    Content = data["result"]["list"][0]["content"];
    Answer = data["result"]["list"][0]["answer"];
    // todo 把猜谜内容缓存到本地数据库
    // debug(Answer);
    tell_room(environment(), HIY "题目：" + Content + "，请用指令 puzzle <答案> 回答。\n" NOR);
}
