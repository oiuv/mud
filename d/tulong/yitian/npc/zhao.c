#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;

void create()
{
        set_name("赵敏", ({ "zhao min", "min", "zhao"}));
        set("title", HIY "大元绍敏郡主" NOR);
        set("long",
"她脸泛红霞，容色丽都。十分美丽之中，更带着三分英气，三分豪态，同
时雍容华贵，自有一副端严之姿，令人肃然起敬，不敢逼视。\n");
        set("gender", "女性");
        set("age", 15);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 30);
        set("str", 15);
        set("int", 25);
        set("con", 25);
        set("dex", 30);

        set("max_qi", 500);
        set("max_jing", 200);
        set("max_neili", 500);
        set("neili", 500);
        set("jiali", 50);
        set("combat_exp", 50000+random(10000));
        set("score", 20000);
        set("chat_chance_combat", 60);
        set("chat_msg_combat", ({
                (: perform_action, "sword.ren" :),
        }) );

        set_skill("force", 80);
        set_skill("dodge", 80);
        set_skill("unarmed", 80);
        set_skill("sword", 80);
        set_skill("liangyi-jian", 80);
        set_skill("huifeng-jian", 80);
        set_skill("taiji-shengong", 90);
        set_skill("changquan", 80);
        set_skill("lingxu-bu", 80);
        map_skill("dodge", "lingxu-bu");
        map_skill("parry", "liangyi-jian");
        map_skill("sword", "liangyi-jian");
        map_skill("unarmed", "changquan");

        set("inquiry", ([
            "张无忌" :  "张公子远在昆仑，不知他近来可好？秋冷春寒，可有寒衣？\n",
            "倚天剑" :  "倚天为天下神兵，怎么，你想要？\n",
        ]));

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/female2-cloth")->wear();
}
void init()
{       
        object ob;
        ob = this_player();
        ::init();

        add_action("do_get","get");
        add_action("do_yun","yun");
        add_action("do_yun","exert");

        remove_call_out("greeting");
        call_out("greeting", 1, ob);
}

int do_yun(string arg)
{
        object obj;

        obj=this_object();
        if (arg == "roar" )
        {
                message_vision(CYN "\n赵敏喝道：无耻贼子，在我这儿由不得你猖狂！\n" NOR,
                                   obj);
                return 1;
        }
        return 0;

}

int do_get(string arg)
{
        object obj, env, shelf;
        string what, where;

        if(!arg) 
        return 0;

        if(sscanf(arg,"%s from %s",what, where) !=2)
        return 0;

        obj=this_object();
        if(where == "shelf")
        {
                message_vision(CYN "\n赵敏喝道：无耻贼子，休得无理！\n" NOR,
                                   obj);

                message_vision(CYN "\n赵敏轻声哼了声，道：要想得到倚天剑也可以，但是首先"
                                   "得比赢(bi)我的手下！\n" NOR,
                                   obj);
                return 1;
        }
        return 0;
}

int accept_fight(object who)
{
        command("say 欺负一个弱小女子算什么，要比和我的手下比(bi)。");
        return 0;
}

int accept_hit(object who)
{
        command("say 欺负一个弱小女子算什么，要比和我的手下比(bi)。");
        return 0;
}

int accept_kill(object who)
{
        command("say 欺负一个弱小女子算什么，要比和我的手下比(bi)。");
        return notify_fail("刹那间你觉得无从下手。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见楼上人影晃动，根本看不清楚。\n");
}

void receive_damage(string type, int n)
{
        return;
}

void receive_wound(string type, int n)
{
        return;
}

void greeting(object ob)
{
        if( !ob || environment(ob) != environment() )
        return;

        if( !userp(ob))
        return;

        message_vision( HIW "$N一上楼来，只见一位明艳少女正座中堂，脸泛红霞，容色丽都。十分美丽\n"+
                            "之中，更带着三分英气，三分豪态，同时雍容华贵，自有一副端严之致，令\n"+
                            "人肃然起敬，不敢逼视。少女身旁地站着几人，衣着各异，但从几人的神态\n"+
                            "和气度看来，无一不是武林高手。中堂摆着一个名贵的红木制剑架，剑架上\n"+
                            "横放着一柄长剑，长剑的剑鞘上赫然写着“" NOR+HIY "倚天" NOR+HIW "”二字。\n" NOR,
                            ob,this_object());

        command("yi");
        command("say 哼，今天来我这里添乱的人还真不少！");
}

