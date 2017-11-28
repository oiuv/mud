#include <ansi.h>
#include "xiaoyao.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("吴领军", ({ "wu lingjun", "wu", "lingjun" }));
        set("long", "他是苏星河的四弟子，丹青妙技已尽得其真传。\n");
        set("gender", "男性");
        set("title", "逍遥派函谷八友");
        set("nickname", HIC "丹青名手" NOR);
        set("age", 47);
        set("class", "shaman");
        set("attitude", "peaceful");
        set("str", 25);
        set("int", 27);
        set("con", 25);
        set("dex", 25);

	set("max_qi", 2400);
	set("max_jing", 2400);
	set("neili", 3000);
	set("max_neili", 3000);
	set("jiali", 100);
	set("combat_exp", 1200000);

        set_skill("force", 140);
        set_skill("xiaoyao-xinfa", 140);
        set_skill("dodge", 120);
        set_skill("feiyan-zoubi", 120);
        set_skill("strike", 120);
        set_skill("panyang-zhang", 120);
        set_skill("hand", 120);
        set_skill("qingyun-shou", 120);
        set_skill("parry", 120);
        set_skill("blade", 120);
        set_skill("ruyi-dao", 120);
        set_skill("drawing", 240);
        set_skill("literate", 140);
        set_skill("martial-cognize", 120);

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

        if (ob->query_int() < 26)
        {
                command("say 你悟性太差，怎么学习丹青妙技？");
                return;
        }

        if (ob->query_skill("xiaoyao-xinfa", 1) < 20)
        {
                command("say 你还是先将本门入门心法学好吧。");
                return;
        }

        command("say 好吧，既然如此，我就收下你了。");
        command("recruit " + ob->query("id"));
}
