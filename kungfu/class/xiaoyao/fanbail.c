#include <ansi.h>
#include "xiaoyao.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("范百龄", ({ "fan bailing", "fan", "bailing" }));
        set("long", "他是苏星河的二弟子，通晓棋技。\n");
        set("gender", "男性");
        set("title", "逍遥派函谷八友");
        set("nickname", HIR "棋迷" NOR);
        set("age", 53);
        set("class", "shaman");
        set("attitude", "peaceful");
        set("str", 25);
        set("int", 27);
        set("con", 25);
        set("dex", 25);

	set("max_qi", 2800);
	set("max_jing", 2800);
	set("neili", 3600);
	set("max_neili", 3600);
	set("jiali", 100);
	set("combat_exp", 1200000);

        set_skill("force", 180);
        set_skill("xiaoyao-xinfa", 180);
        set_skill("dodge", 160);
        set_skill("feiyan-zoubi", 160);
        set_skill("strike", 160);
        set_skill("panyang-zhang", 160);
        set_skill("hand", 160);
        set_skill("qingyun-shou", 160);
        set_skill("parry", 160);
        set_skill("blade", 160);
        set_skill("ruyi-dao", 160);
        set_skill("chess", 240);
        set_skill("literate", 160);
        set_skill("martial-cognize", 160);

	map_skill("force", "xiaoyao-xinfa");
	map_skill("dodge", "feiyan-zoubi");
	map_skill("hand", "qingyun-shou");
	map_skill("strike", "panyang-zhang");
	map_skill("parry", "panyang-zhang");
	map_skill("blade", "ruyi-dao");

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

        if (ob->query_int() < 27)
        {
                command("sigh");
                command("say 学习棋道要求悟性极高之人，我看你并不适合。");
                return;
        }

        if (ob->query_skill("xiaoyao-xinfa", 1) < 30)
        {
                command("sigh");
                command("say 你连本门的入门心法都没有学好，教我如何收你？");
                return;
        }

        command("say 好吧，既然如此，我就收下你了。");
        command("recruit " + ob->query("id"));
}
