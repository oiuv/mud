#include <ansi.h>
#include "gaibang.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include "fight.h"

void create()
{
        set_name("鲁有脚", ({ "lu youjiao", "lu", "youjiao" }));
        set("long", @LONG
鲁有脚虽然武功算不得顶尖高手，可是在江湖
上却颇有声望。因为他在丐帮中有仁有义，行
事光明磊落，深得洪七公的器重。
LONG);
        set("nickname", HIG "掌棒龙头" NOR);
        set("title", "丐帮九袋长老");
        set("gender", "男性");
        set("age", 48);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 4500);
        set("max_jing", 3500);
        set("neili", 4800);
        set("max_neili", 4800);
        set("jiali", 220);
        set("combat_exp", 2500000);
        set("score", 500000);
        set("shen_type", 1);
        
        set_skill("force", 240);
        set_skill("jiaohua-neigong", 220);
        set_skill("huntian-qigong", 240);
        set_skill("dodge", 240);
        set_skill("feiyan-zoubi", 240);
        set_skill("unarmed", 240);
        set_skill("changquan", 220);
        set_skill("jueming-tui", 240);
        set_skill("strike", 240);
        set_skill("tongchui-zhang", 240);
        set_skill("zhenjing-baili", 200);
        set_skill("qianlong-wuyong", 200);
        set_skill("hongjian-yulu", 200);
        set_skill("parry", 240);
        set_skill("staff", 240);
        set_skill("dagou-bang", 240);
        set_skill("jiaohua-bangfa", 240);
        set_skill("begging", 280);
        set_skill("checking", 280);
        set_skill("literate", 220);
        set_skill("martial-cognize", 240);

        set("no_teach", ([
                "dagou-bang"      : "打狗棒法向来只有继位帮主能够学习，要学去找帮主。",
                "zhenjing-baili"  : "这套掌法乃是洪老帮主所赐，我不能轻易传授。",
                "qianlong-wuyong" : "这套掌法乃是洪老帮主所赐，我不能轻易传授。",
                "hongjian-yulu"   : "这套掌法乃是洪老帮主所赐，我不能轻易传授。",
        ]));

        map_skill("force", "huntian-qigong");
        map_skill("unarmed", "jueming-tui");
        map_skill("strike", "tongchui-zhang");
        map_skill("staff", "dagou-bang");
        map_skill("parry", "dagou-bang");
        map_skill("dodge", "feiyan-zoubi");

        prepare_skill("strike", "tongchui-zhang");
        prepare_skill("unarmed", "jueming-tui");

        create_family("丐帮", 18, "长老");

        set("coagents", ({
                ([ "startroom" : "/d/city/gbxiaowu",
                   "id"        : "hong qigong" ]),
        }));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "staff.chan" :),
                (: perform_action, "staff.chuo" :),
                (: perform_action, "staff.feng" :),
                (: perform_action, "staff.ban" :),
                (: perform_action, "staff.tian" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/d/gaibang/npc/obj/cloth")->wear();
        carry_object("/clone/weapon/gangzhang")->wield();
}

void attempt_apprentice(object ob)
{
        string title = ob->query("title");
        int lvl = ob->query("family/beggarlvl");

        if (! permit_recruit(ob))
                return;

        if (ob->query("combat_exp") < 150000)
        {
                command("say 你的江湖经验不够，还是先向各位长老学习吧。");
                return;
        }

        if (ob->query("shen") < 20000)
        {
                command("say 你身为丐帮弟子，竟然不做好事？");
                return;
        }

        if (ob->query("family/beggarlvl") < 4)
        {
                command("say 你在本帮的地位太低，还是先向各位长老学习吧。");
                return;
        }

        if (ob->query_skill("force") < 120)
        {
                command("say 你的内功火候还不够，还是先向各位长老学习吧。");
                return;
        }
        command("nod");
        command("say 以后你就跟着我吧，可别给我生事。");
        command("recruit " + ob->query("id"));

        if (ob->query("class") != "beggar")
                ob->set("class", "beggar");

        if (lvl > 0)
        {
                ob->set("family/beggarlvl", lvl);
                ob->set("title", title);
        }
}

