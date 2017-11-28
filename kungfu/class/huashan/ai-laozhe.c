// ai-laozhe.c

inherit NPC;
inherit F_MASTER;

#include <ansi.h>
#include "qizong.h"

void create()
{
	set_name("矮老者", ({ "ai laozhe", "ai" }));
	set("title", HIG"华山第十二代长老"NOR);
	set("long", "他就是华山的长老矮老者。一张严肃"
                    "威严的脸，望而生畏。\n");
	set("gender", "男性");
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 31);
	set("int", 35);
	set("con", 31);
	set("dex", 32);
	set("age", 66);

	set("qi", 4800);
	set("max_qi", 4800);
	set("jing", 2400);
	set("max_jing", 2400);
	set("neili", 5200);
	set("max_neili", 5200);
	set("jiali", 70);

	set("combat_exp", 1900000);
	set("score", 70000);

	set_skill("cuff", 190);
	set_skill("force", 210);
	set_skill("blade", 180);
	set_skill("sword", 220);
	set_skill("dodge", 190);
	set_skill("parry", 200);
	set_skill("strike", 190);
	set_skill("zixia-shengong", 210);
	set_skill("huashan-xinfa", 210);
	set_skill("poyu-quan", 190);
	set_skill("fanliangyi-dao", 180);
	set_skill("huashan-jian", 220);
	set_skill("hunyuan-zhang", 190);
        set_skill("feiyan-huixiang",190);
	set_skill("literate", 140);

	prepare_skill("cuff", "poyu-quan");
	prepare_skill("strike", "hunyuan-zhang");

	map_skill("cuff", "poyu-quan");
	map_skill("force", "zixia-shengong");
        map_skill("dodge", "feiyan-huixiang");
        map_skill("parry", "fanliangyi-dao");
	map_skill("blade", "fanliangyi-dao");
	map_skill("sword", "huashan-jian");
	map_skill("strike", "hunyuan-zhang");

	create_family("华山派", 12, "弟子");

	set("chat_chance_combat", 60);
	set("chat_msg_combat", ({
		(: perform_action, "blade.san" :),
		(: exert_function, "recover" :),
	}) );

	setup();
	carry_object("/clone/misc/cloth")->wear();
	carry_object("/clone/weapon/gangdao")->wield();
}

void attempt_apprentice(object ob)
{
        command("say 我不收徒弟！");
        return;
/*
        string ob_fam;

        ob_fam = ob->query("family/family_name");
        if (! permit_recruit(ob))
                return;

        if (ob_fam == "华山派" && ob->query_skill("zixia-shengong", 1) < 100)
	{
		command("say 我看你的紫霞神功还没学到家吧，本派有本的"
                        "紫霞秘籍，你可曾研读？");
		return;
	}

        if ((int)ob->query_skill("sword", 1) < 120)
	{
                command("say 你的剑法还没学到家，快回去练好基本剑法。");
		return;
	}

        if ((int)ob->query_skill("huashan-jian", 1) < 150)
	{
                command("say 华山剑法是本派弟子必须精通的武技，多练练"
                        "本门剑术。");
		return;
	}

        if ((int)ob->query("shen") < 20000)
	{
		command("say 你这人行侠长义的事情还做得不够。");
		return;
	}

        if (ob_fam == "华山剑宗")
        {
                command("say 你看看你，也成了剑气之争的受害者，好好研习武功，少些纷争。");
                ob->delete("family");
        }

	command("say 我收下你了，不要丢我们华山派的脸。");
	command("recruit " + ob->query("id"));
	if((string)ob->query("class") != "fighter")
		ob->set("class", "fighter");
*/
}
