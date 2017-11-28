// zhangfang.c

#include <ansi.h>

inherit NPC;
int  chu_hai();

void create()
{
        set_name("账房老夫子", ({ "lao zhangfang","zhangfang","lao" }));
        set("gender", "男性");
        set("age", 56);
        set("long",
        "这是一个见钱眼开的老账房。饱经风霜的脸上透出一丝狡猾。\n", );

        set("combat_exp", 10000);
        set("shen_type", 1);

        set("eff_qi",2000);
        set("qi",2000);
        set("max_neili", 1000);
        set("neili", 1000);
        set("jiali", 100);

        set_skill("force", 200);
        set_skill("unarmed", 400);
        set_skill("dodge", 200);
        set_skill("parry", 200);
        set("inquiry", ([
            "学费"  : "五两银子！\n",
            "学习"  : "先交五两银子！\n",
            "练功"  : "先交五两银子！\n",
            "学武"  : "先交五两银子！\n",
            "学武功": "先交五两银子！\n",
            "高价钱" : "至少得五百两黄金！\n",
        ]) );

        setup();
    carry_object("/clone/misc/cloth")->wear();
}

int accept_object(object who, object ob)
{
    if (who->query("combat_exp") >= 150000
        && !who->query_temp("can_paid"))
    {
        message_vision("老账房望着$N说：你的武功应该历练江湖才能再长进，不"
                       "能埋没在这里了。\n", who);

        write("老账房悄悄对你说道：“但是如果你肯出" HIY "高价钱" NOR"，也"
              "不是不可以！”\n");
 
        who->set_temp("can_paid", 1);

    return 0;
    }
    if (ob->query("money_id") && ob->value() >= 500
        && !who->query_temp("can_paid"))
    {
        who->set_temp("marks/jinniu_paied",1);
        message_vision("老账房对$N说：好！既然这位" + RANK_D->query_respect(who) 
          + "如此上进，那就进去找师傅学吧！\n" , who);
        return 1;
    }
    else 
    if (who->query_temp("can_paid") 
        && ob->query("money_id") && ob->value() >= 5000000)
    {
        who->set_temp("marks/jinniu_paied",1);
        write("老帐房对你悄悄说道：“快去吧，可别说你认识我！”\n");
        return 1;
    }
    else  
        message_vision("老账房皱眉对$N说：您给的也太少了点儿吧？\n", who);
    return 0;
}
