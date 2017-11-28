#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("流云使", ({ "liuyun shi", "liuyun", "shi" }));
        set("long", "一个四十多岁的中年男子，装束奇异，不像\n"
                    "普通的中土人士。这便是波斯明教总教教主\n"
                    "座下排名三百七十四的流云使。\n");
        set("title", HIB "波斯总教教主座下" NOR);
        set("nickname", HIY "云风月三使" NOR);
        set("gender", "男性");
        set("age", 47);
        set("attitude", "friendly");
        set("shen_type", 1);

        set("per", 23);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("max_qi", 4000);
        set("max_jing", 1800);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);
        set("combat_exp", 1200000);

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "sword.xiyan" :),
                (: perform_action, "sword.guanghua" :),
                (: perform_action, "sword.lianxin" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        set_skill("literate", 100);
        set_skill("sanscrit", 300);
        set_skill("force", 230);
        set_skill("dodge", 230);
        set_skill("unarmed", 230);
        set_skill("parry", 230);
        set_skill("finger", 230);
        set_skill("strike", 230);
        set_skill("sword", 230);
        set_skill("shenghuo-ling", 250);
        set_skill("tougu-zhen", 250);
        set_skill("yinfeng-dao", 250);
        set_skill("shenghuo-xinfa", 250);
        set_skill("qiankun-danuoyi", 250);

        map_skill("dodge", "qiankun-danuoyi");
        map_skill("force", "shenghuo-xinfa");
        map_skill("finger", "tougu-zhen");
        map_skill("strike", "yinfeng-dao");
        map_skill("parry", "qiankun-danuoyi");
        map_skill("sword", "shenghuo-ling");

        prepare_skill("strike", "yinfeng-dao");
        prepare_skill("finger", "tougu-zhen");

        create_family("波斯明教总舵", 32, "弟子");

        setup();
        carry_object("/d/tulong/yitian/npc/obj/jiaofu")->wear();
        carry_object("/d/tulong/tulong/obj/ling1")->wield();
}
void init()
{
        object me;

        me = this_player();

        if (! interactive(me))
                return;

        if (living(this_object()) && present("yitian sword", me))
        {
                command("say 咦？倚天剑怎么会在你手里，看来这次中原之行没白跑了！");
                kill_ob(me);
                return;
        }

        if (living(this_object()) && present("tulong blade", me))
        {
                command("say 哼，把屠龙刀交出来，我们已经守侯多时了！");
                kill_ob(me);
                return;
        }

        if (living(this_object()) && present("shenghuo ling", me))
        {
                command("say 咦？你怎么会拿着我教的圣火令？死吧！");
                kill_ob(me);
                return;
        }
}

