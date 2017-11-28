#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("石双英", ({ "shi shuangying", "shi", "shuangying" }));
        set("title", "红花会十二当家");
        set("nickname", HIR "鬼见愁" NOR);
        set("long", "鬼见愁石双英在会中坐第十二把交椅，执掌刑\n"
                    "堂，铁面无私，心狠手辣，犯了规条的就是逃\n"
                    "到天涯海角，他也必派人抓来处刑，原来依据\n"
                    "红花会规条，会中兄弟犯了大罪，若是一时胡\n"
                    "涂，此后诚心悔悟，可在开香堂执法之前，自\n"
                    "行用尖刀在大腿上连戳三刀，这三刀须对穿而\n"
                    "过，即所谓“三刀六洞”，然后向该管舵主和\n"
                    "执法香主求恕，有望从轻发落，但若真正罪重\n"
                    "出自不能饶恕。是以红花会数万兄弟，提到鬼\n"
                    "见愁时无不悚然。\n");
        set("gender", "男性");
        set("age", 28);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 3500);
        set("max_qi", 3500);
        set("jing", 2500);
        set("max_jing", 2500);
        set("neili", 1500);
        set("max_neili", 1500);
        set("jiali", 50);
        set("combat_exp", 500000);
        set("score", 10000);

        set_skill("force", 100);
        set_skill("honghua-xinfa", 100);
        set_skill("unarmed", 100);
        set_skill("changquan", 100);
        set_skill("dodge", 100);
        set_skill("yanzi-chuanyun", 100);
        set_skill("staff", 120);
        set_skill("fengmo-zhang", 120);
        set_skill("parry", 100);
        set_skill("martial-cognize", 60);
        set_skill("literate", 100);

        map_skill("force"  , "honghua-xinfa");
        map_skill("staff"  , "fengmo-zhang");
        map_skill("unarmed" , "changquan");
        map_skill("dodge"  , "yanzi-chuanyun");
        map_skill("parry"  , "fengmo-zhang");

        prepare_skill("unarmed", "changquan");

        create_family("红花会", 4, "当家");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "staff.lun" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
        setup();

        carry_object("/clone/misc/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("hmm");
        command("say 你不收徒，你找其余当家的吧。");
}
