// zhangsan.c

#include <ansi.h>

inherit NPC;
int give_ling();

void create()
{
        set_name("张三", ({ "zhang san", "zhang", "san" }));
        set("title", HIY "侠客岛赏善使者" NOR);
        set("gender", "男性");
        set("age", 37);
        set("long",
              "这是个看起来三十来岁的汉子，身材肥胖，脸色红润。\n"
        );

        set("str", 36);
        set("int", 35);
        set("con", 34);
        set("dex", 37);

        set_temp("apply/attack", 600);
        set_temp("apply/armor", 1500);
        set_temp("apply/damage", 800);
        set_temp("apply/unarmed_damage", 800);
        set_temp("apply/dodge", 600);
        set_temp("apply/parry", 600);

        set("qi", 9000);
        set("max_qi", 9000);
        set("jing", 20000);
        set("max_jing", 20000);
        set("neili", 15000);
        set("max_neili", 15000);
        set("jiali", 250);
        set("combat_exp", 5000000);
        set("score", 20000000);

        set_skill("force", 340);
        set_skill("taixuan-gong", 340);
        set_skill("dodge", 340);
        set_skill("taixuan-gong", 340);
        set_skill("unarmed", 340);
        set_skill("taixuan-gong", 340);
        set_skill("parry", 340);

        map_skill("force", "taixuan-gong");
        map_skill("dodge", "taixuan-gong");
        map_skill("unarmed", "taixuan-gong");
        map_skill("parry", "taixuan-gong");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: perform_action, "unarmed.xuan" :),
                (: perform_action, "unarmed.hun" :),
        }) );
        create_family("侠客岛", 0, "赏善使者");
        set("inquiry",  ([
            "赏善罚恶令" : (: give_ling :),
            "腊八粥"     : "拿了赏善罚恶令，上侠客岛就可以喝腊八粥，你也想去？\n",
        ]));

        set("lingpai", 3);

        setup();

        carry_object("/clone/misc/cloth")->wear();
}


void unconcious()
{
        die();
}

int give_ling()
{
//      object ling;
        object me;

        me = this_player();
      
        if (me->query("shen") < -100000)
        {
             command("heng");
             command("say 尔等邪魔歪道，我正欲相除，你却反找上门来了！\n");
             kill_ob(me);
             return 1;
        }
        
        if (me->query_skill("force", 1) < 200)
        {
             command("say 阁下内功不济，这腊八粥你还是喝不得！\n");
             return 1;
        }  

        if (me->query("weiwang") < 100000)
        {
             command("say 阁下非江湖成名人士，还是请回吧！");
             return 1;
        }
       
        if (me->query_skill("martial-cognize", 1) < 200)
        {
             command("say 阁下武学修养实在有限，这腊八粥你还是不喝为好！\n");
             return 1;
        }  
       
        if (present("shangfa ling", me))
        {
             command("heng");
             command("say 阁下也太贪心了吧！");
             return 1;
        }

        if (query("lingpai") < 1)
        {
             command("shake"); 
             command("say 我手头上的赏善罚恶令已经全送出去了。");
             return 1;
        }
        command("nod");
        command("say 拿去吧，记得上侠客岛喝腊八粥！");

        "/clone/lonely/shangfaling"->move(me);
        return 1;
}

void reset()
{
        set("lingpai", 3);
}



