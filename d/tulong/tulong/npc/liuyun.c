#include <ansi.h>
#include "bosi.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#define LING    "/clone/lonely/ling1"

void create()
{
        object ob;
        set_name("流云使", ({ "liuyun shi", "liuyun", "shi" }));
        set("long", @LONG
这是一个四十多岁的中年男子，装束奇异，不
像普通的中土人士。这便是波斯明教总教教主
座下排名三百七十四的流云使。
LONG);
        set("title", "波斯总教教主座下");
        set("nickname", HIG "云风月三使" NOR);
        set("gender", "男性");
        set("age", 43);
        set("attitude", "friendly");
        set("shen_type", -1);

        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);        
        set("max_qi", 4500);
        set("max_jing", 3500);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 250);
        set("combat_exp", 2500000);

        set_skill("force", 240);
        set_skill("shenghuo-xinfa", 240);
        set_skill("dodge", 220);
        set_skill("qiankun-danuoyi", 220);
        set_skill("unarmed", 200);
        set_skill("sword", 240);
        set_skill("shenghuo-ling", 240);
        set_skill("parry", 240);
        set_skill("finger", 220);
        set_skill("tougu-zhen", 220);
        set_skill("strike", 220);
        set_skill("yinfeng-dao", 220);
        set_skill("literate", 200);
        set_skill("sanscrit", 200);
        set_skill("martial-cognize", 220);

        map_skill("force", "shenghuo-xinfa");
        map_skill("dodge", "qiankun-danuoyi");
        map_skill("parry", "qiankun-danuoyi");
        map_skill("sword", "shenghuo-ling");
        map_skill("finger", "tougu-zhen");
        map_skill("strike", "yinfeng-dao");

        prepare_skill("strike", "yinfeng-dao");
        prepare_skill("finger", "tougu-zhen");

        create_family("波斯明教总舵", 32, "弟子");

        set("coagents", ({
                ([ "startroom" : "/d/tulong/tulong/haian",
                   "id"        : "huiyue shi" ]),
                ([ "startroom" : "/d/tulong/tulong/haian",
                   "id"        : "miaofeng shi" ]),
        }));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
                (: perform_action, "sword.can" :),
                (: perform_action, "sword.xiyan" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        if (clonep())
        {
                ob = find_object(LING);
                if (! ob) ob = load_object(LING);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new(__DIR__"obj/ling");
                        ob->move(this_object());
                        ob->wield();
                }
        }
        carry_object(__DIR__"obj/bosi")->wear();
}
