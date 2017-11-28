#include <ansi.h>
#include "xiaoyao.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

void create()
{
	set_name("康广陵", ({ "kang guangling", "kang", "guangling" }));
	set("long", "只见他高额凸颡，容貌奇古，笑眯眯的脸\n"
                    "色极为和谟，手中抱着一具瑶琴。\n");
	set("gender", "男性");
        set("title", "逍遥派函谷八友");
	set("nickname", YEL "琴颠" NOR);
	set("age", 58);
	set("attitude", "friendly");
	set("class", "scholar");
	set("shen_type", 1);
	set("str", 28);
	set("int", 28);
	set("con", 28);
	set("dex", 38);
	
	set("max_qi", 3500);
	set("max_jing", 3000);
	set("neili", 4000);
	set("max_neili", 4000);
	set("jiali", 120);
	set("combat_exp", 1500000);

        set_skill("force", 180);
        set_skill("xiaoyao-xinfa", 180);
        set_skill("dodge", 160);
        set_skill("feiyan-zoubi", 160);
        set_skill("strike", 160);
        set_skill("panyang-zhang", 160);
        set_skill("hand", 160);
        set_skill("qingyun-shou", 160);
        set_skill("parry", 160);
        set_skill("blade", 180);
        set_skill("ruyi-dao", 180);
        set_skill("literate", 140);
        set_skill("tanqin-jifa", 220);
        set_skill("qiuyue-lai", 220);
        set_skill("martial-cognize", 160);

	map_skill("force", "xiaoyao-xinfa");
	map_skill("dodge", "feiyan-zoubi");
	map_skill("hand", "qingyun-shou");
	map_skill("strike", "panyang-zhang");
	map_skill("parry", "ruyi-dao");
	map_skill("blade", "ruyi-dao");
        map_skill("tanqin-jifa", "qiuyue-lai");

        prepare_skill("hand", "qingyun-shou");
        prepare_skill("strike", "panyang-zhang");

	create_family("逍遥派", 3, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.zhuo" :),
                (: perform_action, "strike.pan" :),
                (: perform_action, "blade.ruyi" :),
                (: exert_function, "recover" :),
        }));

	setup();
	carry_object("/clone/cloth/cloth")->wear();
	carry_object("/clone/weapon/blade")->wield();
        set_temp("handing", carry_object("/d/changan/npc/obj/muqin"));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query_int() < 28)
        {
                command("hmm");
                command("say 你的悟性太差，怎么学我的琴技？");
                return;
        }

        if (ob->query_skill("xiaoyao-xinfa", 1) < 30)
        {
                command("sigh");
                command("say 你连本门的入门心法都没有学好，教我如何收你？");
                return;
        }

	command("say 好吧，我收你为徒，多学些东西，别整天就想着练武。");
	command("recruit " + ob->query("id"));
}
