// duanyu.c 段誉

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("段誉", ({"duan yu", "duan", "yu"}));
        set("gender", "男性");
        set("title", "大理国王子");
        set("age", 22);
        set("long", "他是一个身穿青衫的年轻男子。脸孔略尖，有一股书生的呆气。\n");
        set("attitude", "peaceful");
        set("class", "royal");
        
        set("str", 21);
        set("int", 36);
        set("con", 32);
        set("dex", 29);

        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "段誉叹了口气道：唉，老爸这是怎么回事？\n" NOR,
        }));

        set("inquiry", ([
                "大理" : "大理是个好地方，山清水秀，风景宜人。\n",
                "王语嫣" : "唉，她心里只有她表哥，从来就没把我放在眼里。\n",
                "拜师" : "嗯……我的师傅是老子、孔子和庄子，他们的学问我还没学全呢。\n",
        ]));

        set("qi", 5000);
        set("max_qi", 5000);
        set("jing", 2500);
        set("max_jing", 2500);
        set("neili", 9000);
        set("max_neili", 9000);
        set("jiali", 150);

        set("combat_exp", 1500000);

        set_temp("apply/damage", 50);
        set_temp("apply/defense", 50);

        set_skill("force", 280);
        set_skill("beiming-shengong", 280);
        set_skill("finger", 280);
        set_skill("liumai-shenjian", 280);
        set_skill("dodge", 280);
        set_skill("lingbo-weibu", 280);
        set_skill("parry", 200);
        set_skill("chess", 200);
        set_skill("buddhism", 280);
        set_skill("literate", 280);
        set_skill("lamaism", 280);
        set_skill("jingluo-xue", 240);
        set_skill("martial-cognize", 200);

        map_skill("force", "beiming-shengong");
        map_skill("dodge", "lingbo-weibu");
        map_skill("parry", "liumai-shenjian");
        map_skill("finger", "liumai-shenjian");

        prepare_skill("finger", "liumai-shenjian");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "finger.six" :),
                (: perform_action, "finger.zhongheng" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/unarmed_damage", 150);

        setup();

        carry_object("/clone/misc/cloth")->wear();
}

void help_girl(object me)
{
        object wang;
        string msg;

        if (! living(this_object()))
                return;

        command("say 语嫣妹子，不要慌张，有我段誉在此！");

        switch (me->query("gender"))
        {
        case "男性":
                msg = "这位" + RANK_D->query_respect(me) +
                      "，你怎能如此狠心？这么动人的妹子你也下得了手？";
                break;
        case "女性":
                msg = "这位" + RANK_D->query_respect(me) +
                      "，你莫非妒忌人家美貌，所以下此毒手？";
                break;
        default:
                msg = "这位" + RANK_D->query_respect(me) +
                      "，我说你已然半男不女，怎么还打女孩子的主意？";
                break;
        }        
        command("say " + msg);

        if (wang = present("wang yuyan"))
        {
                if (living(wang))
                        message_vision(HIW "\n$N" HIW "连忙扶住$n" HIW "，背在身"
                                       "后。\n$n" HIW "道：段郎，我看他武功来历，"
                                       "帮你指点他的破绽。\n" NOR, this_object(), wang);
                else
                        message_vision(HIW "\n$N" HIW "一把搂住$n" HIW "，抱在怀"
                                       "中。\n" NOR, this_object(), wang);

                me->remove_enemy(wang);
                wang->move(this_object());
                remove_call_out("check_enemys");
                call_out("check_enemys", 1, wang);
        }

        kill_ob(me);
}


int accept_fight(object me)
{
        command("say 哎呀呀，有话好好说，不要就动手嘛。");
        return 0;
}

int accept_hit(object me)
{
        command("say 你这人怎么回事？怎么突然就动手打人呢？。");
        return 1;
}

int accept_kill(object me)
{
        command("say 反了反了，这年头还有王法没有？");
        return 1;
}

void unconcious()
{
        object wang;

        command("say 语嫣妹子……");

        if (wang = present("wang yuyan", this_object()))
        {
                wang->move(environment());
                message_vision(HIW "\n$N" HIW "从$n" HIW "身上跌了下来，大惊"
                               "失色，道：段郎，段郎！你怎么了啦？\n" NOR, wang,
                               this_object());
        }

        ::unconcious();
}

void die()
{
        object wang;

        if (wang = present("wang yuyan", this_object()))
        {
                wang->move(environment());
                message_vision(HIW "$N" HIW "从$n" HIW "身上跌了下来，大惊失"
                               "色，道：段郎，段郎！你怎么死了啊？\n" NOR, wang,
                               this_object());
        }

        ::die();
}

void check_enemys(object wang)
{
        if (! objectp(this_object()) || ! objectp(wang))
                return;

        if (! living(this_object()))
                return;

        if (is_fighting() && random(5) == 0 && living(wang))
        {
                message_vision(HIW "\n王语嫣在$N" HIW "耳边嘀嘀咕咕的说些话。\n"
                               NOR, this_object());
                add_temp("apply/damage", 10);
                add_temp("apply/defense", 10);
                receive_curing("qi", 300);
                receive_curing("jing", 150);
                receive_heal("qi", 300);
                receive_heal("jing", 150);
        }

        if (! is_fighting())
        {
                set_temp("apply/damage", 50);
                set_temp("apply/defense", 50);
                if (! living(wang))
                {
                        command("say 这下好了，我的语嫣妹子不会受惊了。");
                        return;
                }
                message_vision(HIW "$n" HIW "对$N" HIW "道：好了，敌人退了，我"
                               "下来吧。\n$N" HIW "这才恋恋不舍的把$n" HIW "放"
                               "了下来。\n" NOR, this_object(), wang);
                wang->move(environment(this_object()));
                return;
        }

        remove_call_out("check_enemys");
        call_out("check_enemys", 1, wang);
}
