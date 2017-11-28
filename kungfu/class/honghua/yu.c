#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("余鱼同", ({ "yu yutong", "yu","yutong" }));
        set("title", "红花会十四当家");
        set("nickname", HIY "金笛秀才" NOR);
        set("long", "一个长身玉立，眉清目秀，风流英俊的书生。\n"
                    "余鱼同乃江南望族子弟，中过秀才。他父亲\n"
                    "因和一家豪门争一块坟地，官司打得倾家荡\n"
                    "产，又被豪门借故陷害，瘐死狱中。余鱼同\n"
                    "一气出走，得遇机缘，拜马真为师，弃文习\n"
                    "武，回来把士豪刺死，从此亡命江湖，后来\n"
                    "入了红花会。他为人机警灵巧，多识各地乡\n"
                    "谈，在会中任联络四方、刺探讯息之职。\n");
        set("gender", "男性");
        set("class", "scholar");
        set("age", 20);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("per", 27);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("qi", 2800);
        set("max_qi", 2800);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 120);
        set("combat_exp", 1000000);
        set("score", 10000);

        set_skill("force", 140);
        set_skill("taiji-shengong", 140);
        set_skill("unarmed", 140);
        set_skill("xuangong-quan", 140);
        set_skill("dodge", 140);
        set_skill("tiyunzong", 140);
        set_skill("sword", 140);
        set_skill("rouyun-jian", 140);
        set_skill("parry", 140);
        set_skill("throwing", 140);
        set_skill("furong-jinzhen", 140);
        set_skill("martial-cognize", 100);
        set_skill("literate", 200);

        map_skill("force"  , "taiji-shengong");
        map_skill("sword"  , "rouyun-jian");
        map_skill("unarmed" , "xuangong-quan");
        map_skill("dodge"  , "tiyunzong");
        map_skill("parry"  , "rouyun-jian");
        map_skill("throwing"  , "furong-jinzhen");

        prepare_skill("unarmed", "xuangong-quan");

        set("coagents", ({
                ([ "startroom" : "/d/kaifeng/road4",
                   "id"        : "lu feiqing" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷喝道："
                                "阁下请留步，那里下去不得。" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "居然背人下去，到底是什么意思？" NOR,
        ]));

        create_family("红花会", 4, "当家");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.xuan" :),
                (: perform_action, "sword.tao" :),
                (: perform_action, "throwing.xian" :),
                (: exert_function, "shield" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/clone/cloth/jinduan")->wear();
        carry_object("/d/kaifeng/npc/obj/jindi")->wield();
        set_temp("handing", carry_object("/d/kaifeng/npc/obj/jinzhen"));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("en");
        command("say 我不收徒，你找其余几位当家的好了。");
}
