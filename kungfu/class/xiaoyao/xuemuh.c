#include <ansi.h>
#include "xiaoyao.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

void create()
{
        set_name("薛慕华", ({ "xue muhua", "xue", "muhua" }));
        set("long", "他就是号称阎王敌的神医薛慕华，据说他\n"
                    "精通医理，可以起死回生。\n");
        set("gender", "男性");
        set("title", "逍遥派函谷八友");
        set("nickname", HIM "阎王敌" NOR);
        set("age", 50);
        set("class", "shaman");
        set("attitude", "peaceful");
        set("str", 25);
        set("int", 27);
        set("con", 25);
        set("dex", 25);

        set("inquiry", ([
                "疗伤" : "疗…疗什么伤？我逍遥派医术深博，学好了自己给自己疗。\n",
        ]));

	set("max_qi", 3000);
	set("max_jing", 3000);
	set("neili", 3500);
	set("max_neili", 3500);
	set("jiali", 100);
	set("combat_exp", 1000000);

        set_skill("force", 160);
        set_skill("xiaoyao-xinfa", 160);
        set_skill("dodge", 140);
        set_skill("feiyan-zoubi", 140);
        set_skill("strike", 160);
        set_skill("panyang-zhang", 160);
        set_skill("hand", 160);
        set_skill("qingyun-shou", 160);
        set_skill("parry", 160);
        set_skill("blade", 140);
        set_skill("ruyi-dao", 140);
        set_skill("xiaoyao-qixue", 220);
        set_skill("medical", 220);
        set_skill("literate", 120);
        set_skill("martial-cognize", 140);

	map_skill("force", "xiaoyao-xinfa");
	map_skill("dodge", "feiyan-zoubi");
	map_skill("hand", "qingyun-shou");
	map_skill("strike", "panyang-zhang");
	map_skill("parry", "panyang-zhang");
	map_skill("blade", "ruyi-dao");
        map_skill("medical", "xiaoyao-qixue");

        prepare_skill("hand", "qingyun-shou");
        prepare_skill("strike", "panyang-zhang");

        create_family("逍遥派", 3, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.zhuo" :),
                (: perform_action, "strike.pan" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query_int() < 26)
        {
                command("sigh");
                command("say 虽然都说勤能补拙，可是……我看你还是走吧。");
                return;
        }

        if (ob->query_skill("xiaoyao-xinfa", 1) < 30)
        {
                command("sigh");
                command("say 你连本门的入门心法都没有学好，教我如何收你？");
                return;
        }

        command("say 好吧，我就收下你了，以后要多为逍遥派出力啊。");
        command("recruit " + ob->query("id"));
}
