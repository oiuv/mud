// hanwenchong.c 韩文冲

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("韩文冲", ({ "han wenchong", "han", "wenchong"}));
  	set("long", "此人本是洛阳韩家韩五娘门下，由于和镇远镖\n"
                    "局总镖头王维扬及其两个儿子交情甚笃，所以\n"
                    "过来帮助王家料理镖局的事务。他书生打扮，\n"
                    "身穿白布长袍，相貌俊雅，再看他双手上青筋\n"
                    "爆出，手指黝黑犹如精铁一般，便知手上功夫\n"
                    "非同一般。\n" );
	set("title", "镇远镖局镖师");
  	set("gender", "男性");
  	set("age", 35);
	set("class", "fighter");
        set("attitude", "peaceful");
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 1000);
        set("max_jing", 1000);
        set("neili", 1000);
        set("max_neili", 1000);
        set("jiali", 20);
        set("combat_exp", 150000);

  	set_skill("parry", 60);
  	set_skill("force", 60);
  	set_skill("bagua-xinfa", 60);
  	set_skill("dodge", 60);
  	set_skill("bagua-bu", 60);
  	set_skill("strike", 60);
  	set_skill("bagua-zhang", 60);
  	set_skill("cuff", 60);
  	set_skill("bagua-quan", 60);
  	set_skill("literate", 40);

	map_skill("dodge", "bagua-bu");
	map_skill("force", "bagua-xinfa");
	map_skill("strike", "bagua-zhang");
	map_skill("cuff", "bagua-quan");
	map_skill("parry", "bagua-quan");

	prepare_skill("cuff", "bagua-quan");
	prepare_skill("strike", "bagua-zhang");

  	setup();

  	carry_object("/clone/misc/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("say 我不收徒，你找其它镖师去。 ");
        return;
}
