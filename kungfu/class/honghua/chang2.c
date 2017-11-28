#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("常伯志", ({ "chang bozhi", "chang", "bozhi" }));
        set("title", "红花会六当家");
        set("nickname", HIR "黑无常" NOR);
        set("long", "他身材又高又瘦，脸色蜡黄，眼睛凹进，眼\n"
                    "角上有一粒黑痣，眉毛斜斜的倒垂下来，形\n"
                    "相甚是可怖。他是青城派慧侣道人的徒弟。\n"
                    "黑沙掌的功夫，江湖上无人能敌。黑白无常\n"
                    "两兄弟是川江上著名的侠盗，一向劫富济贫，\n"
                    "不过心狠手辣，因此得了这难听的外号。\n");
        set("gender", "男性");
        set("age", 32);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 3000);
        set("max_qi", 3000);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 120);
        set("combat_exp", 1000000);
        set("score", 10000);

        set_skill("force", 140);
        set_skill("honghua-xinfa", 140);
        set_skill("qingcheng-neigong", 140);
        set_skill("strike", 160);
        set_skill("heisha-zhang", 160);
        set_skill("dodge", 160);
        set_skill("yanzi-chuanyun", 160);
        set_skill("sword", 140);
        set_skill("songfeng-jian", 140);
        set_skill("parry", 160);
        set_skill("martial-cognize", 120);
        set_skill("literate", 140);

        map_skill("force"  , "qingcheng-neigong");
        map_skill("sword"  , "songfeng-jian");
        map_skill("strike" , "heisha-zhang");
        map_skill("dodge"  , "yanzi-chuanyun");
        map_skill("parry"  , "heisha-zhang");

        prepare_skill("strike", "heisha-zhang");

        set("no_teach", ([
                "qingcheng-neigong" : "这内功没得啥子用，你给老子好生练掌法就行了。",
        ]));

        create_family("红花会", 4, "当家");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "strike.cui" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
        setup();

        carry_object("/clone/misc/cloth")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 5000)
        {
                command("say 你非我侠义中人，我不能收你。");
                return;
        }

        if ((int)me->query_skill("honghua-xinfa", 1) < 50)
        {
                command("say 你把本门的心法练好了再来。");
                return;
        }

        command("heihei");
        command("say 以后你就跟着老子吧。");
        command("recruit " + me->query("id"));
}
